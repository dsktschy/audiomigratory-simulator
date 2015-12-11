import $ from 'jquery';
import google from 'google';
import AMSInfoBox from './ams-info-box';
import AMSTrack from './ams-track';

const
  /** ショートカット */
  GM = google.maps,
  /** モジュール名 */
  MOD_NAME = 'ams-playlist',
  /** ジャケットが存在しない場合に使用する画像のindex.htmlからの相対パス */
  DEFAULT_JACKET = '',
  /** Playlistアイコンのindex.htmlからの相対パス */
  PLAYLIST_MASK = 'images/playlist-mask.png',
  /** 音符アイコンのindex.htmlからの相対パス */
  NOTE_ICON = 'images/note-icon.gif',
  /** ジャケット,音符アイコンの一辺(px) */
  ICON_SIZE = AMSInfoBox.ICON_SIZE,
  /** img要素のサイズ属性部分 */
  IMG_SIZE_ATTR = `width="${ICON_SIZE}" height="${ICON_SIZE}"`,
  /** タイトル要素のクラス名 */
  TITLE_CLASS = 'title',
  /** ユーザー名要素のクラス名 */
  USER_NAME_CLASS = 'user-name',
  /** プレイモード時用の要素に適用するクラス名 */
  PLAY_MODE_CLASS = 'play-mode',
  /** プレイリストアイコン要素のクラス名 */
  PLAYLIST_MASK_CLASS = 'playlist-mask',
  /** プレイモード時のプレイリスト情報要素のクラス名 */
  INFO_CLASS = 'info',
  /** プレイモードから抜けるトリガーとなる要素のクラス名 */
  BACK_CLASS = 'back',
  /** プレイモードから抜けるトリガーとなる要素の文字列 */
  BACK_HTML = '<p>< Back<span>to</span><span>playlists</span></p>',
  /** プレイモードから抜けるトリガーとなる要素 */
  $PLAY_MODE_CONTENT = $(
    `<div class="${MOD_NAME} ${BACK_CLASS} ${PLAY_MODE_CLASS}">` +
      BACK_HTML +
    '</div>'
  ),
  /** 列車/車のミリ秒速(m) */
  M_PER_MS_FAST = 0.016,
  /** 徒歩/無指定時のミリ秒速(m) */
  M_PER_MS_DEFAULT = 0.001,
  /** M_PER_MS_FASTの適用対象となるvehicle属性値 */
  FAST_VEHICLES = ['train', 'Train', 'car', 'Car'];

var AMSPlaylist, getDistanceBetween;

/** ショートカット */
getDistanceBetween = GM.geometry.spherical.computeDistanceBetween;

/**
 * プレイリストクラス
 * @exports
 */
AMSPlaylist = class extends AMSInfoBox {
  /**
   * constructor
   *   AMSTrackと扱いを揃えるため
   *   latlngプロパティをlat,lngプロパティに分解する
   *   $playModeContentプロパティは
   *   append後も参照の必要があるためjQueryオブジェクトとして保持
   * @param {Object} data APIから取得したJSONデータのplaylists[i]
   */
  constructor(data) {
    var img, content;
    [data.lat, data.lng] = data.latlng.split(',');
    img = data.jacket || data.user_img || DEFAULT_JACKET;
    content = '' +
      `<div class="${MOD_NAME}">` +
        '<p>' +
          `<img src="${img}" ${IMG_SIZE_ATTR}>` +
          '<img ' +
            `src="${PLAYLIST_MASK}" ${IMG_SIZE_ATTR} ` +
            `class="${PLAYLIST_MASK_CLASS}"` +
          '>' +
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
      this.tracks.push(new AMSTrack(_data, img));
    }
    this.$playModeContent = $(
      `<div class="${MOD_NAME} ${INFO_CLASS} ${PLAY_MODE_CLASS}">` +
        `<p class="${TITLE_CLASS}">${this.title}</p>` +
        `<p class="${USER_NAME_CLASS}">${this.user_name}</p>` +
      '</div>'
    );
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
  /**
   * プレイモード時用の要素を設定
   */
  appendPlayModeContentTo($wrapper) {
    $wrapper.append(this.$playModeContent);
  }
  /**
   * プレイモード時用の要素を表示
   */
  openPlayModeContent() {
    this.$playModeContent.css('visibility', 'visible');
  }
  /**
   * プレイモード時用の要素を非表示に
   */
  closePlayModeContent() {
    this.$playModeContent.css('visibility', 'hidden');
  }
  /**
   * 自動再生時の端の地点(開始/終了地点)の緯度経度を取得
   */
  calculateEndPosition(isHead) {
    var
      endIndex, nextIndex, endTrackPos, nextTrackPos, endTrackPosLat, endTrackPosLng,
      trackDistance, trackDiffLat, trackDiffLng, ratio, endPosDiffLat,
      endPosDiffLng;
    endIndex = isHead ? 0 : this.tracks.length - 1;
    nextIndex = endIndex + (isHead ? 1 : -1);
    endTrackPos = this.tracks[endIndex].getPosition();
    nextTrackPos = this.tracks[nextIndex].getPosition();
    endTrackPosLat = endTrackPos.lat();
    endTrackPosLng = endTrackPos.lng();
    trackDistance = getDistanceBetween(endTrackPos, nextTrackPos);
    trackDiffLat = nextTrackPos.lat() - endTrackPosLat;
    trackDiffLng = nextTrackPos.lng() - endTrackPosLng;
    ratio = this.tracks[endIndex].rad / trackDistance;
    endPosDiffLat = trackDiffLat * ratio;
    endPosDiffLng = trackDiffLng * ratio;
    return new GM.LatLng(
      endTrackPosLat - endPosDiffLat,
      endTrackPosLng - endPosDiffLng
    );
  }
  /**
   * 全てのtrackの座標を配列で返す
   */
  getAllTrackPositions() {
    var positions;
    positions = [];
    for (let track of this.tracks) {
      positions.push(track.getPosition());
    }
    return positions;
  }
  /**
   * vehicle属性から対応するミリ秒速(m)を返す
   */
  convertVehicleToSpeed() {
    if (FAST_VEHICLES.indexOf(this.vehicle) > -1) {
      return M_PER_MS_FAST;
    }
    return M_PER_MS_DEFAULT;
  }
  /**
   * プレイモード時用の要素を設定
   */
  static appendPlayModeContentTo($wrapper) {
    $wrapper.append($PLAY_MODE_CONTENT);
  }
  /**
   * プレイモード時用の要素を表示
   */
  static openPlayModeContent() {
    $PLAY_MODE_CONTENT.css('visibility', 'visible');
  }
  /**
   * プレイモード時用の要素を非表示に
   */
  static closePlayModeContent() {
    $PLAY_MODE_CONTENT.css('visibility', 'hidden');
  }
  /**
   * プレイモード時用の要素にイベントハンドラーを設定
   */
  static addListnerToPlayModeContent(eventname, handler) {
    $PLAY_MODE_CONTENT.on(eventname, handler);
  }
};

export default AMSPlaylist;
