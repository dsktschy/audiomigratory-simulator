const
  /** SoundCloudAPI利用のためのID */
  SC_CLIENT_ID = 'b554814828423314a4070bd344e87b5a',
  /** フェード間隔(ms) */
  FADE_INTERVAL = 50,
  /** フェード所要時間(ms) */
  FADE_DURATION = 1000,
  /** 所要時間で完了するためのフェード処理実行回数 */
  FADE_COUNT = FADE_DURATION / FADE_INTERVAL,
  /** load未完了だった場合の待機時間(ms) */
  RETRY_DELAY = 100;

var createAudio;

/**
 * 再生されるまでplayを試みる
 */
Audio.prototype.playOnLoad = function() {
  if (!this.src) {
    this.src = this._src;
  }
  if (!this.readyState) {
    setTimeout(this.playOnLoad.bind(this), RETRY_DELAY);
    return;
  }
  this.play();
};

/**
 * 停止して巻き戻す
 *   this.currentTime = 0;では次の再生で音が途切れてしまうためloadを使用
 */
Audio.prototype.stop = function() {
  this.pause();
  this.currentTime = 0;
};

/**
 * 指定のvolumeに設定する
 * @param {number} targetVol
 * @param {Function} callback
 */
Audio.prototype.setVolume = function(targetVol, callback) {
  var currentVol;
  currentVol = this.volume;
  if (currentVol === targetVol) {
    return;
  }
  if (targetVol && !currentVol) {
    this.playOnLoad();
  }
  this.volume = targetVol;
  if (!targetVol) {
    this.stop();
  }
  callback();
};

/**
 * 指定のvolumeまでフェードする
 * @param {number} targetVol
 * @param {Function} callback
 */
Audio.prototype.fadeTo = function(targetVol, callback) {
  var currentVol, volPerInterval;
  clearInterval(this.intervalID);
  this.intervalID = null;
  currentVol = this.volume;
  if (currentVol === targetVol) {
    return;
  }
  if (targetVol && !currentVol) {
    this.playOnLoad();
  }
  volPerInterval = -((currentVol - targetVol) / FADE_COUNT);
  this.intervalID = setInterval(() => {
    var isBelowMin, isAboveMax;
    currentVol += volPerInterval;
    isBelowMin = (volPerInterval < 0 && currentVol < targetVol);
    isAboveMax = (volPerInterval > 0 && currentVol > targetVol);
    if (isBelowMin || isAboveMax) {
      currentVol = targetVol;
    }
    this.volume = currentVol;
    if (currentVol !== targetVol) {
      return;
    }
    if (!currentVol) {
      this.stop();
    }
    clearInterval(this.intervalID);
    this.intervalID = null;
    callback();
  }, FADE_INTERVAL);
};

/**
 * fadeToメソッドを強制終了
 */
Audio.prototype.cancelFading = function() {
  clearInterval(this.intervalID);
  this.intervalID = null;
};

/**
 * Audioはcallを受け付けないため完全な継承は不可能
 *   Audioのconstructorやその他メソッドは子クラスのインスタンスをthisとして実行できない
 *   preload属性は、autoでsrc属性を直後に設定すると一気に全トラックがリクエストされ
 *   ブラウザが固まってしまう。かといってmetadataでは再生時にChromeで音が途切れてしまう
 *   noneを使用したいがWebkitでの挙動がautoと変わらないため
 *   autoに設定した上で再生直前にsrc属性を手動で設定する
 * @exports
 * @param {string} id
 */
createAudio = (id) => {
  var _src, audio;
  _src = `//api.soundcloud.com/tracks/${id}/stream?client_id=${SC_CLIENT_ID}`;
  audio = new Audio();
  audio.loop = true;
  audio.volume = 0;
  audio.intervalID = null;
  audio.preload = 'auto';
  audio._src = _src;
  return audio;
};

export default createAudio;
