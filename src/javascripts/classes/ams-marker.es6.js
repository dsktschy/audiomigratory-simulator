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
  },
  /** moveメソッドのループ遅延時間(msec) */
  INTERVAL_DELAY = 16;

var AMSMarker, getDistanceBetween;

/** ショートカット */
getDistanceBetween = GM.geometry.spherical.computeDistanceBetween;

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
    this.intervalID = null;
  }
  /**
   * 指定座標まで移動
   */
  move(goalPos, mPerMS, onLoop, onEnd) {
    var
      startPos, distance, duration, loopTotal, diffLat, diffLng, latPerLoop,
      lngPerLoop, loopCount;
    startPos = this.getPosition();
    distance = getDistanceBetween(startPos, goalPos);
    duration = distance / mPerMS;
    loopTotal = Math.floor(duration / INTERVAL_DELAY);
    diffLat = goalPos.lat() - startPos.lat();
    diffLng = goalPos.lng() - startPos.lng();
    latPerLoop = diffLat / loopTotal;
    lngPerLoop = diffLng / loopTotal;
    loopCount = 0;
    this.intervalID = setInterval(() => {
      var currentPos, pos;
      if (loopCount === loopTotal) {
        clearInterval(this.intervalID);
        this.intervalID = null;
        onEnd();
        return;
      }
      currentPos = this.getPosition();
      pos = (loopCount === loopTotal - 1)
        ? goalPos
        : new GM.LatLng(
          currentPos.lat() + latPerLoop,
          currentPos.lng() + lngPerLoop
        );
      this.setPosition(pos);
      onLoop();
      loopCount++;
    }, INTERVAL_DELAY);
  }
  /**
   * 指定された経由地点を経過しながら目標の座標まで移動
   */
  moveBetween(startPos, goalPos, waypoints, mPerMS, onLoop, onEnd) {
    var moveFuncs;
    moveFuncs = [this.move.bind(this, goalPos, mPerMS, onLoop, onEnd)];
    for (let i = waypoints.length; i > 0; i--) {
      moveFuncs.push(
        this.move.bind(
          this, waypoints[i - 1], mPerMS, onLoop, moveFuncs.pop()
        )
      );
    }
    this.setPosition(startPos);
    moveFuncs.pop()();
  }
  /**
   * moveメソッドを強制終了
   */
  cancelMoving() {
    clearInterval(this.intervalID);
    this.intervalID = null;
  }
};

export default AMSMarker;
