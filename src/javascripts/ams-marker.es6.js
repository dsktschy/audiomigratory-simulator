import google from 'google';

const
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

var AMSMarker;

/**
 * AMS用に設定されたGM.Markerクラス
 * @exports
 */
AMSMarker = class extends GM.Marker {
  /**
   * constructor
   */
  constructor(map) {
    MARKER_OPT_MAP.map = map;
    MARKER_OPT_MAP.position = map.getCenter();
    super(MARKER_OPT_MAP);
  }
};

export default AMSMarker;
