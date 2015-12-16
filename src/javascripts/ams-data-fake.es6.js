import $ from 'jquery';

const
  /** FAKE_DATAを定義するjsファイルのindex.htmlからの相対パス */
  SRC = 'javascripts/fake-data.js',
  /** SRCを読み込むためのscriptタグ */
  HTML = `<script type="text/javascript" src="${SRC}"></script>`,
  /** 本来のデータ取得処理を模倣するための応答遅延時間(msec) */
  DELAY = 3000;

var init, getParsedData, isAJAXSimulating;

/**
 * データ取得とパースを模倣する
 *   script要素が予め存在していなかった場合はAJAXを模倣する
 * @exports
 */
getParsedData = (params, onSuccess, onError) => {
  if (isAJAXSimulating) {
    setTimeout(onSuccess.bind(null, FAKE_DATA), DELAY);
    return;
  }
  onSuccess(FAKE_DATA);
};

/**
 * module起動
 *   grobal変数FAKE_DATAが存在しない場合はそれを定義するscript要素を追加
 *   ブラウザから非推奨の注意文言が出るがデバッグ時限定のためよしとする
 * @exports
 */
init = () => {
  isAJAXSimulating = !FAKE_DATA;
  if (isAJAXSimulating) {
    $('head').append(HTML);
  }
};

export default {
  init,
  getParsedData,
};
