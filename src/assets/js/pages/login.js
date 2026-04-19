'use strict';

window.appPages = window.appPages || {};

window.appPages.login = (function() {
  /**
   * 初始化登录页表单。
   * @returns {void}
   */
  function init() {
    if (auth.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const form = document.getElementById('login-form');
    if (!form) {
      return;
    }

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * 处理演示账号登录。
   * @param {SubmitEvent} event 表单提交事件。
   * @returns {void}
   */
  function handleSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    setText('username-error', '');
    setText('password-error', '');
    setText('login-error', '');

    if (!username) {
      setText('username-error', '请输入用户名');
      return;
    }

    if (!password) {
      setText('password-error', '请输入密码');
      return;
    }

    if (auth.login(username, password)) {
      window.location.href = 'dashboard.html';
    } else {
      setText('login-error', '用户名或密码错误');
    }
  }

  /**
   * 写入字段级错误文案。
   * @param {string} id 目标元素 id。
   * @param {string} text 文案。
   * @returns {void}
   */
  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  return {
    init
  };
})();
