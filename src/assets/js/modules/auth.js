'use strict';

const auth = {
  USER_KEY: 'xm_user',

  login(username, password) {
    try {
      if (username === 'admin' && password === '123456') {
        const user = { username, role: '管理员', loginTime: Date.now() };
        storage.session.set(this.USER_KEY, user);
        return true;
      }
    } catch (error) {
      console.error('auth.login failed:', error);
    }
    return false;
  },

  logout() {
    try {
      storage.session.remove(this.USER_KEY);
      const pathParts = window.location.pathname.split('/');
      const pagesIndex = pathParts.lastIndexOf('pages');
      if (pagesIndex !== -1) {
        const depth = pathParts.length - pagesIndex - 2;
        const relativePath = depth > 0 ? '../'.repeat(depth) : './';
        window.location.href = relativePath + 'landing.html';
        return;
      }
    } catch (error) {
      console.error('auth.logout failed:', error);
    }
    window.location.href = 'landing.html';
  },

  getUser() {
    try {
      return storage.session.get(this.USER_KEY);
    } catch (error) {
      console.error('auth.getUser failed:', error);
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  guard() {
    try {
      if (!this.isLoggedIn()) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        let depth = 0;
        for (let i = 0; i < pathParts.length; i += 1) {
          if (pathParts[i] === 'pages') {
            depth = pathParts.length - i - 1;
            break;
          }
        }
        const basePath = '../'.repeat(depth > 0 ? depth : 1);
        window.location.href = basePath + 'pages/login.html';
      }
    } catch (error) {
      console.error('auth.guard failed:', error);
    }
  },

  register(username, email, password) {
    try {
      const users = storage.get('xm_users') || [];
      const exists = users.some((user) => user.username === username || user.email === email);
      if (exists) {
        return false;
      }
      users.push({ username, email, password, regTime: Date.now() });
      storage.set('xm_users', users);
      return true;
    } catch (error) {
      console.error('auth.register failed:', error);
      return false;
    }
  }
};
