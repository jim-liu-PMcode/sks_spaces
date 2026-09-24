// scenario-panel.js — 解決方案頁「六大場景」FAQ 的「查看更多」展開
//
// 場景內容（圖片、說明、配置表、效益、FAQ）已全部寫死在 solutions.html 的
// 六個 tabpanel 裡：頁籤切換交給 common/tabs.js，accordion 交給
// common/faq-accordion.js（載入時一次綁定所有 .faq__list，含 hidden panel 內的）。
// 這支只剩一件事：每個場景 FAQ 先顯示 4 題，其餘收在 hidden 的
// .sl-scene__faq-more，按「查看更多」展開。
export function initScenarioFaqMore() {
  // 事件委派綁在 document：六個 panel 各有一顆按鈕，一次委派全包
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-faq-more]') : null;
    if (!btn) return;

    // 從按鈕往上找自己所屬場景的 FAQ 區塊，再往下找 hidden 的其餘題目
    //（不能抓整頁第一個 .sl-scene__faq-more——六個 panel 各有一份）
    const faqBlock = btn.closest('.sl-scene__faq');
    const more = faqBlock ? faqBlock.querySelector('.sl-scene__faq-more') : null;
    if (!more) return;

    more.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    // 用 hidden 而不是 remove()：切走再切回時保留已展開狀態
    const footer = btn.closest('.sl-scene__faq-footer');
    if (footer) footer.hidden = true;
  });
}
