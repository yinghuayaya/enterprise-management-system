'use strict';

window.appPages = window.appPages || {};

window.appPages.dashboard = (function() {
  /**
   * 初始化仪表盘欢迎信息。
   * @returns {void}
   */
  function init() {
    const user = auth.getUser();
    const welcomeName = document.getElementById('welcome-name');
    const welcomeTime = document.getElementById('welcome-time');

    if (user && welcomeName) {
      welcomeName.textContent = user.username;
    }

    if (welcomeTime) {
      welcomeTime.textContent = formatDate(new Date(), 'YYYY年MM月DD日 HH:mm') + ' · 今天也是充满活力的一天';
    }
  }

  return {
    init
  };
})();
