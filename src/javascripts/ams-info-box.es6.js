import $ from 'jquery';
import google from 'google';
import InfoBox from 'infobox';

const
  /** ショートカット */
  GM = google.maps,
  /** contentプロパティの要素のクラス */
  CONTENT_ELEM_CLASS = 'info-box',
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = 48,
  /** InfoBoxの一辺(px) */
  INFO_BOX_SIZE = Math.floor( ICON_SIZE + ICON_SIZE / 10 ),
  /** InfoBoxコンストラクターに渡すオプション */
  INFO_BOX_OPT_MAP = {
    position: undefined,
    content: undefined,
    disableAutoPan: true,
    closeBoxURL: '',
    alignBottom: true,
    pixelOffset: new GM.Size( -( INFO_BOX_SIZE / 2 ), 0 ),
    maxWidth: 0,
  },
  /** constructorに渡されるデータからインスタンスにコピーしないプロパティのキー */
  EXCLUDED_KEYS = [
    'tracks',
    'latlng',
    'lat',
    'lng',
  ];

var AMSInfoBox;

// コンストラクタのprototype.constructorプロパティを
// 継承元クラスコンストラクタから自身のコンストラクタに戻す処理が
// babelを用いてextendsを使うには必要
// infoBox.jsにはこの処理がないためここで補っておく
Object.defineProperty(InfoBox.prototype, 'constructor', {
  value: InfoBox,
  enumerable: false,
  writable: true,
  configurable: true,
});

/**
 * AMS用に拡張したInfoBoxクラス
 * @exports
 */
AMSInfoBox = class extends InfoBox {
  /**
   * constructor
   */
  constructor(data, detail = '') {
    var lat, lng;
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);
    INFO_BOX_OPT_MAP.position = new GM.LatLng(lat, lng);
    INFO_BOX_OPT_MAP.content = '' +
      `<div class="${CONTENT_ELEM_CLASS}">` +
        '<p>' +
          `<img src=${data.img} width=${ICON_SIZE} height=${ICON_SIZE}>` +
        '</p>' +
        detail +
      '</div>';
    super(INFO_BOX_OPT_MAP);
    for (let key in data) {
      if (!data.hasOwnProperty(key) || EXCLUDED_KEYS.indexOf(key) !== -1) {
        continue;
      }
      this[key] = data[key];
    }
  }
  /**
   * ジャケットにイベントハンドラーを設定
   */
  addListnerToJacket(eventname, handler) {
    var $content;
    $content = $(this.getContent());
    $content.children(':first').on(eventname, handler);
    this.setContent($content[0]);
  }
  /**
   * detailModeに切り替え
   */
  openDetail() {
    var $content;
    $content = $(this.getContent());
    $content.children(':not(:first)').css('display', 'block');
    this.setContent($content[0]);
  }
  /**
   * detailMode解除
   */
  closeDetail() {
    var $content;
    $content = $(this.getContent());
    $content.children(':not(:first)').css('display', 'none');
    this.setContent($content[0]);
  }
};

/** export先でもICON_SIZEを使用可能にしておく */
AMSInfoBox.ICON_SIZE = ICON_SIZE;

export default AMSInfoBox;
