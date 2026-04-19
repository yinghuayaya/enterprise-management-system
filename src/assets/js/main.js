'use strict';

/**
 * 企业管理系统统一启动入口。
 * 输入：当前页面路径、页面已有 script 标签和公共组件占位符。
 * 输出：完成运行时加载、登录守卫、公共组件注入、导航初始化和当前业务域初始化。
 *
 * 原因：项目没有构建工具，每个 HTML 只负责引入基础脚本，剩余运行时能力由 main.js 按页面动态装配。
 */
document.addEventListener('DOMContentLoaded', async () => {
  const initialMeta = getInitialPageMeta();

  try {
    await loadUtilityRuntime(initialMeta.rootPath);
    await loadCoreRuntime(initialMeta.rootPath);

    const pageMeta = appRouter.getPageMeta();
    if (!appRouter.isPublicPage(pageMeta) && typeof auth !== 'undefined' && !auth.isLoggedIn()) {
      auth.guard();
      return;
    }

    const pageController = getPageController(pageMeta);
    await loadPageDependencies(pageMeta, pageController);

    appCursor.init();
    appRouter.initPathObserver();

    await appShell.loadPageShell(pageMeta);
    await appShell.ensureMobileNav(pageMeta);
    appShell.initSharedNavigation();
    await appScriptLoader.initBusinessSystem(pageMeta);
    initPageController(pageController);
  } catch (error) {
    console.error('App bootstrap failed:', error);
  }
});

const PAGE_CONTROLLERS = {
  'dashboard.html': 'dashboard',
  'landing.html': 'landing',
  'login.html': 'login',
  'register.html': 'register'
};

const PAGE_EXTRA_UTILS = {
  register: ['validate']
};

const SCRIPT_READY_TIMEOUT = 15000;

/**
 * 根据脚本标识返回运行时就绪探测函数。
 * @param {string} key data-runtime-script 去重标识。
 * @returns {Function|undefined} 对应脚本执行完成时返回 true 的探测函数。
 *
 * 原因：部分 CDN/浏览器组合可能出现动态脚本已执行但 load 事件迟迟不触发，探测全局注册结果可以避免启动链路卡死。
 */
function getRuntimeReadyCheck(key) {
  const checks = {
    'utils-dom': () => typeof $ === 'function' && typeof $$ === 'function',
    'utils-storage': () => typeof storage !== 'undefined',
    'utils-format': () => typeof formatDate === 'function' && typeof formatNumber === 'function',
    'utils-validate': () => typeof validateForm === 'function',
    'core-module-loader': () => !!window.appScriptLoader,
    'core-router': () => !!window.appRouter,
    'core-shell': () => !!window.appShell,
    'core-cursor': () => !!window.appCursor,
    'core-auth': () => !!window.auth,
    'core-navigation': () => !!window.appNav
  };

  if (key.startsWith('page-')) {
    const pageName = key.replace('page-', '');
    return () => !!(window.appPages && window.appPages[pageName]);
  }

  return checks[key];
}

/**
 * 加载页面和业务都依赖的基础工具。
 * @param {string} rootPath 当前页面回到 src 根目录的相对路径。
 * @returns {Promise<void>} DOM、存储、格式化工具依次加载后 resolve。
 *
 * 原因：HTML 只保留 main.js 单入口，基础工具必须由启动器统一装配。
 */
async function loadUtilityRuntime(rootPath) {
  const utilityScripts = ['dom', 'storage', 'format'];

  for (const name of utilityScripts) {
    await loadRuntimeScript(rootPath + 'assets/js/utils/' + name + '.js', 'utils-' + name);
  }
}

/**
 * 在 router 加载前计算基础资源路径。
 * @returns {{pageName: string, rootPath: string}} 当前页面名和回到 src 根目录的路径。
 *
 * 原因：core/router.js 自身也需要通过正确路径加载，bootstrap 阶段不能依赖尚未加载的 router。
 */
function getInitialPageMeta() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pagesIndex = pathParts.indexOf('pages');
  const lastSegment = pathParts[pathParts.length - 1] || 'index.html';
  const pageName = lastSegment.includes('.') ? lastSegment : `${lastSegment}.html`;

  if (pagesIndex === -1) {
    return {
      pageName,
      rootPath: ''
    };
  }

  const depth = Math.max(0, pathParts.length - pagesIndex - 2);
  const pagesPath = depth > 0 ? '../'.repeat(depth) : '';

  return {
    pageName,
    rootPath: pagesPath + '../'
  };
}

/**
 * 按启动依赖顺序加载 core 运行时。
 * @param {string} rootPath 当前页面回到 src 根目录的相对路径。
 * @returns {Promise<void>} module-loader、router、shell、cursor 依次加载后 resolve。
 *
 * 原因：后续步骤依赖 appRouter/appShell/appScriptLoader，全局对象必须先注册。
 */
async function loadCoreRuntime(rootPath) {
  const coreScripts = ['module-loader', 'router', 'shell', 'cursor', 'auth', 'navigation'];

  for (const name of coreScripts) {
    await loadRuntimeScript(rootPath + 'assets/js/core/' + name + '.js', 'core-' + name);
  }
}

/**
 * 根据页面名匹配页面级控制器。
 * @param {{pageName: string}} pageMeta 当前页面元信息。
 * @returns {string|undefined} 页面控制器名称，无页面控制器时返回 undefined。
 */
function getPageController(pageMeta) {
  return PAGE_CONTROLLERS[pageMeta.pageName];
}

/**
 * 加载页面级控制器及其专属工具。
 * @param {{rootPath: string}} pageMeta 当前页面元信息。
 * @param {string|undefined} controllerName 页面控制器名称。
 * @returns {Promise<void>} 页面依赖加载完成后 resolve。
 */
async function loadPageDependencies(pageMeta, controllerName) {
  if (!controllerName) {
    return;
  }

  const extraUtils = PAGE_EXTRA_UTILS[controllerName] || [];
  for (const name of extraUtils) {
    await loadRuntimeScript(pageMeta.rootPath + 'assets/js/utils/' + name + '.js', 'utils-' + name);
  }

  await loadRuntimeScript(
    pageMeta.rootPath + 'assets/js/pages/' + controllerName + '.js',
    'page-' + controllerName
  );
}

/**
 * 初始化页面级控制器。
 * @param {string|undefined} controllerName 页面控制器名称。
 * @returns {void}
 */
function initPageController(controllerName) {
  if (!controllerName || !window.appPages) {
    return;
  }

  const controller = window.appPages[controllerName];
  if (controller && typeof controller.init === 'function') {
    controller.init();
  }
}

/**
 * 加载启动阶段需要的运行时脚本。
 * @param {string} src 脚本路径。
 * @param {string} key data-runtime-script 去重标识。
 * @returns {Promise<void>} 脚本加载完成后 resolve，失败时 reject。
 *
 * 原因：经典脚本重复加载会重复注册全局对象和事件监听，key 用于保证多次调用仍只注入一次。
 */
function loadRuntimeScript(src, key) {
  return new Promise((resolve, reject) => {
    const readyCheck = getRuntimeReadyCheck(key);
    const existing = document.querySelector('script[data-runtime-script="' + key + '"]');
    let settled = false;
    let readyTimer = null;
    let timeoutTimer = null;

    function finish(callback, value) {
      if (settled) {
        return;
      }

      settled = true;
      if (readyTimer) clearInterval(readyTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      callback(value);
    }

    function isReady() {
      try {
        return !!(readyCheck && readyCheck());
      } catch {
        return false;
      }
    }

    function watchReady(script) {
      if (!readyCheck) {
        return;
      }

      if (isReady()) {
        finish(resolve);
        return;
      }

      readyTimer = setInterval(() => {
        if (isReady()) {
          finish(resolve);
        }
      }, 50);

      timeoutTimer = setTimeout(() => {
        finish(reject, new Error('Timed out waiting for script runtime: ' + src));
      }, SCRIPT_READY_TIMEOUT);

      script.addEventListener('load', () => finish(resolve));
      script.addEventListener('error', () => finish(reject, new Error('Failed to load script: ' + src)));
    }

    if (existing) {
      if (!readyCheck || isReady()) {
        resolve();
        return;
      }

      watchReady(existing);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.dataset.runtimeScript = key;
    script.onload = () => finish(resolve);
    script.onerror = () => finish(reject, new Error('Failed to load script: ' + src));
    watchReady(script);
    document.body.appendChild(script);
  });
}
