import google from 'google';

const
  /** ショートカット */
  GM = google.maps,
  /** 円の透明度 */
  CIRCLE_FILL_OPACITY = 0.35,
  /** GM.Circleコンストラクタに渡すオプション */
  CIRCLE_OPT_MAP = {
    center: undefined,
    strokeWeight: 0,
    fillColor: undefined,
    fillOpacity: CIRCLE_FILL_OPACITY,
    radius: undefined,
    clickable: false,
  };

var AMSCircle;

/**
 * 再生範囲サークルクラス
 * @exports
 */
AMSCircle = class {
  /**
   * constructor
   * @param {Object} position
   * @param {Array} rads
   */
  constructor(position, rads) {
    var hsl;
    hsl = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
    CIRCLE_OPT_MAP.fillColor = hsl;
    CIRCLE_OPT_MAP.center = position;
    for (let i = 0; i < rads.length; i++) {
      CIRCLE_OPT_MAP.radius = rads[i];
      this[i] = new GM.Circle(CIRCLE_OPT_MAP);
    }
    this.length = rads.length;
  }
  /**
   * 設置する
   * @param {Object} map
   */
  open(map) {
    for (let circle of this) {
      circle.setMap(map);
    }
  }
  /**
   * 表示非表示を切り替える
   * @param {boolean} bool
   */
  setVisible(bool) {
    for (let circle of this) {
      circle.setVisible(bool);
    }
  }
  /**
   * Iterableにする
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }
};

export default AMSCircle;
