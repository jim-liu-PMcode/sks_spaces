// contact-form.js — 注入共用聯絡表單 + 前端驗證 + 呼叫送出 stub
import { qs, createElementFromHTML } from './dom-utils.js';
import { submitContactForm } from './contact-form-submit.js';

function formTemplate() {
  return `
    <div class="container">
      <div class="contact-section__inner">
        <div class="contact-section__copy">
          <p class="eyebrow contact-section__eyebrow eyebrow--normal-case">Get Started</p>
          <h2 class="contact-section__title">讓我們為您量身規劃專屬<br />智慧安防方案</h2>
          <p class="contact-section__desc">全台服務數超過數萬個場域信賴 — 從規劃、安裝到維運，專人一站式協助。</p>
        </div>
        <form class="contact-form" novalidate>
          <div class="contact-form__row">
            <div class="contact-form__field">
              <label class="contact-form__label" for="cf-name">姓名 / 公司</label>
              <input
                class="contact-form__input"
                type="text"
                id="cf-name"
                name="name"
                maxlength="15"
                placeholder="您的姓名或公司名稱（限15字）"
                autocomplete="name"
                required
              />
              <p class="contact-form__error" data-error-for="name"></p>
            </div>
            <div class="contact-form__field">
              <label class="contact-form__label" for="cf-phone">聯絡電話</label>
              <input
                class="contact-form__input"
                type="tel"
                id="cf-phone"
                name="phone"
                placeholder="0912******9"
                autocomplete="tel"
                required
              />
              <p class="contact-form__error" data-error-for="phone"></p>
            </div>
            <div class="contact-form__field contact-form__field--full">
              <label class="contact-form__label" for="cf-email">電子郵件</label>
              <div class="contact-form__input-wrap">
                <img class="contact-form__icon" src="assets/images/shared/icon-envelope.svg" alt="" aria-hidden="true" />
                <input
                  class="contact-form__input"
                  type="email"
                  id="cf-email"
                  name="email"
                  placeholder="john-adam@example.com"
                  autocomplete="email"
                  required
                />
              </div>
              <p class="contact-form__error" data-error-for="email"></p>
            </div>
          </div>

          <!-- reCAPTCHA 容器：本次僅預留位置，不載入任何 Google reCAPTCHA 腳本。
               日後正式串接時，於此 div 內插入 g-recaptcha widget 即可。 -->
          <div id="recaptcha-container" class="contact-form__recaptcha" aria-hidden="true"></div>

          <div class="contact-form__submit-row">
            <button class="btn btn-white" type="submit">
              <img src="assets/images/shared/icon-arrow-c.svg" alt="" aria-hidden="true" />
              <span>送出</span>
            </button>
            <p class="contact-form__status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </div>
    </div>
  `;
}

const PHONE_RE = /^09\d{8}$|^0\d{1,2}-?\d{6,8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  if (name === 'name') {
    if (!value.trim()) return '請輸入姓名或公司名稱。';
    if (value.length > 15) return '姓名或公司名稱請勿超過 15 字。';
    return '';
  }
  if (name === 'phone') {
    if (!value.trim()) return '請輸入聯絡電話。';
    if (!PHONE_RE.test(value.replace(/\s|-/g, ''))) return '電話格式不正確。';
    return '';
  }
  if (name === 'email') {
    if (!value.trim()) return '請輸入 Email。';
    if (!EMAIL_RE.test(value)) return 'Email 格式不正確。';
    return '';
  }
  return '';
}

export function injectContactForm() {
  const mount = qs('#site-contact-form');
  if (!mount) return;

  const sectionEl = createElementFromHTML(
    `<section class="contact-section" id="site-contact-form" aria-label="預約諮詢">${formTemplate()}</section>`
  );
  mount.replaceWith(sectionEl);

  const form = qs('form', sectionEl);
  const statusEl = qs('.contact-form__status', sectionEl);
  const submitBtn = qs('button[type="submit"]', sectionEl);

  const fields = ['name', 'phone', 'email'];

  function showError(field, message) {
    const input = qs(`[name="${field}"]`, form);
    const errorEl = qs(`[data-error-for="${field}"]`, form);
    if (errorEl) errorEl.textContent = message;
    input?.classList.toggle('is-invalid', Boolean(message));
  }

  fields.forEach((field) => {
    const input = qs(`[name="${field}"]`, form);
    input?.addEventListener('blur', () => {
      showError(field, validateField(field, input.value));
    });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasError = false;
    const values = {};
    fields.forEach((field) => {
      const input = qs(`[name="${field}"]`, form);
      const value = input ? input.value : '';
      values[field] = value;
      const message = validateField(field, value);
      showError(field, message);
      if (message) hasError = true;
    });

    if (hasError) {
      statusEl.dataset.state = 'error';
      statusEl.textContent = '請確認欄位內容是否正確。';
      return;
    }

    submitBtn.disabled = true;
    statusEl.removeAttribute('data-state');
    statusEl.textContent = '送出中…';

    try {
      const result = await submitContactForm(values);
      statusEl.dataset.state = result.ok ? 'success' : 'error';
      statusEl.textContent = result.message;
      if (result.ok) {
        form.reset();
      }
    } catch (err) {
      statusEl.dataset.state = 'error';
      statusEl.textContent = '送出失敗，請稍後再試。';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
