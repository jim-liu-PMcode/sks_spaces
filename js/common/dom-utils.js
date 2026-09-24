// dom-utils.js — 共用 DOM 小工具
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

// 將 HTML 字串轉成 DOM 節點（用於 header/footer/contact-form 的 JS 注入）
export function createElementFromHTML(htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild;
}

// 將字串安全地塞進屬性/文字節點用（避免 XSS，本專案文案皆為靜態信任內容，
// 這裡仍統一走一次跳脫，養成好習慣）
//
// 注意：不能用 div.textContent = str 再讀 innerHTML 的寫法 —— 那個做法只跳脫
// & < >，不會跳脫引號，塞進 href="${}" / src="${}" 這種「屬性內插」就會破格。
// 本專案的模板（tabs / 產品卡 / FAQ）大量用屬性內插，所以這裡連引號一起處理。
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
