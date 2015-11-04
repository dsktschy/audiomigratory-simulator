import $ from 'jquery';
import google from 'google';
import _amsData from './ams-data';
import _amsDataFake from './ams-data-fake';
import amsModel from './ams-model';
import AMSMap from './ams-map';
import AMSMarker from './ams-marker';
import Playlist from './ams-playlist';
import amsIcons from './ams-icons';

const
  /** モジュール名 */
  MOD_NAME = 'ams',
  /** HTML */
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`,
  /** ショートカット */
  GM = google.maps,
  /** ショートカット */
  GET_DISTANCE_BETWEEN = GM.geometry.spherical.computeDistanceBetween,
  /** 現在地取得時のタイムアウト時間(msec) */
  CURRENT_POS_TIMEOUT = 10000,
  /** 現在地情報のキャッシュ有効時間 */
  CURRENT_POS_MAXIMUM_AGE = 0,
  /** 現在地取得時のオプション */
  POS_OPT_MAP = {
    enableHighAccuracy: true,
    timeout: CURRENT_POS_TIMEOUT,
    maximumAge: CURRENT_POS_MAXIMUM_AGE,
  },
  /** APIの代わりにFAKE_DATAを使用するかどうか */
  IS_FAKE = true;

var
  init, $cache, set$cache, map, marker, playlists, getPosition, amsData,
  onSuccessToGetPosition, onErrorToGetPosition, onClickMarker, onApplyData,
  onClickMap, onPlaylistDomready, onClickPlaylistJacket, onClickTrackJacket,
  onClickNoteIcon, selectedPlaylist, selectedTrack, isPlayMode,
  onTrackDomready;

/** プレイリスト配列 */
playlists = [];
/** 選択中のプレイリスト */
selectedPlaylist = null;
/** 選択中のトラック */
selectedTrack = null;
/** 再生モードかどうか */
isPlayMode = false;

/**
 * jqueryオブジェクトを保持
 */
set$cache = () => {
  $cache = {
    self: $(`#${MOD_NAME}`),
    window: $(window),
  };
};

/**
 * mapクリックイベントのハンドラー
 */
onClickMap = (event) => {
  var distance;
  marker.setPosition(event.latLng);
  if (!isPlayMode) {
    return;
  }
  for (let track of selectedPlaylist.tracks) {
    distance = GET_DISTANCE_BETWEEN(marker.getPosition(), track.getPosition());
    track.apply(distance);
  }
};

/**
 * 現在地取得成功時のコールバック
 */
onSuccessToGetPosition = ({coords: {latitude, longitude}}) => {
  var latLng;
  latLng = new GM.LatLng(latitude, longitude);
  map.setCenter(latLng);
  marker.setPosition(latLng);
  marker.setVisible(true);
  amsModel.applyData(latitude, longitude);
};

/**
 * 現在地取得失敗時のコールバック
 */
onErrorToGetPosition = (e) => {
  marker.setVisible(true);
  amsModel.applyData(map.getCenter().lat(), map.getCenter().lng());
  console.log(e);
};

/**
 * Playlistオブジェクトcontentプロパティ描画完了時のハンドラー
 */
onPlaylistDomready = (playlist) => {
  playlist.closeDetail();
};

/**
 * Trackオブジェクトcontentプロパティ描画完了時のハンドラー
 */
onTrackDomready = (track) => {
  track.closeDetail();
  track.setVisible(false);
  track.circle.setVisible(false);
};

/**
 * Playlistジャケットクリック時のハンドラー
 *   選択中PlaylistをクリックされたPlaylistに切り替える
 */
onClickPlaylistJacket = (playlist) => {
  if (selectedPlaylist === playlist) {
    return;
  }
  if (selectedPlaylist) {
    selectedPlaylist.closeDetail();
  }
  selectedPlaylist = playlist;
  selectedPlaylist.openDetail();
};

/**
 * Trackジャケットクリック時のハンドラー
 *   選択中TrackをクリックされたTrackに切り替える
 */
onClickTrackJacket = (track) => {
  if (selectedTrack === track) {
    return;
  }
  if (selectedTrack) {
    selectedTrack.closeDetail();
  }
  selectedTrack = track;
  selectedTrack.openDetail();
};

/**
 * Playlist音符アイコンクリック時のハンドラー
 *   再生モードに切り替える
 */
onClickNoteIcon = () => {
  var distance;
  for (let playlist of playlists) {
    playlist.setVisible(false);
  }
  for (let track of selectedPlaylist.tracks) {
    track.setVisible(true);
    track.circle.setVisible(true);
    distance = GET_DISTANCE_BETWEEN(marker.getPosition(), track.getPosition());
    track.apply(distance);
  }
  selectedPlaylist.openPlayModeContent();
  isPlayMode = true;
  return false;
};

/**
 * markerクリックイベントのハンドラー
 *   再生モードから抜ける
 */
onClickMarker = () => {
  if (!isPlayMode) {
    return;
  }
  for (let track of selectedPlaylist.tracks) {
    track.setVisible(false);
    track.circle.setVisible(false);
    track.apply(null);
  }
  for (let playlist of playlists) {
    playlist.setVisible(true);
  }
  selectedPlaylist.closePlayModeContent();
  if (selectedTrack) {
    selectedTrack.closeDetail();
    selectedTrack = null;
  }
  isPlayMode = false;
  return false;
};

/**
 * データ取得完了時のコールバック
 */
onApplyData = (event, data) => {
  if (!parseInt(data.hits, 10)) {
    console.log('json.result.hits: 0');
    return;
  }
  for (let _data of data.playlists) {
    var playlist;
    playlist = new Playlist(_data);
    playlist.addListener('domready', onPlaylistDomready.bind(null, playlist));
    playlist.addListnerToJacket(
      'click',
      onClickPlaylistJacket.bind(null, playlist)
    );
    playlist.addListnerToNoteIcon('click', onClickNoteIcon);
    playlist.open(map);
    playlist.appendPlayModeContentTo($cache.self);
    playlist.closePlayModeContent();
    for (let track of playlist.tracks) {
      track.addListener('domready', onTrackDomready.bind(null, track));
      track.addListnerToJacket(
        'click',
        onClickTrackJacket.bind(null, track)
      );
      track.open(map);
      track.circle.open(map);
    }
    playlists.push(playlist);
  }
};

/**
 * 位置情報を取得してコールバックに渡す
 *   iframeからリクエストされている場合はiframeの属性から取得
 *   属性が不正または直接リクエストされた場合は現在地を取得
 *   現在地が取得できない場合はデフォルトの位置情報を使用
 */
getPosition = (onSuccess, onError) => {
  var $iframe, latitude, longitude;
  $iframe = $('#ams-iframe', parent.document);
  if ($iframe.length) {
    latitude = parseFloat($iframe.data('lat'));
    longitude = parseFloat($iframe.data('lng'));
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onSuccess({coords: {latitude, longitude}});
      return;
    }
  }
  if (!navigator.geolocation) {
    onError('Geolocation is not supported by this browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, POS_OPT_MAP);
};

/**
 * module起動
 * @exports
 */
init = ($wrapper) => {
  $wrapper.append(HTML);
  set$cache();
  amsData = IS_FAKE ? _amsDataFake : _amsData;
  amsData.init();
  amsModel.init(amsData);
  amsIcons.init($cache.self);
  map = new AMSMap($cache.self);
  marker = new AMSMarker(map);
  marker.setVisible(false);
  map.addListener('click', onClickMap);
  marker.addListener('click', onClickMarker);
  $cache.window.on('apply-data', onApplyData);
  getPosition(onSuccessToGetPosition, onErrorToGetPosition);
};

export default {
  init,
};
