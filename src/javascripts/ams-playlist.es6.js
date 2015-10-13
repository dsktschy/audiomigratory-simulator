import $ from 'jquery';
import AMSInfoBox from './ams-info-box';
import Track from './ams-track';

const
  /** モジュール名 */
  MOD_NAME = 'ams-playlist',
  /** ジャケットが存在しない場合に使用する画像のindex.htmlからの相対パス */
  DEFAULT_JACKET = '',
  /** 音符アイコンのindex.htmlからの相対パス */
  NOTE_ICON = 'images/note-icon.gif',
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = AMSInfoBox.ICON_SIZE,
  /** img要素のサイズ属性部分 */
  IMG_SIZE_ATTR = `width=${ICON_SIZE} height=${ICON_SIZE}`,
  /** タイトル要素のクラス名 */
  TITLE_CLASS = 'title',
  /** ユーザー名要素のクラス名 */
  USER_NAME_CLASS = 'user-name';

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
    var img, content;
    [data.lat, data.lng] = data.latlng.split(',');
    img = data.jacket || data.user_img || DEFAULT_JACKET;
    content = '' +
      `<div class="${MOD_NAME}">` +
        '<p>' +
          `<img src=${img} ${IMG_SIZE_ATTR}>` +
        '</p>' +
        '<p>' +
          `<span class="${TITLE_CLASS}">${data.title}</span><br>` +
          `<span class="${USER_NAME_CLASS}">` +
            `${data.user_name} ${data.tracks.length}tracks` +
          '</span>' +
        '</p>' +
        '<p>' +
          `<img src="${NOTE_ICON}" ${IMG_SIZE_ATTR}>` +
        '</p>' +
      '</div>';
    super(data, content);
    this.tracks = [];
    for (let _data of data.tracks) {
      this.tracks.push(new Track(_data, img));
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
