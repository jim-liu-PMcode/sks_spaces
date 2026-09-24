// resilience-orbit.js — Resilience 圖表分段進場：中央同心圓先顯示，四組服務 callout 再飛入。
export function initResilienceOrbit(selector = '[data-resilience-orbit]') {
  const orbit = document.querySelector(selector);
  if (!orbit) return;

  const reveal = () => orbit.classList.add('is-visible');

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  const section = orbit.closest('.resilience') || orbit;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      reveal();
      obs.unobserve(section);
    },
    { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
  );

  observer.observe(section);
}
