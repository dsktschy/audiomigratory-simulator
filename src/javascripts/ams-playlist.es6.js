import $ from 'jquery';
import google from 'google';
import AmsInfoBox from './ams-info-box';

const
  GM = google.maps,
  DEFAULT_ICON_IMG_SRC = '',
  ICON_SIZE = 48,
  INFO_BOX_SIZE = Math.floor( ICON_SIZE + ICON_SIZE / 10 ),
  PLAYLIST_OPT_MAP = {
    position: undefined,
    content: undefined,
    disableAutoPan: true,
    closeBoxURL: '',
    alignBottom: true,
    pixelOffset: new GM.Size( -( INFO_BOX_SIZE / 2 ), 0 ),
    maxWidth: 0,
  };

var Playlist;

/**
 * プレイリストクラス
 * @exports
 */
Playlist = class extends AmsInfoBox {
  /**
   * constructor
   */
  constructor(data) {
    var lat, lng, src;
    [lat, lng] = data.latlng.split(',');
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    src = data.jacket || data.user_img || DEFAULT_ICON_IMG_SRC;
    PLAYLIST_OPT_MAP.position = new GM.LatLng(lat, lng);
    PLAYLIST_OPT_MAP.content = $(
      '<div class="info-box">' +
        '<p>' +
          `<img src=${src} width=${ICON_SIZE} height=${ICON_SIZE}>` +
        '</p>' +
      '</div>'
    )[0];
    super(PLAYLIST_OPT_MAP);
  }
};

export default Playlist;
