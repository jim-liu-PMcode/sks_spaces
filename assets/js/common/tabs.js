// tabs.js — 共用頁籤元件（產品介紹／解決方案／FAQ 三頁共用）
//
// 按鈕與 panel 都已寫死在 HTML：每顆按鈕的 aria-controls 指向自己的 panel id，
// aria-selected／tabindex／is-active 的初始狀態也烤死在標記裡。這支只負責「切換」：
// 維護選中狀態、panel 的 hidden 顯隱、無障礙屬性與鍵盤操作。切換後要做什麼
// （例如產品頁把卡片列捲回開頭）交給呼叫端的 onSelect 決定。
//
// 樣式在 assets/css/components/tabs.css，兩種外觀由 .tabs--pill / .tabs--card 決定。

/**
 * @param {string}   tablistSelector  頁籤容器選擇器（內含靜態 .tabs__tab 按鈕，
 *                                    每顆 aria-controls 指向自己的 panel id）
 * @param {Function} [onSelect]       (index, tabEl, panelEl) => void，切換時呼叫
 *                                    （初始化「不會」呼叫——靜態 HTML 已是正確狀態）
 * @returns {{ select: Function, getIndex: Function }|undefined}
 */
export function initTabs({ tablistSelector, onSelect }) {
  const tablist = document.querySelector(tablistSelector);
  if (!tablist) return undefined;

  const buttons = Array.from(tablist.querySelectorAll('.tabs__tab'));
  if (!buttons.length) return undefined;

  const panels = buttons.map((btn) =>
    document.getElementById(btn.getAttribute('aria-controls'))
  );
  let activeIndex = Math.max(
    0,
    buttons.findIndex((btn) => btn.getAttribute('aria-selected') === 'true')
  );

  function select(index) {
    if (index === activeIndex || index < 0 || index >= buttons.length) return;
    activeIndex = index;

    buttons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });

    // panel 的 aria-labelledby 已烤死指回自己的 tab，這裡只切顯隱
    panels.forEach((panel, i) => {
      if (panel) panel.hidden = i !== index;
    });

    if (typeof onSelect === 'function') onSelect(index, buttons[index], panels[index]);
  }

  // 用委派而不是逐顆綁定：日後增刪頁籤不必重綁
  tablist.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('.tabs__tab') : null;
    if (!btn) return;
    select(buttons.indexOf(btn));
  });

  // 鍵盤操作依 WAI-ARIA tabs pattern：←／→ 循環，Home／End 跳頭尾
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();

    let next = activeIndex;
    if (e.key === 'ArrowLeft') next = (activeIndex - 1 + buttons.length) % buttons.length;
    if (e.key === 'ArrowRight') next = (activeIndex + 1) % buttons.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = buttons.length - 1;

    select(next);
    buttons[next].focus();
  });

  return { select, getIndex: () => activeIndex };
}
