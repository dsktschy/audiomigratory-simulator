import $ from 'jquery';

var
  init, getData, amsData, onSuccessToGetParsedData, onErrorToGetParsedData,
  set$cache, $cache, result, getResult;

/**
 * jqueryオブジェクトを保持
 */
set$cache = () => {
  $cache = {
    window: $(window),
  };
};

/**
 * データ取得成功時のコールバック
 */
onSuccessToGetParsedData = (data) => {
  if (!data.status) {
    console.log('json.status: 0');
    return;
  }
  if (!parseInt(data.result.hits, 10)) {
    console.log('json.result.hits: 0');
    return;
  }
  result = data.result;
  $cache.window.trigger('get-data');
};

/**
 * データ取得失敗時のコールバック
 */
onErrorToGetParsedData = (e) => {
  console.log(e);
};

/**
 * データ取得開始
 * @exports
 */
getData = (lat, lng) => {
  amsData.getParsedData(
    {lat, lng, zone: 'admin'},
    onSuccessToGetParsedData,
    onErrorToGetParsedData
  );
};

/**
 * 取得したデータを返す
 *   resultを書き換えられないようコピーを返す
 * @exports
 */
getResult = () => $.extend(true, {}, result) || {};

/**
 * module起動
 * @exports
 */
init = (dataMod) => {
  set$cache();
  amsData = dataMod;
};

export default {
  init,
  getData,
  getResult,
};
