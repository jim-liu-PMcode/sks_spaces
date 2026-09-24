// smooth-scroll.js — data-scroll-target 錨點捲動
// 用事件代理（監聽 document）而非直接綁在按鈕上，因為 header/footer/表單
// 都是「JS 注入」進 DOM，注入時間點不確定，事件代理可以保證任何時候點擊
// 具 data-scroll-target 的元素都能正確運作，不怕注入時序問題。
export function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target.closest('[data-scroll-target]') : null;
    if (!target) return;

    const selector = target.getAttribute('data-scroll-target');
    if (!selector || !selector.startsWith('#')) return;

    const destination = document.querySelector(selector);
    if (!destination) return;

    e.preventDefault();
    const headerOffset = document.querySelector('.site-header')?.offsetHeight ?? 0;
    const top = destination.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}
