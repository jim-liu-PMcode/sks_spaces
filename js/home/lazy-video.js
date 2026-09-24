// lazy-video.js — 背景／裝飾影片的載入與播放管理
// 這個模組管兩件事：
//   1. 延遲載入：帶 data-src 的影片（hero3／hero4／intro AI 影片）只在捲到附近時
//      才設定 src 開始下載，避免數 MB 的檔案拖慢首屏。已經寫死 <source> 的
//      影片（hero1 與兩支裝置畫面）不受影響，維持原本的 preload="auto"。
//   2. 離場暫停：任何一支影片離開視窗就 pause、回到視窗再 play。
//      首頁同時有六支 muted+loop 的裝飾影片，全部一直解碼對手機電量很傷；
//      有了這層之後，任何時候都只有看得見的那幾支在跑。
//      （這也是手機不再需要 display:none 關掉 hero3／hero4 的前提。）
//
// 選擇器預設是 video[loop]：本站所有裝飾／背景影片都是 muted+loop+playsinline，
// 而有控制列、需要使用者主動播放的影片不會帶 loop。日後若加了不該被自動
// 暫停的 loop 影片，記得改成明確的 opt-out。
export function initLazyVideo(selector = 'video[loop]') {
  const videos = Array.from(document.querySelectorAll(selector));
  if (!videos.length) return;

  function loadVideo(video) {
    const src = video.dataset.src;
    if (!src || video.dataset.loaded === 'true') return;
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.dataset.loaded = 'true';
    video.load();
  }

  function play(video) {
    video.play().catch(() => {
      /* 自動播放被瀏覽器政策擋下、或 play() 還沒完成就被 pause() 中斷時，
         靜默失敗即可，不影響其餘功能 */
    });
  }

  if (!('IntersectionObserver' in window)) {
    videos.forEach((video) => {
      loadVideo(video);
      play(video);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          loadVideo(video);
          play(video);
        } else if (!video.paused) {
          video.pause();
        }
      });
    },
    // 提前 200px 開始載入／播放，捲到時已經在跑；離場也是超過 200px 才暫停，
    // 避免在邊界來回捲動時瘋狂 play/pause。
    { rootMargin: '200px 0px' }
  );

  videos.forEach((video) => observer.observe(video));
}
