import $ from 'jquery';

const
  MOD_NAME = 'ams-icons',
  ICON_MAP_ = new Map([
    ['main', {
      href: '//audiomigratory.com/',
      src: 'images/am_icon.png',
      alt: 'am_icon',
      html: undefined,
    }],
    ['twitter', {
      href: '//twitter.com/audiomigratory',
      src: 'images/twitter_icon.gif',
      alt: 'twitter_icon',
      html: undefined,
    }],
    ['facebook', {
      href: '//www.facebook.com/ryu.furusawa',
      src: 'images/facebook_icon.gif',
      alt: 'facebook_icon',
      html: undefined,
    }],
  ]),
  ICON_WIDTH = 36,
  ICON_HEIGHT = 36,
  SIZE_ATTR = `width="${ICON_WIDTH}" height="${ICON_HEIGHT}"`,
  HTML = `<div id="${MOD_NAME}" class="${MOD_NAME}"></div>`;

var init, jqueryMap, setJqueryMap;

for (let [k, v] of ICON_MAP_) {
  v.html = '' +
    '<p>' +
      `<a href="${v.href}" target="_blank">` +
        `<img src="${v.src}" ${SIZE_ATTR} alt="${v.alt}">` +
      '</a>' +
    '</p>';
}

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
  for (let [k, v] of ICON_MAP_) {
    jqueryMap[`$${MOD_NAME}`].append(v.html);
  }
};

export default {
  init,
};
