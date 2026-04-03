window.switchTab = function (which) {
  ['student', 'admin'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === which);
    document.getElementById('tab-' + t).setAttribute('aria-selected', t === which);
    document.getElementById('panel-' + t).classList.toggle('active', t === which);
  });
  window.hideError();
};

const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSE = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

window.togglePw = function (id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.querySelector('svg').innerHTML = show ? EYE_CLOSE : EYE_OPEN;
};

window.showError = function () {
  const el = document.getElementById('error-alert');
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
};

window.hideError = function () {
  document.getElementById('error-alert').classList.remove('show');
};

// ── Form submit ──
window.handleLogin = function (e, type) {
  const emailId = type === 'student' ? 's-email' : 'a-email';
  const pwId = type === 'student' ? 's-password' : 'a-password';
  const email = document.getElementById(emailId).value.trim();
  const pw = document.getElementById(pwId).value;

  [emailId, pwId].forEach(id => document.getElementById(id).classList.remove('field-error'));

  let hasError = false;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById(emailId).classList.add('field-error');
    hasError = true;
  }

  if (!pw) {
    document.getElementById(pwId).classList.add('field-error');
    hasError = true;
  }

  // ✅ e.preventDefault() only called when validation fails
  if (hasError) {
    e.preventDefault();
    window.showError();
    return;
  }

  // ✅ no preventDefault here — form submits naturally to Flask
};

document.addEventListener('DOMContentLoaded', function () {

  if (new URLSearchParams(window.location.search).get('error')) {
      window.showError();
  }

  ['s-email', 's-password', 'a-email', 'a-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        this.classList.remove('field-error');
      });
    }
  });
});