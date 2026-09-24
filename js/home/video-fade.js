// video-fade.js — 影片 ready 後淡入
// 影片先以 CSS opacity: 0 隱藏，等首幀確定可畫（HAVE_CURRENT_DATA）才在
// 「容器」上加 .is-ready 淡入，避免瀏覽器解出首幀時整塊瞬間出現（pop-in）。
// 目前用於 hero 的電腦/手機裝置疊層影片（.hero__device）。
// lazy load 的影片也通用：先掛 listener，補上 <source> 載入後 loadeddata 觸發。
export function initVideoFade(selector = '.hero__device video') {
  const videos = Array.from(document.querySelectorAll(selector));

  videos.forEach((video) => {
    const show = () => video.parentElement.classList.add('is-ready');
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      show();
    } else {
      video.addEventListener('loadeddata', show, { once: true });
    }
  });
}
