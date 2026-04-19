'use strict';

const appCursor = (function() {
  const DISABLE_QUERY = '(max-width: 768px), (pointer: coarse), (prefers-reduced-motion: reduce)';
  const HOVER_SELECTOR = [
    'a',
    'button',
    '[role="button"]',
    '.btn',
    '.module-card',
    '.founder-card',
    '.product-card',
    '.tech-card',
    '.sidebar-item'
  ].join(', ');
  const TEXT_SELECTOR = 'input, textarea, select, [contenteditable="true"], .form-control';

  /**
   * 初始化桌面端品牌光标替代指针。
   * 输入：读取当前视口宽度和页面内可交互元素；无显式参数。
   * 输出：向 body 注入两层 `.custom-cursor` 并绑定 pointer 跟随与状态反馈。
   * 原因：只在真实鼠标环境隐藏系统指针，避免触屏和减少动效场景出现多余装饰。
   */
  function init() {
    if (window.matchMedia(DISABLE_QUERY).matches || document.querySelector('.custom-cursor')) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<span class="custom-cursor__ring"></span><span class="custom-cursor__dot"></span>';
    document.body.appendChild(cursor);

    const ring = cursor.querySelector('.custom-cursor__ring');
    const dot = cursor.querySelector('.custom-cursor__dot');
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;
    let hasPosition = false;

    /**
     * 按动画帧平滑拖动外圈。
     * @returns {void}
     *
     * 原因：中心点需要精准，外圈稍慢半拍才有跟随质感。
     */
    function render() {
      if (hasPosition) {
        ringX += (targetX - ringX) * 0.18;
        ringY += (targetY - ringY) * 0.18;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    document.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasPosition) {
        ringX = targetX;
        ringY = targetY;
        hasPosition = true;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      document.documentElement.classList.add('has-custom-cursor');
      cursor.classList.add('is-visible');
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      updateState(event.target, cursor);
    });

    document.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-visible');
      document.documentElement.classList.remove('has-custom-cursor');
    });

    document.addEventListener('pointerenter', () => {
      if (hasPosition) {
        document.documentElement.classList.add('has-custom-cursor');
        cursor.classList.add('is-visible');
      }
    });
  }

  /**
   * 根据当前悬停元素切换指针状态。
   * @param {EventTarget|null} target 当前 pointermove 目标。
   * @param {HTMLElement} cursor 光标根节点。
   * @returns {void}
   */
  function updateState(target, cursor) {
    const element = target instanceof Element ? target : null;
    const isText = !!(element && element.closest(TEXT_SELECTOR));
    const isHover = !isText && !!(element && element.closest(HOVER_SELECTOR));

    cursor.classList.toggle('is-text', isText);
    cursor.classList.toggle('is-hover', isHover);
  }

  return {
    init
  };
})();

window.appCursor = appCursor;
