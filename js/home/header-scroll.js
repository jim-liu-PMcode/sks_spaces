// header-scroll.js — 首頁 Header 捲動變色
// 在最頂端時 header 透明（透出 hero 背景影片），捲離頂端後切換為白底
// （與 products / solutions / faq 三頁相同的 light 主題）。
//
// 做法：切換 <body> 的 data-header-theme（transparent ↔ light），
// 直接沿用 header.css 檔尾既有的整組 light 樣式（底色、nav 連結、CTA、
// 漢堡線條、手機面板），不需要另外複製一份規則。
//
// 用 IntersectionObserver 觀察 hero 裡一個 8px 高的 sentinel，而不是掛
// scroll listener：與全站既有做法一致（lazy-video / reveal-on-scroll /
// count-up），也不必自己寫 rAF 節流。門檻寫在 sentinel 的 CSS 高度裡，
// 留 8px 緩衝讓 iOS rubber-band 不會在 0 附近抖動。

export function initHeaderScroll() {
  const body = document.body;
  const sentinel = document.querySelector('[data-header-sentinel]');

  const setTheme = (atTop) => {
    const next = atTop ? 'transparent' : 'light';
    if (body.dataset.headerTheme !== next) body.dataset.headerTheme = next;
  };

  // index.html 的 inline 開機腳本掛了一個暫時的 scroll 監聽，用來在本模組載入前
  // （module 要等所有 import 解析完）接住瀏覽器還原捲動位置。這裡接手後就拆掉它。
  if (window.__headerBootSync) {
    window.removeEventListener('scroll', window.__headerBootSync);
    delete window.__headerBootSync;
  }

  // 沒有 sentinel 或瀏覽器不支援 IO：一律白底。
  // 寧可失去透明效果，也不能讓白 logo／白字停在透明態疊到白色內容上。
  if (!sentinel || !('IntersectionObserver' in window)) {
    setTheme(false);
    return;
  }

  // 重新整理時瀏覽器會還原捲動位置，先依當下位置同步一次，
  // 避免 observer 首次回呼前閃一下透明。
  setTheme(sentinel.getBoundingClientRect().bottom > 0);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => setTheme(entry.isIntersecting));
  });

  observer.observe(sentinel);
}
