// header.js — Header 互動（手機版漢堡選單）
// Header 本體（logo、nav、aria-current、預約諮詢 CTA）已寫死在各頁 HTML，
// 這支只負責綁既有 .site-header 的漢堡開合與收合行為。
import { qs } from './dom-utils.js';

export function initHeader() {
  const headerEl = qs('.site-header');
  if (!headerEl) return;

  const burger = qs('.site-header__burger', headerEl);
  burger?.addEventListener('click', () => {
    const isOpen = headerEl.classList.toggle('is-nav-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? '關閉選單' : '開啟選單');
  });

  // 點擊 nav 連結後（手機版）自動收合選單
  qs('.site-header__nav', headerEl)?.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.matches('.site-header__nav-link')) {
      headerEl.classList.remove('is-nav-open');
      burger?.setAttribute('aria-expanded', 'false');
    }
  });
}
