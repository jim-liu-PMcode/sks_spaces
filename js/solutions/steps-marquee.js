// steps-marquee.js — 「立即預約專人規劃」五步驟跑馬燈
//
// 需求要點與對應實作：
//   1. 藍色進度線用 stroke-dasharray/dashoffset 畫線，rAF 線性推進約 2 秒掃完
//   2. 線頭每經過一顆圓的 cx，該步驟群組加 is-active，顏色交給 CSS 0.45s 淡入
//   3. 跑完停 0.5 秒後全部重置重播，無限輪播
//   4. prefers-reduced-motion：不啟動輪播，直接停在 STEP 01 亮起的狀態
//
// 幾何（線的起訖、各圓 cx）一律從 SVG 屬性讀，之後調版面不用回頭改這支。
const DURATION = 2000; // 單輪總時長（ms），線性增長
const HOLD = 500; // 跑完後停留多久再自動重播（ms）

export function initStepsMarquee({ rootSelector = '.sl-steps' } = {}) {
  const root = document.querySelector(rootSelector);
  const line = root ? root.querySelector('.sl-steps__line') : null;
  const steps = root ? Array.from(root.querySelectorAll('.sl-steps__step')) : [];
  if (!line || !steps.length) return;

  const lineStart = Number(line.getAttribute('x1'));
  const totalLen = Number(line.getAttribute('x2')) - lineStart;
  // 各步驟的觸發點：該欄圓心 cx，換算成「藍線已畫長度」座標
  const stops = steps.map(
    (step) => Number(step.querySelector('circle').getAttribute('cx')) - lineStart
  );

  let rafId = null;
  let loopTimer = null;

  function reset() {
    if (rafId) cancelAnimationFrame(rafId);
    if (loopTimer) clearTimeout(loopTimer);
    rafId = null;
    loopTimer = null;
    line.style.strokeDashoffset = totalLen;
    steps.forEach((step) => step.classList.remove('is-active'));
  }

  function play() {
    reset();
    // 強制 reflow，確保 dashoffset 重置先生效，重播才不會從殘留進度接著跑
    void line.getBoundingClientRect();
    let start = null;
    function frame(ts) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / DURATION, 1); // 0 → 1 線性
      const tip = p * totalLen; // 藍線線頭目前抵達的位置
      line.style.strokeDashoffset = totalLen - tip;
      steps.forEach((step, i) => {
        if (tip >= stops[i] && !step.classList.contains('is-active')) {
          step.classList.add('is-active');
        }
      });
      if (p < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        loopTimer = setTimeout(play, HOLD); // 停留展示完成狀態後自動輪播
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function stopAtFirstStep() {
    reset();
    steps[0].classList.add('is-active');
    // 藍線畫到剛好蓋過第一顆圓（r9 + 描邊），對應「停在 STEP 01 亮起」的定格
    line.style.strokeDashoffset = totalLen - (stops[0] + 12);
  }

  // 減速偏好可能在瀏覽期間切換，所以掛 change 監聽而不是只判斷一次
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => (reduceMotion.matches ? stopAtFirstStep() : play());
  reduceMotion.addEventListener('change', apply);
  apply();
}
