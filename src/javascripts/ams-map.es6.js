import $ from 'jquery';

const
  MOD_NAME = 'ams-map',
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`;

var init, jqueryMap, setJqueryMap;

/**
 * jqueryオブジェクトを保持
 */
setJqueryMap = () => {
  jqueryMap = {
    [`$${MOD_NAME}`]: $(`#${MOD_NAME}`),
  };
};

/**
 * module起動
 * @exports
 */
init = ($wrapper) => {
  $wrapper.append(HTML);
  setJqueryMap();
};

export default {
  init,
};
