// type-text.js — hero 副標打字機效果
// 完整文字保留在 HTML 內（SEO / 無 JS 使用者直接可見），JS 啟動後才清空、逐字打出。
// prefers-reduced-motion 的使用者不打字，直接顯示完整文字。
export function initTypeText(selector = '[data-typewriter]') {
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return;

  const START_DELAY = 400; // 讓主標的淡入先起跑
  const CHAR_INTERVAL = 70;
  const CURSOR_LINGER = 1200; // 打完後游標再閃一下才移除

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  els.forEach((el) => {
    const fullText = el.textContent.trim();
    if (!fullText || reduceMotion) return;

    // 清空前先鎖住原始高度，避免元素塌陷讓置中的主標跳位
    el.style.minHeight = `${el.offsetHeight}px`;

    el.textContent = '';

    // screen reader 一開始就讀完整句；打字中的片段對 SR 隱藏，避免重複朗讀
    const srText = document.createElement('span');
    srText.className = 'visually-hidden';
    srText.textContent = fullText;

    const typedText = document.createElement('span');
    typedText.className = 'typewriter-text';
    typedText.setAttribute('aria-hidden', 'true');

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    el.append(srText, typedText, cursor);

    let index = 0;
    setTimeout(() => {
      const timer = setInterval(() => {
        index += 1;
        typedText.textContent = fullText.slice(0, index);
        if (index >= fullText.length) {
          clearInterval(timer);
          setTimeout(() => cursor.remove(), CURSOR_LINGER);
        }
      }, CHAR_INTERVAL);
    }, START_DELAY);
  });
}
