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
  onTrackDomready, onMovingEnd, positionBeforeMoving;

/** プレイリスト配列 */
playlists = [];
/** 選択中のプレイリスト */
selectedPlaylist = null;
/** 選択中のトラック */
selectedTrack = null;
/** 再生モードかどうか */
isPlayMode = false;
/** 自動再生前のマーカー位置 */
positionBeforeMoving = null;

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
  if (positionBeforeMoving) {
    marker.cancelMoving();
    positionBeforeMoving = null;
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
 */
onErrorToGetPosition = (e) => {
  marker.setVisible(true);
  amsModel.getData(map.getCenter().lat(), map.getCenter().lng());
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
  positionBeforeMoving = marker.getPosition();
  marker.cancelMoving();
  marker.moveBetween(
    selectedPlaylist.calculateEndPosition(true),
    selectedPlaylist.calculateEndPosition(false),
    selectedPlaylist.getAllTrackPositions(),
    selectedPlaylist.convertVehicleToSpeed(),
    onMoving,
    onMovingEnd
  );
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
 * Markerの自動移動終了時に実行される処理
 */
onMovingEnd = () => {
  marker.setPosition(positionBeforeMoving);
  positionBeforeMoving = null;
  for (let track of selectedPlaylist.tracks) {
    track.applyVolume(track.calculateVolume(positionBeforeMoving), true);
  }
};

/**
 * プレイモード時用の要素をクリックした時のハンドラー
 *   再生モードから抜ける
 */
onClickPlayModeContent = () => {
  if (!isPlayMode) {
    return;
  }
  if (positionBeforeMoving) {
    marker.cancelMoving();
    marker.setPosition(positionBeforeMoving);
    positionBeforeMoving = null;
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
 * データ取得完了時のコールバック
 */
onGetData = (event, data) => {
  if (!parseInt(data.hits, 10)) {
    console.log('json.result.hits: 0');
    return;
  }
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
  AMSPlaylist.appendPlayModeContentTo($cache.self);
  AMSPlaylist.closePlayModeContent();
  map.addListener('click', onClickMap);
  AMSPlaylist.addListnerToPlayModeContent('click', onClickPlayModeContent);
  $cache.window.on('get-data', onGetData);
  getPosition(onSuccessToGetPosition, onErrorToGetPosition);
};

export default {
  init,
};
