// main.js — 首頁進入點，初始化所有共用模組 + 首頁專屬模組
import { initHeader } from '../common/header.js';
import { injectContactForm } from '../common/contact-form.js?v=20260910-email-label';
import { initSmoothScroll } from '../common/smooth-scroll.js';
import { initRevealOnScroll } from '../common/reveal-on-scroll.js';
import { initCountUp } from '../common/count-up.js';
import { initFaqAccordion } from '../common/faq-accordion.js';
import { initLazyVideo } from './lazy-video.js';
import { initResilienceOrbit } from './resilience-orbit.js';
import { initVideoFade } from './video-fade.js';
import { initTypeText } from './type-text.js';
import { initDragCarousel } from '../common/carousel.js?v=20260904-figma-sync-2';
import { initHeaderScroll } from './header-scroll.js';

function init() {
  // Header/Footer 已寫死在 HTML；header 只綁互動。#site-contact-form 仍為執行期注入，
  // 一定要注入，否則 header 與 footer 的「預約諮詢」錨點找不到目標。
  initHeader();
  // 首頁專屬：header 在頂端透明、捲離頂端轉白（common/header.js 四頁共用，刻意不動它）
  initHeaderScroll();
  injectContactForm();

  // 共用互動邏輯
  initSmoothScroll();
  initRevealOnScroll();
  initCountUp('.stats');
  initFaqAccordion('.faq__list');

  // 首頁專屬互動邏輯
  initVideoFade('.hero__device video');
  initTypeText('[data-typewriter]');
  // 選 video[loop] 而非 [data-lazy-video]：除了延遲載入，這個模組也負責
  // 「離開視窗就暫停」，那件事對已經寫死 <source> 的 hero1 與兩支裝置影片同樣要做。
  initLazyVideo('video[loop]');
  initResilienceOrbit();
  initDragCarousel({
    scrollerSelector: '.solutions__scroller',
    prevSelector: '.solutions__arrow--prev',
    nextSelector: '.solutions__arrow--next',
    cardSelector: '.solutions__card',
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
