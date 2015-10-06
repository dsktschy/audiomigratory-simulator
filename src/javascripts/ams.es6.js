import $ from 'jquery';
import amsMap from './ams-map';
import amsIcons from './ams-icons';
import amsInfo from './ams-info';

const
  MOD_NAME = 'ams',
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`;

var init, jqueryMap, setJqueryMap, map;

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
  amsMap.init(jqueryMap[`$${MOD_NAME}`]);
  amsIcons.init(jqueryMap[`$${MOD_NAME}`]);
  amsInfo.init(jqueryMap[`$${MOD_NAME}`]);
  map = amsMap.create();
};

export default {
  init,
};
