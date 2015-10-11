import $ from 'jquery';
import AMSInfoBox from './ams-info-box';
import Track from './ams-track';

const
  /** ジャケットが存在しない場合に使用する画像のindex.htmlからの相対パス */
  DEFAULT_JACKET = '',
  /** 音符アイコンのindex.htmlからの相対パス */
  NOTE_ICON = 'images/note-icon.gif',
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = AMSInfoBox.ICON_SIZE;

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
    var detail;
    [data.lat, data.lng] = data.latlng.split(',');
    data.img = data.jacket || data.user_img || DEFAULT_JACKET;
    detail = '' +
      '<p>' +
        `<span class="bold">${data.title}</span><br>` +
        '<span class="gray">' +
          `${data.user_name} ${data.tracks.length}tracks` +
        '</span>' +
      '</p>' +
      '<p>' +
        `<img src="${NOTE_ICON}" width="${ICON_SIZE}" height="${ICON_SIZE}">` +
      '</p>';
    super(data, detail);
    this.tracks = [];
    for (let _data of data.tracks) {
      this.tracks.push(new Track(_data, this.img));
    }
  }
  /**
   * 音符アイコンにイベントハンドラーを設定
   */
  addListnerToNoteIcon(eventname, handler) {
    var $content;
    $content = $(this.getContent());
    $content.children(':last').on(eventname, handler);
    this.setContent($content[0]);
  }
};

export default Playlist;
