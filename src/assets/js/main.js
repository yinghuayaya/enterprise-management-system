'use strict';

const PUBLIC_PAGES = new Set(['landing.html', 'login.html', 'register.html']);
const BUSINESS_MODULES = {
  employee: 'employeeModule',
  equipment: 'equipmentModule',
  production: 'productionModule',
  purchase: 'purchaseModule',
  sales: 'salesModule',
  warehouse: 'warehouseModule'
};

document.addEventListener('DOMContentLoaded', async () => {
  const pageMeta = getPageMeta();
  const isPublicPage = PUBLIC_PAGES.has(pageMeta.pageName);

  if (!isPublicPage && typeof auth !== 'undefined' && !auth.isLoggedIn()) {
    auth.guard();
    return;
  }

  initCustomCursor();
  initPathObserver();

  await loadPageShell(pageMeta);
  await ensureMobileNav(pageMeta);
  initSharedNavigation();
  await initBusinessModule(pageMeta);
});

function getPageMeta() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pagesIndex = pathParts.indexOf('pages');
  const pageName = pathParts[pathParts.length - 1] || '';

  if (pagesIndex === -1) {
    return {
      pageName,
      section: '',
      pagesPath: '',
      rootPath: ''
    };
  }

  const depth = Math.max(0, pathParts.length - pagesIndex - 2);
  const pagesPath = depth > 0 ? '../'.repeat(depth) : '';
  const rootPath = pagesPath + '../';
  const sectionCandidate = pathParts[pagesIndex + 1] || '';
  const section = sectionCandidate.endsWith('.html') ? '' : sectionCandidate;

  return {
    pageName,
    section,
    pagesPath,
    rootPath
  };
}

async function loadPageShell(pageMeta) {
  const tasks = [];

  if (document.getElementById('header-placeholder')) {
    tasks.push(loadComponent('header-placeholder', pageMeta.rootPath + 'components/header.html'));
  }

  if (document.getElementById('sidebar-placeholder')) {
    tasks.push(loadComponent('sidebar-placeholder', pageMeta.rootPath + 'components/sidebar.html'));
  }

  if (document.getElementById('footer-placeholder')) {
    tasks.push(loadComponent('footer-placeholder', pageMeta.rootPath + 'components/footer.html'));
  }

  await Promise.all(tasks);
}

async function loadComponent(placeholderId, url) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder || placeholder.dataset.loaded === '1') {
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    placeholder.innerHTML = await response.text();
    placeholder.dataset.loaded = '1';
  } catch (error) {
    console.error('Failed to load component:', url, error);
  }
}

async function ensureMobileNav(pageMeta) {
  if (!document.getElementById('sidebar-placeholder') && !document.querySelector('.sidebar')) {
    return;
  }

  if (typeof MobileNav !== 'undefined') {
    return;
  }

  await loadScript(pageMeta.rootPath + 'assets/js/modules/mobile-nav.js', 'mobile-nav');
}

function initSharedNavigation() {
  if (typeof appNav !== 'undefined') {
    appNav.init();
  }

  if (typeof MobileNav !== 'undefined') {
    MobileNav.init();
  }
}

async function initBusinessModule(pageMeta) {
  const moduleGlobal = BUSINESS_MODULES[pageMeta.section];
  if (!moduleGlobal) {
    return;
  }

  if (typeof window[moduleGlobal] === 'undefined') {
    await loadScript(pageMeta.rootPath + 'assets/js/modules/' + pageMeta.section + '.js', pageMeta.section);
  }

  const moduleApi = window[moduleGlobal];
  if (moduleApi && typeof moduleApi.init === 'function') {
    moduleApi.init();
  }
}

function loadScript(src, key) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-runtime-script="' + key + '"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.dataset.runtimeScript = key;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.body.appendChild(script);
  });
}

function initPathObserver() {
  function fixComponentPaths() {
    const pageMeta = getPageMeta();
    if (!pageMeta.rootPath && !pageMeta.pagesPath) return;

    const logoImg = document.getElementById('header-logo-img');
    if (logoImg && !logoImg.dataset.fixed) {
      logoImg.style.display = '';
      logoImg.dataset.fixed = '1';
      setTimeout(() => {
        logoImg.src = pageMeta.rootPath + 'assets/images/logo.png';
      }, 0);
    }

    const sidebarItems = document.querySelectorAll('.sidebar-item[data-page]:not([data-fixed])');
    sidebarItems.forEach((item) => {
      const targetPage = item.getAttribute('data-page');
      const fixedHref = pageMeta.pagesPath + targetPage;
      item.setAttribute('href', fixedHref);
      item.dataset.fixed = '1';
    });
  }

  const observer = new MutationObserver(fixComponentPaths);
  observer.observe(document.body, { childList: true, subtree: true });
  fixComponentPaths();
}

function initCustomCursor() {
  if (window.innerWidth <= 768) return; // 移动端不加载
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  // 避免初始未移动前的卡顿滞后感
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  
  // 使用 requestAnimationFrame 平滑移动
  function updateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * 0.2;
    cursorY += dy * 0.2;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // 为可点击元素增加 hover 态
  const addHover = () => cursor.classList.add('hover');
  const removeHover = () => cursor.classList.remove('hover');

  const interactives = document.querySelectorAll('a, button, input, .module-card, .founder-card, .product-card, .tech-card, .btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', addHover);
    el.addEventListener('mouseleave', removeHover);
  });
}
