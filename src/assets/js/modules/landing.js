'use strict';
const landing = (function () {
  /**
   * 批量为页面上所有锚点链接绑定平滑滚动事件。
   * @returns {void}
   *
   * 原因：前台展示页使用单页锚点导航，阻止默认跳转可以保留平滑滚动体验。
   */
  function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });
  }

  /**
   * 处理单个锚点链接的点击事件。
   * @param {Event} e 浏览器传入的点击事件对象；this 指向被点击的 a 标签。
   * @returns {void}
   *
   * 原因：拦截浏览器默认的瞬间跳转，改为平滑滚动到目标位置，提升用户体验。
   */
  function handleAnchorClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }


  /**
   * 控制落地页移动端菜单展开与收起。
   * @returns {void}
   */
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('active');
    });

    // 链接点击后收起菜单，避免移动端菜单遮挡滚动到的目标区块。
    document.querySelectorAll('.mobile-menu-nav a').forEach(link => {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('active');
      });
    });
  }

  /**
   * 为落地页展示元素绑定进入视口动画。
   * @returns {void}
   *
   * 原因：IntersectionObserver 能让动画只在元素接近视口时触发，减少首屏加载时的动画压力。
   */
  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // 不同展示块使用不同动画节奏，保持统计、技术、产品和伙伴区的视觉层次。
          const element = entry.target;

          if (element.classList.contains('hero-container')) {
            element.classList.add('fade-in');
          } else if (element.classList.contains('stat-card')) {
            element.classList.add('slide-up');
            element.classList.add(`delay-${(index % 3) * 100}`);
          } else if (element.classList.contains('tech-card')) {
            element.classList.add('scale-in');
            element.classList.add(`delay-${(index % 3) * 100}`);
          } else if (element.classList.contains('product-card')) {
            element.classList.add('slide-up');
            element.classList.add(`delay-${(index % 6) * 100}`);
          } else if (element.classList.contains('founder-card')) {
            element.classList.add('fade-in');
            element.classList.add(`delay-${(index % 4) * 100}`);
          } else if (element.classList.contains('partner-logo')) {
            element.classList.add('scale-in');
            element.classList.add(`delay-${(index % 9) * 100}`);
          } else if (element.classList.contains('cta')) {
            element.classList.add('slide-up');
          }

          // 动画只触发一次，避免用户来回滚动时重复闪烁。
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // 只观察落地页核心展示模块，避免把导航和页脚普通元素纳入动画队列。
    document.querySelectorAll('.hero-container, .stat-card, .tech-card, .product-card, .founder-card, .partner-logo, #cta').forEach(el => {
      observer.observe(el);
    });
  }

  return {
    /**
     * 初始化落地页专属交互。
     * @returns {void}
     *
     * 原因：落地页不进入后台业务模块加载链路，脚本在页面底部直接运行。
     */
    init: function () {
      initSmoothScroll();

      initMobileMenu();
      initAnimations();
    }
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  landing.init();
});
