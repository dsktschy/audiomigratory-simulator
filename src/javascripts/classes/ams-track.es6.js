import google from 'google';
import AMSInfoBox from './ams-info-box';
import AMSCircle from './ams-circle';
import createAudio from './ams-audio';

const
  /** モジュール名 */
  MOD_NAME = 'ams-track',
  /** ショートカット */
  GM = google.maps,
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = AMSInfoBox.ICON_SIZE,
  /** img要素のサイズ属性部分 */
  IMG_SIZE_ATTR = `width="${ICON_SIZE}" height="${ICON_SIZE}"`,
  /** タイトル要素のクラス名 */
  TITLE_CLASS = 'title',
  /** ユーザー名要素のクラス名 */
  USER_NAME_CLASS = 'user-name',
  /** 外側の円に対する内側の円の倍率 */
  DEFAULT_RAD2_RATIO = 0.1;

var AMSTrack, getDistanceBetween;

/** ショートカット */
getDistanceBetween = GM.geometry.spherical.computeDistanceBetween;

/**
 * トラッククラス
 * @exports
 */
AMSTrack = class extends AMSInfoBox {

  /**
   * constructor
   * @param {Object} data APIから取得したJSONデータのplaylists[i].tracks[i]
   * @param {string} defaultJacket ジャケットが存在しない場合に使用する画像
   */
  constructor(data, defaultJacket) {
    var img, content;
    img = data.jacket || data.user_img || defaultJacket;
    content = '' +
      `<div class="${MOD_NAME}">` +
        '<p>' +
          `<img src="${img}" ${IMG_SIZE_ATTR}>` +
        '</p>' +
        '<p>' +
          `<span class="${TITLE_CLASS}">${data.title}</span><br>` +
          `<span class="${USER_NAME_CLASS}">${data.user_name}</span>` +
        '</p>' +
      '</div>';
    super(data, content);
    this.rad = parseFloat(this.rad);
    this.rad2 = parseFloat(this.rad2 || this.rad * DEFAULT_RAD2_RATIO);
    this.circle = new AMSCircle(this.getPosition(), [this.rad, this.rad2]);
    this.audio = createAudio(this.id);
  }

  /**
   * 与えられた位置から音量を計算して返す
   * @param {Object} pos
   */
  calculateVolume(pos) {
    var distance;
    if (!pos) {
      return 0;
    }
    distance = getDistanceBetween(pos, this.getPosition());
    return distance >= this.rad
      ? 0 : distance <= this.rad2
        ? 1 : 1 - (distance - this.rad2) / (this.rad - this.rad2);
  }

  /**
   * 与えられた音量を適用する
   * @param {number} vol
   * @param {boolean} isFaded
   * @param {Function} callback
   */
  applyVolume(vol, isFaded, callback = () => {}) {
    var method;
    method = isFaded ? 'fadeTo' : 'setVolume';
    this.audio[method](vol, callback);
  }

  /**
   * フェード再生を強制終了
   */
  cancelFading() {
    this.audio.cancelFading();
  }
};

export default AMSTrack;
