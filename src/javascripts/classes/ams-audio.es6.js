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
  this.load();
};

/**
 * 指定のvolumeまでフェードする
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
 * Audioはcallを受け付けないため完全な継承は不可能
 *   Audioのconstructorやその他メソッドを子クラスのインスタンスをthisとして実行できない
 * @exports
 */
createAudio = (id) => {
  var src, audio;
  src = `//api.soundcloud.com/tracks/${id}/stream?client_id=${SC_CLIENT_ID}`;
  audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0;
  audio.intervalID = null;
  return audio;
};

export default createAudio;
