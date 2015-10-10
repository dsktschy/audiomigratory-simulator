import AMSInfoBox from './ams-info-box';
import Track from './ams-track';

const
  DEFAULT_JACKET = '';

var Playlist;

/**
 * プレイリストクラス
 * @exports
 */
Playlist = class extends AMSInfoBox {
  /**
   * constructor
   *   Trackと扱いを揃えるため
   *   latlngプロパティをlat,lngプロパティに分解する
   * @param {Object} data APIから取得したJSONデータのplaylists[i]
   */
  constructor(data) {
    [data.lat, data.lng] = data.latlng.split(',');
    data.img = data.jacket || data.user_img || DEFAULT_JACKET;
    super(data);
    this.tracks = [];
    for (let _data of data.tracks) {
      this.tracks.push(new Track(_data, this.img));
    }
  }
};

export default Playlist;
