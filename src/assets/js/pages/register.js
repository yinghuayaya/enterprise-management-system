'use strict';

window.appPages = window.appPages || {};

window.appPages.register = (function() {
  /**
   * 初始化注册页表单。
   * @returns {void}
   */
  function init() {
    if (auth.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const form = document.getElementById('register-form');
    if (!form) {
      return;
    }

    form.addEventListener('submit', handleSubmit);
  }

  /**
   * 处理本地演示账号注册。
   * @param {SubmitEvent} event 表单提交事件。
   * @returns {void}
   */
  function handleSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    clearErrors();

    if (!username) {
      setText('username-error', '请输入用户名');
      return;
    }

    if (!email) {
      setText('email-error', '请输入邮箱');
      return;
    }

    const emailError = validators.email(email);
    if (emailError) {
      setText('email-error', emailError);
      return;
    }

    if (!password) {
      setText('password-error', '请输入密码');
      return;
    }

    if (password.length < 6) {
      setText('password-error', '密码长度至少为6位');
      return;
    }

    if (!confirmPassword) {
      setText('confirmPassword-error', '请再次输入密码');
      return;
    }

    if (password !== confirmPassword) {
      setText('confirmPassword-error', '两次输入的密码不一致');
      return;
    }

    if (auth.register && auth.register(username, email, password)) {
      const errorDiv = document.getElementById('register-error');
      if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.color = 'var(--color-success)';
        errorDiv.textContent = '注册成功！即将跳转到登录页面。';
      }
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else {
      setText('register-error', '注册失败，用户名或邮箱可能已被使用');
    }
  }

  /**
   * 清除注册页所有错误文案。
   * @returns {void}
   */
  function clearErrors() {
    ['username-error', 'email-error', 'password-error', 'confirmPassword-error', 'register-error']
      .forEach((id) => setText(id, ''));
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
