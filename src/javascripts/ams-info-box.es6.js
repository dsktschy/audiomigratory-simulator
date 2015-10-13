import $ from 'jquery';
import google from 'google';
import InfoBox from 'infobox';

const
  /** モジュール名 */
  MOD_NAME = 'ams-info-box',
  /** ショートカット */
  GM = google.maps,
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = 48,
  /** InfoBoxの一辺(px) */
  INFO_BOX_SIZE = Math.floor( ICON_SIZE + ICON_SIZE / 10 ),
  /** InfoBoxの左右のpadding(px) */
  INFO_BOX_PADDING_LR = 10,
  /** InfoBoxの中央カラムのpadding-left(px) */
  DETAIL_COLUMN_PADDING_L = 5,
  /** webkit以外では反映されないfont-weight:bold;による広がり幅の近似値(px) */
  BOLD_OFFSET = 2,
  /** 非detailMode時のInfoBoxのwidth */
  DETAIL_CLOSED_WIDTH = INFO_BOX_SIZE + INFO_BOX_PADDING_LR,
  /** InfoBoxコンストラクターに渡すオプション */
  INFO_BOX_OPT_MAP = {
    position: undefined,
    content: undefined,
    disableAutoPan: true,
    closeBoxURL: '',
    alignBottom: true,
    pixelOffset: new GM.Size(-(DETAIL_CLOSED_WIDTH / 2), 0),
    maxWidth: 0,
  },
  /** constructorに渡されるデータからインスタンスにコピーしないプロパティのキー */
  EXCLUDED_KEYS = [
    'tracks',
    'latlng',
    'lat',
    'lng',
  ],
  /** detailMode時のz-index */
  OPEN_Z_INDEX = 100,
  /** detailModeでない時のz-index */
  CLOSED_Z_INDEX = 'auto';

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
  constructor(data, content = '') {
    var lat, lng;
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);
    INFO_BOX_OPT_MAP.position = new GM.LatLng(lat, lng);
    INFO_BOX_OPT_MAP.content = $(content).addClass(MOD_NAME)[0];
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
   *   widthはsetContentの処理内で内容に合わせて再設定されるためsetOptionsはその後で
   */
  openDetail() {
    var $content, width;
    $content = $(this.getContent());
    $content.children(':not(:first)').css('display', 'block');
    this.setContent($content[0]);
    width = AMSInfoBox.getFixedOuterWidth($content);
    this.setOptions({
      boxStyle: {width: `${width}px`},
      pixelOffset: new GM.Size(-(width / 2), 0),
    });
    this.setZIndex(OPEN_Z_INDEX);
  }
  /**
   * detailMode解除
   *   widthはsetContentの処理内で内容に合わせて再設定されるためsetOptionsでは省略
   */
  closeDetail() {
    var $content;
    $content = $(this.getContent());
    $content.children(':not(:first)').css('display', 'none');
    this.setContent($content[0]);
    this.setOptions({
      pixelOffset: new GM.Size(-(DETAIL_CLOSED_WIDTH / 2), 0),
    });
    this.setZIndex(CLOSED_Z_INDEX);
  }
  /**
   * infoBoxのwidthがautoでは内容量と合致しない場合があるため矯正する
   */
  static getFixedOuterWidth($content) {
    var width;
    width = INFO_BOX_PADDING_LR;
    $content.children().each((index, elem) => {
      width += index === 1
        ? AMSInfoBox.getDetailColumnOuterWidth(elem)
        : $(elem).outerWidth(true);
    });
    return width;
  }
  /**
   * font-weight:bold;で広がった幅を反映した正しいouterWidth(の近似値)を算出
   *   webkit以外では広がった幅がouterWidthに反映されない
   *   上下2行あるうち広い方の幅を使用する
   */
  static getDetailColumnOuterWidth(column) {
    var $column, largerWidth;
    $column = $(column);
    largerWidth = 0;
    $column.children().each((index, elem) => {
      largerWidth = $(elem).outerWidth(false) > largerWidth
        ? $(elem).outerWidth(false)
        : largerWidth;
    });
    return DETAIL_COLUMN_PADDING_L + largerWidth + BOLD_OFFSET;
  }
};

/** export先でもICON_SIZEを使用可能にしておく */
AMSInfoBox.ICON_SIZE = ICON_SIZE;

export default AMSInfoBox;
