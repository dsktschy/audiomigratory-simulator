import $ from 'jquery';

const
  /** モジュール名 */
  MOD_NAME = 'ams-info',
  /** HTML */
  HTML = '' +
    `<div id="${MOD_NAME}" class="${MOD_NAME}">` +
      '<p class="title"></p>' +
      '<p class="userName"></p>' +
    '</div>';

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
