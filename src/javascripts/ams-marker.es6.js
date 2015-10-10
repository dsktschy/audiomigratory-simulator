import google from 'google';

const
  /** ショートカット */
  GM = google.maps,
  /** Markerの半径 */
  RADIUS = 10,
  /** Markerのストローク幅 */
  STROKE_WEIGHT = 4,
  /** Markerのストローク色 */
  STROKE_COLOR = '#ffffff',
  /** Markerの塗り色 */
  FILL_COLOR = '#1e90ff',
  /** Markerの透明度 */
  FILL_OPACITY = 1,
  /** GM.Markerコンストラクターに渡すオプション */
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
