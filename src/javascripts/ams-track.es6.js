import google from 'google';
import AMSInfoBox from './ams-info-box';
import createAudio from './ams-audio';

const
  /** モジュール名 */
  MOD_NAME = 'ams-track',
  /** ショートカット */
  GM = google.maps,
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = AMSInfoBox.ICON_SIZE,
  /** img要素のサイズ属性部分 */
  IMG_SIZE_ATTR = `width=${ICON_SIZE} height=${ICON_SIZE}`,
  /** タイトル要素のクラス名 */
  TITLE_CLASS = 'title',
  /** ユーザー名要素のクラス名 */
  USER_NAME_CLASS = 'user-name',
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
    var img, content, circleOptMaps, position, hsl;
    img = data.jacket || data.user_img || defaultJacket;
    content = '' +
      `<div class="${MOD_NAME}">` +
        '<p>' +
          `<img src=${img} ${IMG_SIZE_ATTR}>` +
        '</p>' +
        '<p>' +
          `<span class="${TITLE_CLASS}">${data.title}</span><br>` +
          `<span class="${USER_NAME_CLASS}">${data.user_name}</span>` +
        '</p>' +
      '</div>';
    super(data, content);
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
    this.audio = createAudio(this.id);
  }
  /**
   * 与えられた距離を音量に反映する
   */
  apply(distance) {
    var vol;
    vol = distance === null || distance >= this.rad
      ? 0
      : distance <= this.rad2
        ? 1
        : 1 - (distance - this.rad2) / (this.rad - this.rad2);
    this.audio.fadeTo(vol, () => {
      console.log(this.title, this.audio.volume);
    });
  }
};

export default Track;
