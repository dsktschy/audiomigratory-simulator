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
  ]),
  MAP_TYPE_ID = 'ams';

var AmsMap;

/**
 * AMS用に設定されたGM.Mapクラス
 * @exports
 */
AmsMap = class extends GM.Map {
  /**
   * constructor
   */
  constructor($wrapper) {
    $wrapper.append(HTML);
    super($(`#${MOD_NAME}`)[0], MAP_OPT_MAP);
    this.mapTypes.set(MAP_TYPE_ID, STYLED_MAP_TYPE);
    this.setMapTypeId(MAP_TYPE_ID);
  }
};

export default AmsMap;
