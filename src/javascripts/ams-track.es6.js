import google from 'google';
import AMSInfoBox from './ams-info-box';

const
  /** ショートカット */
  GM = google.maps,
  /** 円の透明度 */
  CIRCLE_FILL_OPACITY = 0.35,
  /** GM.Circleコンストラクターに渡すオプション */
  CIRCLE_OPT_MAP = {
    center: undefined,
    strokeWeight: 0,
    fillColor: undefined,
    fillOpacity: CIRCLE_FILL_OPACITY,
    radius: undefined,
    clickable: false,
  },
  /** 外側の円に対する内側の円の倍率 */
  INNER_CIRCLE_RADIUS_RATIO = 0.1,
  /** 外側の円のインデックス */
  OUTER = 0,
  /** 内側の円のインデックス */
  INNER = 1;

var Track;

/**
 * トラッククラス
 * @exports
 */
Track = class extends AMSInfoBox {
  /**
   * constructor
   * @param {Object} data APIから取得したJSONデータのplaylists[i].tracks[i]
   * @param {string} defaultJacket ジャケットが存在しない場合に使用する画像
   */
  constructor(data, defaultJacket) {
    var detail, circleOptMaps, position, hsl;
    data.img = data.jacket || data.user_img || defaultJacket;
    detail = '' +
      '<p>' +
        `<span class="bold">${data.title}</span><br>` +
        `<span class="gray">${data.user_name}</span>` +
      '</p>';
    super(data, detail);
    circleOptMaps = [
      Object.create(CIRCLE_OPT_MAP),
      Object.create(CIRCLE_OPT_MAP),
    ];
    position = this.getPosition();
    hsl = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
    this.rad = parseFloat(this.rad);
    this.rad2 = parseFloat(this.rad2 || this.rad * INNER_CIRCLE_RADIUS_RATIO);
    circleOptMaps[OUTER].center = circleOptMaps[INNER].center = position;
    circleOptMaps[OUTER].fillColor = circleOptMaps[INNER].fillColor = hsl;
    circleOptMaps[OUTER].radius = this.rad;
    circleOptMaps[INNER].radius = this.rad2;
    this.circles = [
      new GM.Circle(circleOptMaps[OUTER]),
      new GM.Circle(circleOptMaps[INNER]),
    ];
  }
};

export default Track;
