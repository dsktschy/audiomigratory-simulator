var
  init, data, applyData, amsData, onSuccessToGetParsedData,
  onErrorToGetParsedData;

/**
 * データ取得成功時のコールバック
 */
onSuccessToGetParsedData = (_data) => {
  data = _data;
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
  amsData = dataMod;
};

export default {
  init,
  applyData,
};
