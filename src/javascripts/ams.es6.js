import $ from 'jquery';
import google from 'google';
import _amsData from './ams-data';
import _amsDataFake from './ams-data-fake';
import amsModel from './ams-model';
import amsMap from './ams-map';
import amsMarker from './ams-marker';
import amsIcons from './ams-icons';
import amsInfo from './ams-info';

const
  MOD_NAME = 'ams',
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`,
  GM = google.maps,
  CURRENT_POS_TIMEOUT = 10000,
  CURRENT_POS_MAXIMUM_AGE = 0,
  POS_OPT_MAP = {
    enableHighAccuracy: true,
    timeout: CURRENT_POS_TIMEOUT,
    maximumAge: CURRENT_POS_MAXIMUM_AGE,
  },
  IS_FAKE = true;

var
  init, jqueryMap, setJqueryMap, map, marker, getCurrPos, onClickMap, amsData,
  onSuccessToGetCurrPos, onErrorToGetCurrPos, onClickMarker;

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
  amsMap.init(jqueryMap[`$${MOD_NAME}`]);
  amsIcons.init(jqueryMap[`$${MOD_NAME}`]);
  amsInfo.init(jqueryMap[`$${MOD_NAME}`]);
  map = amsMap.create();
  marker = amsMarker.create(map);
  marker.setVisible(false);
  GM.event.addListener(map, 'click', onClickMap);
  GM.event.addListener(marker, 'click', onClickMarker);
  getCurrPos(onSuccessToGetCurrPos, onErrorToGetCurrPos, POS_OPT_MAP);
};

export default {
  init,
};
