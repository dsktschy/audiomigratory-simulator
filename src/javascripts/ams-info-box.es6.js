import InfoBox from 'infobox';

var AmsInfoBox;

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
AmsInfoBox = class extends InfoBox {
  /**
   * constructor
   */
  constructor(opts) {
    super(opts);
  }
};

export default AmsInfoBox;
