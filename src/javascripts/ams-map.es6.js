import $ from 'jquery';
import google from 'google';

const
  MOD_NAME = 'ams-map',
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`,
  GM = google.maps,
  DEFAULT_ZOOM = 11,
  DEFAULT_LAT = 35.689634,
  DEFAULT_LNG = 139.692101,
  MAP_OPT_MAP = {
    zoom: DEFAULT_ZOOM,
    center: new GM.LatLng(DEFAULT_LAT, DEFAULT_LNG),
    mapTypeId: GM.MapTypeId.ROADMAP,
    disableDoubleClickZoom: true,
    zoomControl: true,
    zoomControlOptions: {style: GM.ZoomControlStyle.SMALL},
    panControl: false,
    streetViewControl: false,
    overviewMapControl: false,
    mapTypeControl: false,
  },
  STYLED_MAP_TYPE = new GM.StyledMapType([
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{visibility: 'off'}],
    },
    {
      featureType: 'transit.line',
      elementType: 'all',
      stylers: [{visibility: 'on'}],
    },
    {
      featureType: 'transit.station.rail',
      elementType: 'all',
      stylers: [{visibility: 'on'}],
    },
  ]);

var init, jqueryMap, setJqueryMap, create;

/**
 * jqueryオブジェクトを保持
 */
setJqueryMap = () => {
  jqueryMap = {
    [`$${MOD_NAME}`]: $(`#${MOD_NAME}`),
  };
};

/**
 * module起動
 * @exports
 */
init = ($wrapper) => {
  $wrapper.append(HTML);
  setJqueryMap();
};

/**
 * ams用にmapオブジェクトを作成して返す
 * @exports
 */
create = () => {
  var map;
  map = new GM.Map(jqueryMap[`$${MOD_NAME}`][0], MAP_OPT_MAP);
  map.mapTypes.set('ams', STYLED_MAP_TYPE);
  map.setMapTypeId('ams');
  return map;
};

export default {
  init,
  create,
};
