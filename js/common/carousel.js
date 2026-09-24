// carousel.js — 橫向手動捲動輪播（共用元件，無自動輪播）
// 兩種捲動方式並存：左右箭頭按鈕（scrollBy）／滑鼠拖曳或觸控滑動（Pointer
// Events）。卡片本身可以是連結，點擊時依 href 導轉；捲動不會自動對齊卡片。
//
// 原本在 assets/js/home/carousel.js（只服務首頁 solutions 區），因產品介紹頁的
// 產品輪播也需要同一套行為而搬到 common/。搬過來時做了兩處修改，讓它能承受
// 「卡片被整批重新渲染」的情境（產品頁切換頁籤時會重建整列卡片）：
//   1. 量卡片寬度改成即時查詢 DOM，不再於 init 時快照成陣列（否則參照會過期）。
//   2. dragstart 的 preventDefault 改成綁在 scroller 上做事件委派，不再逐卡綁定。
// 因此呼叫端只需要 init 一次，重新渲染後不必（也不應）重複呼叫。
export function initDragCarousel({
  scrollerSelector,
  prevSelector,
  nextSelector,
  cardSelector,
}) {
  const scroller = document.querySelector(scrollerSelector);
  if (!scroller) return;

  const prevBtn = document.querySelector(prevSelector);
  const nextBtn = document.querySelector(nextSelector);

  // 卡片可能是連結，但水平拖曳時不應觸發瀏覽器原生的「拖出網址」行為。
  // 用委派而非逐卡綁定，重新渲染後依然有效。
  scroller.addEventListener('dragstart', (e) => {
    if (e.target instanceof Element && e.target.closest(cardSelector)) {
      e.preventDefault();
    }
  });

  function scrollByCard(direction) {
    // 即時查詢：卡片可能已被重新渲染，不能用 init 當時的參照
    const cards = scroller.querySelectorAll(cardSelector);
    if (!cards.length) return;

    // 位移量用「相鄰兩張卡的左緣距離」實測，而不是「卡寬 + 寫死的 gap」，
    // 否則 gap 一改（目前兩頁都是 24px）每次捲動就會少幾 px，連按會累積偏移。
    const first = cards[0].getBoundingClientRect();
    const amount =
      cards.length > 1
        ? cards[1].getBoundingClientRect().left - first.left
        : first.width + 24;
    scroller.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));

  // ---- 端點狀態 ----
  // 捲到最左／最右時把對應的箭頭停用（Figma 產品頁畫的左箭頭是深色、右箭頭是藍色，
  // 表達的就是「已經在最左端」）。除了 class 也一併設 disabled 屬性，鍵盤與輔助
  // 技術才拿得到正確狀態。外觀各頁自理：首頁 solutions 沒有 .is-disabled 樣式，
  // 拿到 class 也看不出差別，等於維持原本外觀。
  function setDisabled(btn, disabled) {
    if (!btn) return;
    btn.classList.toggle('is-disabled', disabled);
    btn.disabled = disabled;
  }

  function updateEdgeState() {
    const max = scroller.scrollWidth - scroller.clientWidth;
    // 1px 容差：scrollLeft 可能是小數（縮放、smooth 捲動收尾；hidden 的 panel 全為 0）
    const noOverflow = max <= 1;
    setDisabled(prevBtn, noOverflow || scroller.scrollLeft <= 1);
    setDisabled(nextBtn, noOverflow || scroller.scrollLeft >= max - 1);
  }

  // scroll 事件每個 frame 都會來，用 rAF 併成一次，避免反覆讀 scrollWidth 觸發 layout
  let edgeRaf = 0;
  function scheduleEdgeUpdate() {
    if (edgeRaf) return;
    edgeRaf = requestAnimationFrame(() => {
      edgeRaf = 0;
      updateEdgeState();
    });
  }

  scroller.addEventListener('scroll', scheduleEdgeUpdate);

  // 尺寸變動要重算：視窗縮放，以及產品頁切換頁籤時 panel 從 hidden 變可見
  // （寬度 0 → 實際寬度，ResizeObserver 會補一次）。
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(scheduleEdgeUpdate).observe(scroller);
  } else {
    window.addEventListener('resize', scheduleEdgeUpdate);
  }

  // 內容變動（卡片被整批重新渲染）也要重算；childList 就夠，不必看 subtree
  if (typeof MutationObserver === 'function') {
    new MutationObserver(scheduleEdgeUpdate).observe(scroller, { childList: true });
  }

  updateEdgeState();

  // Pointer Events 處理拖曳滑動（桌機滑鼠 + 觸控裝置皆適用）
  //
  // 關鍵：setPointerCapture 必須等「確定在拖曳」之後才呼叫，不能在 pointerdown 就抓。
  // 一旦 capture 生效，後續相容性滑鼠事件（含 click）會被重導到 capture 元素，
  // click 的 target 變成 scroller 而不是卡片，瀏覽器就永遠不會啟動 <a> 連結
  // ——結果是桌機使用者用滑鼠點卡片完全沒反應（觸控與鍵盤 Enter 不受影響）。
  // 但 capture 也不能整個拿掉：沒有它，指標一離開容器就觸發 pointerleave 而中斷拖曳，
  // 可拖曳距離會從 280px 掉到 35px。所以做成「超過位移門檻才 capture」：
  // 單純點擊全程沒有 capture（連結正常），真的拖曳時才抓住指標。
  const DRAG_THRESHOLD = 4;
  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let didDrag = false;
  let hasCapture = false;
  let activePointerId = null;

  scroller.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    didDrag = false;
    hasCapture = false;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startScrollLeft = scroller.scrollLeft;
  });

  scroller.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;

    // 保險：pointerup 有可能整個遺失（實測 Firefox 在容器外放開滑鼠時就會這樣，
    // 另外切換視窗、把指標拖出瀏覽器也會）。那時 isPointerDown 會永久為 true，
    // 使用者只要把滑鼠移過卡片列就會誤觸捲動、且下一次點擊被吞。
    // e.buttons === 0 表示已經沒有任何按鍵壓著 → 視同拖曳結束。
    if (e.buttons === 0) {
      endDrag(e);
      return;
    }

    const delta = e.clientX - startX;

    if (!didDrag) {
      if (Math.abs(delta) <= DRAG_THRESHOLD) return;
      didDrag = true;
      scroller.classList.add('is-dragging');
      try {
        scroller.setPointerCapture(e.pointerId);
        hasCapture = true;
      } catch (err) {
        /* 指標已結束，忽略；沒有 capture 也還能拖，只是離開容器會中斷 */
      }
    }

    scroller.scrollLeft = startScrollLeft - delta;
  });

  // 用記錄下來的 activePointerId 而不是 e.pointerId，這樣沒有事件物件也能收尾（例如 blur）
  function endDrag() {
    if (!isPointerDown) return;
    isPointerDown = false;
    scroller.classList.remove('is-dragging');
    if (!hasCapture) {
      activePointerId = null;
      return;
    }
    hasCapture = false;
    try {
      if (activePointerId !== null) scroller.releasePointerCapture(activePointerId);
    } catch (err) {
      /* pointer 可能已釋放，忽略 */
    }
    activePointerId = null;
  }

  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  scroller.addEventListener('pointerleave', endDrag);
  // 指標在容器外放開、或使用者切走視窗時，上面三個事件可能都不會來
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('blur', endDrag);

  // 拖曳後避免誤觸發卡片 click
  scroller.addEventListener(
    'click',
    (e) => {
      if (didDrag) {
        e.stopPropagation();
        e.preventDefault();
        didDrag = false;
      }
    },
    true
  );
}
