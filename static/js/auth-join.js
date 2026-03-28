// ─────────────────────────────────────────────
//  1. Token handling — read ?token= from URL
// ─────────────────────────────────────────────
(function initToken() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');
  let collegeName = 'DY Patil College of Engineering, Pune';

  if (token) {
    try {
      const decoded = atob(token);
      if (decoded.length > 3) collegeName = decoded;
    } catch (e) { /* keep default */ }
  }

  document.getElementById('banner-college-name').textContent = collegeName;
  window._collegeName = collegeName;
})();

// ─────────────────────────────────────────────
//  2. UI interactions
// ─────────────────────────────────────────────
const EYE_OPEN  = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const EYE_CLOSE = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

window.togglePw = function(id, btn) {
  const inp  = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type   = show ? 'text' : 'password';
  btn.querySelector('svg').innerHTML = show ? EYE_CLOSE : EYE_OPEN;
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
};

window.showPrnWarning = function() {
  const w = document.getElementById('prn-warning');
  w.classList.remove('show');
  void w.offsetWidth;
  w.classList.add('show');
};

window.hidePrnWarning = function() {
  document.getElementById('prn-warning').classList.remove('show');
};

// ─────────────────────────────────────────────
//  3. Validation logic
// ─────────────────────────────────────────────
const REQUIRED_FIELDS = ['full-name','email','password','confirm-password','prn','contact','department','year'];

function setFieldError(id, on) {
  document.getElementById(id).classList.toggle('field-error', on);
}

function clearAllErrors() {
  REQUIRED_FIELDS.forEach(function(id) { setFieldError(id, false); });
}

document.addEventListener('DOMContentLoaded', function() {
  REQUIRED_FIELDS.forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  function() { this.classList.remove('field-error'); });
    el.addEventListener('change', function() { this.classList.remove('field-error'); });
  });
});

function validate() {
  clearAllErrors();
  var valid = true;

  var fullName = document.getElementById('full-name').value.trim();
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  var confirm  = document.getElementById('confirm-password').value;
  var prn      = document.getElementById('prn').value.trim();
  var contact  = document.getElementById('contact').value.trim();
  var dept     = document.getElementById('department').value;
  var year     = document.getElementById('year').value;

  if (!fullName || fullName.length < 2)                                                  { setFieldError('full-name', true);        valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))                          { setFieldError('email', true);            valid = false; }
  if (!password || password.length < 8)                                                  { setFieldError('password', true);         valid = false; }
  if (!confirm || confirm !== password)                                                   { setFieldError('confirm-password', true); valid = false; }
  if (!prn || !/^\d{10,16}$/.test(prn))                                                 { setFieldError('prn', true);              valid = false; }
  if (!contact || !/^(\+91[\s-]?)?\d{10}$/.test(contact.replace(/\s/g, '')))        { setFieldError('contact', true);          valid = false; }
  if (!dept)                                                                              { setFieldError('department', true);       valid = false; }
  if (!year)                                                                              { setFieldError('year', true);             valid = false; }

  return { valid: valid, email: email, prn: prn };
}

// ─────────────────────────────────────────────
//  4. Form handling
// ─────────────────────────────────────────────
window.handleRegister = function(e) {
  e.preventDefault();
  window.hidePrnWarning();

  var result = validate();
  if (!result.valid) return;

  setLoading(true);

  setTimeout(function() {
    setLoading(false);

    // Demo: PRN "2021016400001" triggers conflict warning
    if (result.prn === '2021016400001') {
      window.showPrnWarning();
      setFieldError('prn', true);
      return;
    }

    showSuccess(result.email);
  }, 1500);
};

function setLoading(on) {
  var btn     = document.getElementById('btn-register');
  var label   = document.getElementById('btn-label');
  var arrow   = document.getElementById('btn-arrow');
  var spinner = document.getElementById('btn-spinner');
  btn.classList.toggle('loading', on);
  label.textContent     = on ? 'Creating account…' : 'Create Account';
  arrow.style.display   = on ? 'none' : '';
  spinner.style.display = on ? 'block' : 'none';
}

// ─────────────────────────────────────────────
//  5. Success flow
// ─────────────────────────────────────────────
function showSuccess(email) {
  document.getElementById('success-email').textContent = email;
  document.getElementById('form-wrapper').style.display = 'none';
  document.getElementById('success-state').classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────────────
//  6. Resend logic
// ─────────────────────────────────────────────
window.handleResend = function(btn) {
  btn.disabled = true;
  btn.textContent = 'Email sent!';
  setTimeout(function() {
    btn.disabled = false;
    btn.textContent = 'Resend email';
  }, 30000);
};
