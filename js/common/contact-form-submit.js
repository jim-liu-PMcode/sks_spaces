// contact-form-submit.js — 送出邏輯 stub，唯一未來接 API 的介面點
//
// 決策 7：送出邏輯尚未定案（客戶 mail API 或 Google 表單 + reCAPTCHA），
// 本次只做前端驗證 + UI 骨架。日後正式串接時，只需要改這支檔案：
//   1. 在 index.html（或共用 contact-form.js 樣板）的
//      <div id="recaptcha-container"></div> 載入真正的 Google reCAPTCHA
//      腳本，並在驗證通過的 callback 內把 token 存到某個地方（例如
//      window.__recaptchaToken 或呼叫 setRecaptchaToken()）。
//   2. 把下面 getRecaptchaToken() 換成讀取真正 token 的邏輯。
//   3. 把 submitContactForm() 內的 fake delay 換成真正的 fetch(API_URL, ...).
// 表單其餘邏輯（驗證、UI 狀態切換）完全不用重構。

let currentRecaptchaToken = null;

/** 供未來 reCAPTCHA callback 呼叫，寫入驗證通過後拿到的 token */
export function setRecaptchaToken(token) {
  currentRecaptchaToken = token;
}

/** 目前尚未串接真正 reCAPTCHA，永遠視為已通過（回傳一個假 token） */
function getRecaptchaToken() {
  return currentRecaptchaToken ?? 'stub-recaptcha-token-always-pass';
}

/**
 * 送出聯絡表單（stub）。
 * @param {{ name: string, phone: string, email: string, recaptchaToken?: string }} payload
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
export async function submitContactForm({ name, phone, email, recaptchaToken = getRecaptchaToken() }) {
  if (!recaptchaToken) {
    return { ok: false, message: '請先完成人機驗證。' };
  }

  // TODO: 正式串接客戶 mail API 或 Google 表單 API，取代下方模擬延遲。
  await new Promise((resolve) => setTimeout(resolve, 900));

  // eslint-disable-next-line no-console
  console.info('[contact-form-submit] stub 送出資料：', { name, phone, email, recaptchaToken });

  return { ok: true, message: '感謝您的填寫，我們將盡快與您聯繫！' };
}
