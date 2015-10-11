import AMSInfoBox from './ams-info-box';

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
    var detail;
    data.img = data.jacket || data.user_img || defaultJacket;
    detail = '' +
      '<p>' +
        `<span class="bold">${data.title}</span><br>` +
        `<span class="gray">${data.user_name}</span>` +
      '</p>';
    super(data, detail);
  }
};

export default Track;
