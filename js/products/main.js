// main.js — 產品介紹頁進入點，初始化所有共用模組 + 本頁專屬模組
import { initHeader } from '../common/header.js';
import { injectContactForm } from '../common/contact-form.js?v=20260910-email-label';
import { initSmoothScroll } from '../common/smooth-scroll.js';
import { initRevealOnScroll } from '../common/reveal-on-scroll.js';
import { initFaqAccordion } from '../common/faq-accordion.js';
import { initDragCarousel } from '../common/carousel.js?v=20260904-figma-sync-2';
import { initTabs } from '../common/tabs.js';

function init() {
  // Header/Footer 已寫死在 HTML；header 只綁互動。#site-contact-form 仍為執行期注入，
  // 一定要注入，否則 header 與 footer 的「預約諮詢」錨點找不到目標，按下去會完全沒反應。
  initHeader();
  injectContactForm();

  // 共用互動邏輯
  initSmoothScroll();
  initFaqAccordion('.faq__list');

  // 本頁專屬：頁籤與三個產品 panel 已寫死在 HTML，這裡只綁切換與輪播
  initTabs({
    tablistSelector: '.pd-tabs',
    onSelect(index, tabEl, panelEl) {
      // 切換分類後卡片列回到第一筆（會議決定的行為，維持不變）
      const scroller = panelEl ? panelEl.querySelector('.pd-products__scroller') : null;
      if (scroller) scroller.scrollLeft = 0;
    },
  });

  // carousel.js 一次只綁一個 scroller，三個 panel 各自帶箭頭與 scroller，
  // 所以以 panel id scope 各呼叫一次
  ['#pd-panel-host', '#pd-panel-camera', '#pd-panel-sensor'].forEach((panelId) => {
    initDragCarousel({
      scrollerSelector: `${panelId} .pd-products__scroller`,
      prevSelector: `${panelId} .pd-products__arrow--prev`,
      nextSelector: `${panelId} .pd-products__arrow--next`,
      cardSelector: '.pd-card',
    });
  });
  initRevealOnScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
