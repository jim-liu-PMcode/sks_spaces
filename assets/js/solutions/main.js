// main.js — 解決方案頁進入點
import { initHeader } from '../common/header.js';
import { injectContactForm } from '../common/contact-form.js?v=20260910-email-label';
import { initSmoothScroll } from '../common/smooth-scroll.js';
import { initRevealOnScroll } from '../common/reveal-on-scroll.js';
import { initTabs } from '../common/tabs.js';
import { initFaqAccordion } from '../common/faq-accordion.js';
import { initScenarioFaqMore } from './scenario-panel.js';
import { initStepsMarquee } from './steps-marquee.js';

function init() {
  // Header/Footer 已寫死在 HTML；header 只綁互動。#site-contact-form 仍為執行期注入，
  // 一定要注入，否則 header、footer 與空狀態裡的「預約諮詢」錨點找不到目標。
  initHeader();
  injectContactForm();

  // hero 的「探索六大場景」與各處錨點都靠這支（事件委派，不怕注入時序）
  initSmoothScroll();

  // 本頁專屬：頁籤與六個場景 panel 已寫死在 HTML，這裡只綁切換、accordion 與「查看更多」
  initTabs({ tablistSelector: '.sl-tabs' });
  initFaqAccordion('.faq__list');
  initScenarioFaqMore();
  // 五步驟跑馬燈：藍線畫線 + 逐步亮起的無限輪播
  initStepsMarquee();
  initRevealOnScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
