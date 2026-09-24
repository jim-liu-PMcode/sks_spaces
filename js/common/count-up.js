// count-up.js — 數字統計條增長動畫
// 4 組數字用同一顆 IntersectionObserver 觸發，且用同一個固定總時長跑完
// 0 → 目標值；只有數字本體（[data-count-target]）動畫，單位/後綴文字
// （寫在 markup 的固定文字節點，不受這支程式控制）全程不變。
const DURATION_MS = 1500;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateAll(valueEls) {
  const targets = valueEls.map((el) => Number(el.dataset.countTarget || '0'));
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / DURATION_MS, 1);
    const eased = easeOutCubic(progress);

    valueEls.forEach((el, i) => {
      const value = Math.round(targets[i] * eased);
      el.textContent = String(value);
    });

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      valueEls.forEach((el, i) => {
        el.textContent = String(targets[i]);
      });
    }
  }

  requestAnimationFrame(frame);
}

export function initCountUp(containerSelector = '.stats') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const valueEls = Array.from(container.querySelectorAll('[data-count-target]'));
  if (!valueEls.length) return;

  if (!('IntersectionObserver' in window)) {
    animateAll(valueEls);
    return;
  }

  let hasTriggered = false;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggered) {
          hasTriggered = true;
          animateAll(valueEls);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(container);
}
