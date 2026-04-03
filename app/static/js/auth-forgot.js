/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   State
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
let currentScreen = 1;
let userEmail = '';
let resendTimer = null;

const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSE = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Navigation
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function goToScreen(n) {
  document.getElementById('screen-' + currentScreen).classList.remove('active');
  currentScreen = n;
  document.getElementById('screen-' + n).classList.add('active');
  updateChrome(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateChrome(n) {
  const backEl = document.getElementById('global-back');
  const disclaimerEl = document.getElementById('footer-disclaimer');

  // Screens 2 & 4 have their own navigation; hide global back on screen 4
  const hideBack = (n === 4);
  backEl.style.visibility = hideBack ? 'hidden' : 'visible';

  // Disclaimer only on screens 1 & 3
  if (disclaimerEl) {
    disclaimerEl.style.display = (n === 2 || n === 4) ? 'none' : '';
  }

  // Adjust back button label
  if (n === 2) {
    backEl.textContent = '';
    backEl.insertAdjacentHTML('afterbegin',
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;"><polyline points="15 18 9 12 15 6"/></svg> Back to Login`
    );
    backEl.onclick = () => window.location.href = LOGIN_URL;
  } else if (n === 3) {
    backEl.textContent = '';
    backEl.insertAdjacentHTML('afterbegin',
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;"><polyline points="15 18 9 12 15 6"/></svg> Back`
    );
    backEl.onclick = () => goToScreen(1);
  } else {
    backEl.textContent = '';
    backEl.insertAdjacentHTML('afterbegin',
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;"><polyline points="15 18 9 12 15 6"/></svg> Back to Login`
    );
    backEl.onclick = () => window.location.href = LOGIN_URL;
  }
}

function handleBack() {
  if (currentScreen === 3) { goToScreen(1); }
  else { window.location.href = LOGIN_URL; }
}

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Screen 1 — Send reset link
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function handleSendLink(e) {
  e.preventDefault();
  const emailInp = document.getElementById('reset-email');
  const errEl = document.getElementById('email-error');
  const errTxt = document.getElementById('email-error-text');
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInp.classList.remove('field-error');
  errEl.classList.remove('show');

  const val = emailInp.value.trim();
  if (!val) {
    errTxt.textContent = 'Email address is required.';
    emailInp.classList.add('field-error');
    errEl.classList.add('show');
    emailInp.focus();
    return;
  }
  if (!emailRx.test(val)) {
    errTxt.textContent = 'Please enter a valid email address.';
    emailInp.classList.add('field-error');
    errEl.classList.add('show');
    emailInp.focus();
    return;
  }

  userEmail = val;
  const btn = document.getElementById('send-btn');
  const label = document.getElementById('send-label');
  const arrow = document.getElementById('send-arrow');
  const spinner = document.getElementById('send-spinner');

  btn.classList.add('loading');
  label.textContent = 'Sending…';
  arrow.style.display = 'none';
  spinner.style.display = 'block';

  setTimeout(() => {
    btn.classList.remove('loading');
    label.textContent = 'Send Reset Link';
    arrow.style.display = '';
    spinner.style.display = 'none';

    const sentEmailDisplay = document.getElementById('sent-email-display');
    if (sentEmailDisplay) sentEmailDisplay.textContent = userEmail;

    goToScreen(2);
    startResendCooldown();
  }, 1400);
}

document.addEventListener('DOMContentLoaded', () => {

  updateChrome(1);

  const resetEmail = document.getElementById('reset-email');
  if (resetEmail) {
    resetEmail.addEventListener('input', function () {
      this.classList.remove('field-error');
      const emailError = document.getElementById('email-error');
      if (emailError) emailError.classList.remove('show');
    });
  }

  const confirmNewPw = document.getElementById('confirm-new-password');
  if (confirmNewPw) {
    confirmNewPw.addEventListener('input', function () {
      this.classList.remove('field-error');
      const confirmError = document.getElementById('confirm-error');
      if (confirmError) confirmError.classList.remove('show');
    });
  }

  /* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
     On load — if ?token= in URL → screen 3
  ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
  (function checkToken() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) goToScreen(3);
  })();
});

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Screen 2 — Resend with cooldown
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function startResendCooldown() {
  const btn = document.getElementById('resend-btn');
  if (!btn) return;
  let secs = 60;
  btn.disabled = true;

  function updateLabel() {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Resend in ${secs}s`;
  }
  updateLabel();

  resendTimer = setInterval(() => {
    secs--;
    if (secs <= 0) {
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="15" height="15"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg> Resend link`;
    } else {
      updateLabel();
    }
  }, 1000);
}

window.handleResend = function () {
  const btn = document.getElementById('resend-btn');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg> Sent!`;
  setTimeout(() => startResendCooldown(), 900);
}

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Screen 3 — Password strength
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
function getStrength(pw) {
  if (!pw) return { level: '', label: '' };
  const score = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw)
  ].filter(Boolean).length;

  if (score <= 2) return { level: 'weak', label: 'Weak — add more variety' };
  if (score === 3) return { level: 'medium', label: 'Medium — almost there!' };
  return { level: 'strong', label: 'Strong — great password!' };
}

function setReq(id, met) {
  const li = document.getElementById(id);
  if (!li) return;
  li.classList.toggle('met', met);
  li.querySelector('svg').innerHTML = met
    ? `<polyline points="20 6 9 17 4 12"/>`
    : `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`;
}

// Global for inline oninput
window.onPasswordInput = function (inp) {
  const pw = inp.value;
  const wrap = document.getElementById('strength-wrap');
  const label = document.getElementById('strength-label');

  inp.classList.remove('field-error');

  if (!pw) {
    wrap.dataset.strength = '';
    label.textContent = '';
    ['req-len', 'req-upper', 'req-num', 'req-special'].forEach(id => setReq(id, false));
    return;
  }

  const { level, label: lbl } = getStrength(pw);
  wrap.dataset.strength = level;
  label.textContent = lbl;

  setReq('req-len', pw.length >= 8);
  setReq('req-upper', /[A-Z]/.test(pw));
  setReq('req-num', /[0-9]/.test(pw));
  setReq('req-special', /[^A-Za-z0-9]/.test(pw));
};

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Screen 3 — Submit
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
window.handleUpdatePassword = function (e) {
  e.preventDefault();
  const pwInp = document.getElementById('new-password');
  const cfInp = document.getElementById('confirm-new-password');
  const cfErr = document.getElementById('confirm-error');
  let valid = true;

  cfErr.classList.remove('show');
  pwInp.classList.remove('field-error');
  cfInp.classList.remove('field-error');

  if (!pwInp.value || pwInp.value.length < 8) {
    pwInp.classList.add('field-error');
    pwInp.focus();
    valid = false;
  }
  if (pwInp.value !== cfInp.value) {
    cfInp.classList.add('field-error');
    cfErr.classList.add('show');
    if (valid) cfInp.focus();
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('update-btn');
  const label = document.getElementById('update-label');
  const arrow = document.getElementById('update-arrow');
  const spinner = document.getElementById('update-spinner');

  btn.classList.add('loading');
  label.textContent = 'Updating…';
  arrow.style.display = 'none';
  spinner.style.display = 'block';

  setTimeout(() => {
    btn.classList.remove('loading');
    label.textContent = 'Update Password';
    arrow.style.display = '';
    spinner.style.display = 'none';
    goToScreen(4);
  }, 1500);
}

/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
   Shared — password eye toggle
═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */
window.togglePw = function (id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.querySelector('svg').innerHTML = show ? EYE_CLOSE : EYE_OPEN;
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}

// Make sure top-level functions are also on window for inline handlers
window.handleBack = handleBack;
window.handleSendLink = handleSendLink;
window.goToScreen = goToScreen;
