import $ from 'jquery';
import google from 'google';
import _amsData from './ams-data';
import _amsDataFake from './ams-data-fake';
import amsModel from './ams-model';
import AMSMap from './ams-map';
import AMSMarker from './ams-marker';
import Playlist from './ams-playlist';
import amsIcons from './ams-icons';
import amsInfo from './ams-info';

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
  init, jqueryMap, setJqueryMap, map, marker, playlists, getCurrPos, amsData,
  onSuccessToGetCurrPos, onErrorToGetCurrPos, onClickMarker, onApplyData,
  onClickMap, onDomready, onClickJacket, onClickNoteIcon;

/**
 * プレイリスト配列
 */
playlists = [];

/**
 * jqueryオブジェクトを保持
 */
setJqueryMap = () => {
  jqueryMap = {
    [`$${MOD_NAME}`]: $(`#${MOD_NAME}`),
  };
};

/**
 * mapクリックイベントのハンドラー
 */
onClickMap = (event) => {
  marker.setPosition(event.latLng);
};

/**
 * markerクリックイベントのハンドラー
 */
onClickMarker = () => {

};

/**
 * 現在地取得成功時のコールバック
 */
onSuccessToGetCurrPos = ({coords: {latitude, longitude}}) => {
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
onErrorToGetCurrPos = (e) => {
  marker.setVisible(true);
  amsModel.applyData(map.getCenter().lat(), map.getCenter().lng());
  console.log(e);
};

/**
 * Playlistオブジェクトcontentプロパティ描画完了時のハンドラー
 */
onDomready = () => {

};

/**
 * Playlistジャケットクリック時のハンドラー
 */
onClickJacket = () => {

};

/**
 * Playlist音符アイコンクリック時のハンドラー
 */
onClickNoteIcon = () => {

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
    playlist.addListener('domready', onDomready);
    playlist.addListnerToJacket('click', onClickJacket);
    playlist.addListnerToNoteIcon('click', onClickNoteIcon);
    playlist.open(map);
    playlist.closeDetail();
    playlists.push(playlist);
  }
};

/**
 * 現在地を取得してコールバックに渡す
 */
getCurrPos = (onSuccess, onError, optMap) => {
  if (!navigator.geolocation) {
    return;
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, optMap);
};

/**
 * module起動
 * @exports
 */
init = ($wrapper) => {
  $wrapper.append(HTML);
  setJqueryMap();
  amsData = IS_FAKE ? _amsDataFake : _amsData;
  amsData.init();
  amsModel.init(amsData);
  amsIcons.init(jqueryMap[`$${MOD_NAME}`]);
  amsInfo.init(jqueryMap[`$${MOD_NAME}`]);
  map = new AMSMap(jqueryMap[`$${MOD_NAME}`]);
  marker = new AMSMarker(map);
  marker.setVisible(false);
  map.addListener('click', onClickMap);
  marker.addListener('click', onClickMarker);
  $(window).on('apply-data', onApplyData);
  getCurrPos(onSuccessToGetCurrPos, onErrorToGetCurrPos, POS_OPT_MAP);
};

export default {
  init,
};
