import AmsInfoBox from './ams-info-box';

var Track;

/**
 * トラッククラス
 * @exports
 */
Track = class extends AmsInfoBox {
  /**
   * constructor
   * @param {Object} data APIから取得したJSONデータのplaylists[i]
   * @param {string} defaultJacket
   *   ジャケットが存在しない場合の画像。Playlistのジャケットを使用する
   */
  constructor(data, defaultJacket) {
    data.img = data.jacket || data.user_img || defaultJacket;
    super(data);
  }
};

export default Track;
