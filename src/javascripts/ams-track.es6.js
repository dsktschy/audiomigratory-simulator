import google from 'google';
import AMSInfoBox from './ams-info-box';
import SC from 'soundcloud';

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
  INNER = 1,
  /** SoundCloudAPI利用のためのID */
  SC_CLIENT_ID = 'b554814828423314a4070bd344e87b5a',
  /** フェード間隔(ms) */
  FADE_INTERVAL = 50,
  /** フェード所要時間(ms) */
  FADE_DURATION = 1000,
  /** 所要時間で完了するためのフェード処理実行回数 */
  FADE_COUNT = FADE_DURATION / FADE_INTERVAL;

var Track, fadeTo;

// SC初期化
SC.initialize({client_id: SC_CLIENT_ID});

/**
 * SCのPlayerクラスに追加するフェードメソッド
 */
fadeTo = function(targetVol, callback) {
  var currentVol, volPerInterval;
  clearInterval(this.intervalID);
  this.intervalID = null;
  currentVol = this.getVolume();
  if (currentVol === targetVol) {
    return;
  }
  if (targetVol && !currentVol) {
    this.play();
  }
  volPerInterval = -((currentVol - targetVol) / FADE_COUNT);
  this.intervalID = setInterval(() => {
    var isBelowMin, isAboveMax;
    currentVol += volPerInterval;
    isBelowMin = (volPerInterval < 0 && currentVol < targetVol);
    isAboveMax = (volPerInterval > 0 && currentVol > targetVol);
    if (isBelowMin || isAboveMax) {
      currentVol = targetVol;
    }
    this.setVolume(currentVol);
    if (currentVol !== targetVol) {
      return;
    }
    if (!currentVol) {
      this.stop();
    }
    clearInterval(this.intervalID);
    this.intervalID = null;
    callback();
  }, FADE_INTERVAL);
};

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
    SC.stream(`/tracks/${this.id}`, (player) => {
      var playerProto;
      playerProto = Object.getPrototypeOf(player);
      if (playerProto.fadeTo !== fadeTo) {
        playerProto.fadeTo = fadeTo;
      }
      this.player = player;
      this.player.setVolume(0);
      this.player.intervalID = null;
    });
  }
  /**
   * 与えられた距離を音量に反映する
   */
  apply(distance) {
    var vol;
    if (!this.player) {
      return;
    }
    vol = distance === null || distance >= this.rad
      ? 0
      : distance <= this.rad2
        ? 1
        : 1 - (distance - this.rad2) / (this.rad - this.rad2);
    this.player.fadeTo(vol, () => {
      console.log(this.title, this.player.getVolume());
    });
  }
};

export default Track;
