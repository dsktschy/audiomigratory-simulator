import $ from 'jquery';

var
  init, getData, amsData, onSuccessToGetParsedData, onErrorToGetParsedData,
  set$cache, $cache;

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
  $cache.window.trigger('get-data', data.result);
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
};
