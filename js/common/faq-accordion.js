// faq-accordion.js — FAQ 手風琴漸進增強
// 底層是原生 <details><summary>（零 JS 也可用鍵盤/瀏覽器原生方式展開，
// 符合無障礙），這支檔案只負責：
//   1. 展開/收合的高度動畫（原生 details 沒有動畫）
//   2. ＋/－ 圖示切換
// 預設全部收合（HTML 內不加 open 屬性），各項各自獨立展開/收合，不互斥。
// 一次綁定頁上「所有」符合的容器（含 hidden panel 內的）：內容已寫死在 HTML、
// 不再重繪，載入時綁一次就好。
export function initFaqAccordion(containerSelector = '.faq__list') {
  document.querySelectorAll(containerSelector).forEach((container) => {
    const items = Array.from(container.querySelectorAll('.faq__item'));

    items.forEach((item) => {
      const summary = item.querySelector('summary');
      const answerWrap = item.querySelector('.faq__answer-wrap');
      const toggleIcon = item.querySelector('.faq__toggle');
      if (!summary || !answerWrap) return;

      let isAnimating = false;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAnimating) return;

        if (item.open) {
          // 收合：先讓 max-height 收回 0，動畫結束後才真正移除 open 屬性
          isAnimating = true;
          answerWrap.style.maxHeight = `${answerWrap.scrollHeight}px`;
          // 強制 reflow，確保接下來設回 0 會觸發 transition
          void answerWrap.offsetHeight;
          answerWrap.style.maxHeight = '0px';
          if (toggleIcon) toggleIcon.textContent = '＋';

          const onEnd = () => {
            item.open = false;
            answerWrap.style.maxHeight = '';
            isAnimating = false;
            answerWrap.removeEventListener('transitionend', onEnd);
          };
          answerWrap.addEventListener('transitionend', onEnd);
        } else {
          // 展開
          item.open = true;
          if (toggleIcon) toggleIcon.textContent = '－';
          answerWrap.style.maxHeight = '0px';
          // 強制 reflow
          void answerWrap.offsetHeight;
          requestAnimationFrame(() => {
            answerWrap.style.maxHeight = `${answerWrap.scrollHeight}px`;
          });

          const onEnd = () => {
            answerWrap.style.maxHeight = '';
            answerWrap.removeEventListener('transitionend', onEnd);
          };
          answerWrap.addEventListener('transitionend', onEnd);
        }
      });
    });
  });
}
