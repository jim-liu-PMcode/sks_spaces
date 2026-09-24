// main.js — FAQ 頁進入點
import { initHeader } from '../common/header.js';
import { injectContactForm } from '../common/contact-form.js?v=20260910-email-label';
import { initSmoothScroll } from '../common/smooth-scroll.js';
import { initRevealOnScroll } from '../common/reveal-on-scroll.js';
import { initTabs } from '../common/tabs.js';
import { initFaqAccordion } from '../common/faq-accordion.js';

function init() {
  // Header/Footer 已寫死在 HTML；header 只綁互動。#site-contact-form 仍為執行期注入，
  // 一定要注入，否則 header 與 footer 的「預約諮詢」錨點找不到目標，按下去會完全沒反應。
  initHeader();
  injectContactForm();

  initSmoothScroll();

  // 本頁專屬：頁籤與問答清單已寫死在 HTML，這裡只綁切換與 accordion
  initTabs({ tablistSelector: '.fq-tabs' });
  initFaqAccordion('.faq__list');
  initRevealOnScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
