import $ from 'jquery';

var
  init, applyData, amsData, onSuccessToGetParsedData, onErrorToGetParsedData,
  setJqueryMap, jqueryMap;

/**
 * jqueryオブジェクトを保持
 */
setJqueryMap = () => {
  jqueryMap = {
    $window: $(window),
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
  jqueryMap.$window.trigger('apply-data', data.result);
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
applyData = (lat, lng) => {
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
  setJqueryMap();
  amsData = dataMod;
};

export default {
  init,
  applyData,
};
