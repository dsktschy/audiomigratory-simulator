import $ from 'jquery';
import google from 'google';
import _amsData from './ams-data';
import _amsDataFake from './ams-data-fake';
import amsModel from './ams-model';
import AMSMap from './classes/ams-map';
import AMSMarker from './classes/ams-marker';
import AMSPlaylist from './classes/ams-playlist';
import amsIcons from './ams-icons';

const
  /** モジュール名 */
  MOD_NAME = 'ams',
  /** HTML */
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`,
  /** ショートカット */
  GM = google.maps,
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
  init, $cache, set$cache, map, playlists, getPosition, amsData, onGetData,
  onSuccessToGetPosition, onErrorToGetPosition, onClickPlayModeContent, marker,
  onClickMap, onPlaylistDomready, onClickPlaylistJacket, onClickTrackJacket,
  onClickNoteIcon, selectedPlaylist, selectedTrack, isPlayMode, onMoving,
  onTrackDomready, onMovingEnd, readyPlaylistCount, beforeMovingMap,
  playlistTotal, readyTrackCount, trackTotal, onAllDomready,
  preselectedPlaylist;

/** プレイリスト配列 */
playlists = [];
/** 選択中のプレイリスト */
selectedPlaylist = null;
/** 選択中のトラック */
selectedTrack = null;
/** 再生モードかどうか */
isPlayMode = false;
/** 自動再生前の情報 */
beforeMovingMap = {
  markerPosition: null,
  mapCenter: null,
  mapZoom: null,
};
/** DOM読み込みが完了したプレイリストの数 */
readyPlaylistCount = 0;
/** DOM読み込みが完了したトラックの数 */
readyTrackCount = 0;
/** iframeで指定されたプレイリスト */
preselectedPlaylist = null;

/**
 * jqueryオブジェクトを保持
 */
set$cache = () => {
  $cache = {
    self: $(`#${MOD_NAME}`),
    window: $(window),
    iframe: $('#ams-iframe', parent.document),
  };
};

/**
 * mapクリックイベントのハンドラ
 * @param {Object} event
 */
onClickMap = (event) => {
  if (beforeMovingMap.markerPosition) {
    marker.cancelMoving();
    beforeMovingMap.markerPosition = null;
    beforeMovingMap.mapCenter = null;
    beforeMovingMap.mapZoom = null;
  }
  marker.setPosition(event.latLng);
  if (!isPlayMode) {
    return;
  }
  for (let track of selectedPlaylist.tracks) {
    track.applyVolume(track.calculateVolume(marker.getPosition()), true);
  }
};

/**
 * 現在地取得成功時のコールバック
 * @param {Object}
 */
onSuccessToGetPosition = ({coords: {latitude, longitude}}) => {
  var latLng;
  latLng = new GM.LatLng(latitude, longitude);
  map.setCenter(latLng);
  marker.setPosition(latLng);
  marker.setVisible(true);
  amsModel.getData(latitude, longitude);
};

/**
 * 現在地取得失敗時のコールバック
 * @param {Object} e
 */
onErrorToGetPosition = (e) => {
  marker.setVisible(true);
  amsModel.getData(map.getCenter().lat(), map.getCenter().lng());
  console.log(e);
};

/**
 * Playlistオブジェクトcontentプロパティ描画完了時のハンドラ
 * @param {Object} playlist
 */
onPlaylistDomready = (playlist) => {
  playlist.closeDetail();
  readyPlaylistCount++;
  if (readyPlaylistCount === playlistTotal && readyTrackCount === trackTotal) {
    $cache.window.trigger('all-domready');
  }
};

/**
 * Trackオブジェクトcontentプロパティ描画完了時のハンドラ
 * @param {Object} track
 */
onTrackDomready = (track) => {
  track.closeDetail();
  track.setVisible(false);
  track.circle.setVisible(false);
  readyTrackCount++;
  if (readyPlaylistCount === playlistTotal && readyTrackCount === trackTotal) {
    $cache.window.trigger('all-domready');
  }
};

/**
 * 全てのPlaylist,Trackオブジェクトのcontentプロパティ描画が完了した時のハンドラ
 */
onAllDomready = () => {
  if (!preselectedPlaylist) {
    return;
  }
  onClickPlaylistJacket(preselectedPlaylist);
  onClickNoteIcon();
};

/**
 * Playlistジャケットクリック時のハンドラ
 *   選択中PlaylistをクリックされたPlaylistに切り替える
 * @param {Object} playlist
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
 * Trackジャケットクリック時のハンドラ
 *   選択中TrackをクリックされたTrackに切り替える
 * @param {Object} track
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
 * Playlist音符アイコンクリック時のハンドラ
 *   再生モードに切り替える
 *   MarkerがどのTrackも再生されない位置にある場合は全トラックを自動再生する
 */
onClickNoteIcon = () => {
  var vol, totalVol;
  for (let playlist of playlists) {
    playlist.setVisible(false);
  }
  totalVol = 0;
  for (let track of selectedPlaylist.tracks) {
    track.setVisible(true);
    track.circle.setVisible(true);
    vol = track.calculateVolume(marker.getPosition());
    track.applyVolume(vol, true);
    totalVol += vol;
  }
  selectedPlaylist.openPlayModeContent();
  AMSPlaylist.openPlayModeContent();
  isPlayMode = true;
  if (totalVol) {
    return false;
  }
  beforeMovingMap.markerPosition = marker.getPosition();
  beforeMovingMap.mapCenter = map.getCenter();
  beforeMovingMap.mapZoom = map.getZoom();
  selectedPlaylist.cancelAllTracksFading();
  marker.cancelMoving();
  marker.moveBetween(
    selectedPlaylist.calculateEndPosition(true),
    selectedPlaylist.calculateEndPosition(false),
    selectedPlaylist.getAllTrackPositions(),
    selectedPlaylist.convertVehicleToSpeed(),
    onMoving,
    onMovingEnd
  );
  map.setCenter(selectedPlaylist.getPosition());
  map.setZoom(selectedPlaylist.convertVehicleToZoom());
  return false;
};

/**
 * Marker自動移動時の1ループごとに実行される処理
 */
onMoving = () => {
  for (let track of selectedPlaylist.tracks) {
    track.applyVolume(track.calculateVolume(marker.getPosition()), false);
  }
};

/**
 * プレイモード時用の要素をクリックした時のハンドラ
 *   再生モードから抜ける
 */
onClickPlayModeContent = () => {
  if (!isPlayMode) {
    return;
  }
  if (beforeMovingMap.markerPosition) {
    marker.cancelMoving();
    marker.setPosition(beforeMovingMap.markerPosition);
    map.setCenter(beforeMovingMap.mapCenter);
    map.setZoom(beforeMovingMap.mapZoom);
    beforeMovingMap.markerPosition = null;
    beforeMovingMap.mapCenter = null;
    beforeMovingMap.mapZoom = null;
  }
  for (let track of selectedPlaylist.tracks) {
    track.setVisible(false);
    track.circle.setVisible(false);
    track.applyVolume(0, true);
  }
  for (let playlist of playlists) {
    playlist.setVisible(true);
  }
  selectedPlaylist.closePlayModeContent();
  AMSPlaylist.closePlayModeContent();
  if (selectedTrack) {
    selectedTrack.closeDetail();
    selectedTrack = null;
  }
  isPlayMode = false;
  return false;
};

/**
 * Markerの自動移動終了時に実行される処理
 */
onMovingEnd = onClickPlayModeContent;

/**
 * データ取得完了時のコールバック
 */
onGetData = () => {
  var data, preselectedPlaylistID;
  data = amsModel.getResult();
  preselectedPlaylistID = $cache.iframe.length
    ? $cache.iframe.data('playlist-id') : '';
  playlistTotal = data.playlists.length;
  trackTotal = 0;
  for (let _data of data.playlists) {
    var playlist;
    playlist = new AMSPlaylist(_data);
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
    trackTotal += playlist.tracks.length;
    if (playlist.id === `${preselectedPlaylistID}`) {
      preselectedPlaylist = playlist;
    }
  }
};

/**
 * 位置情報を取得してコールバックに渡す
 *   iframeからリクエストされている場合はiframeの属性から取得
 *   属性が不正または直接リクエストされた場合は現在地を取得
 *   現在地が取得できない場合はデフォルトの位置情報を使用
 * @param {Function} onSuccess
 * @param {Function} onError
 */
getPosition = (onSuccess, onError) => {
  var latitude, longitude;
  if ($cache.iframe.length) {
    latitude = parseFloat($cache.iframe.data('lat'));
    longitude = parseFloat($cache.iframe.data('lng'));
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
 * @param {Object} $wrapper
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
  AMSPlaylist.appendPlayModeContentTo($cache.self);
  AMSPlaylist.closePlayModeContent();
  map.addListener('click', onClickMap);
  AMSPlaylist.addListnerToPlayModeContent('click', onClickPlayModeContent);
  $cache.window.on({
    'get-data': onGetData,
    'all-domready': onAllDomready,
  });
  getPosition(onSuccessToGetPosition, onErrorToGetPosition);
};

export default {
  init,
};
