import google from 'google';

const
  MOD_NAME = 'ams-marker',
  GM = google.maps,
  RADIUS = 10,
  STROKE_WEIGHT = 4,
  STROKE_COLOR = '#ffffff',
  FILL_COLOR = '#1e90ff',
  FILL_OPACITY = 1,
  MARKER_OPT_MAP = {
    map: undefined,
    position: undefined,
    icon: {
      path: GM.SymbolPath.CIRCLE,
      scale: RADIUS,
      strokeWeight: STROKE_WEIGHT,
      strokeColor: STROKE_COLOR,
      fillColor: FILL_COLOR,
      fillOpacity: FILL_OPACITY,
    },
  };

var create;

/**
 * ams用にmarkerオブジェクトを作成して返す
 * @exports
 */
create = (map) => {
  var marker;
  MARKER_OPT_MAP.map = map;
  MARKER_OPT_MAP.position = map.getCenter();
  marker = new GM.Marker(MARKER_OPT_MAP);
  return marker;
};

export default {
  create,
};
