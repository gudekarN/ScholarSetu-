/**
 * auth-register.js
 * ScholarSetu — Register College page JavaScript
 *
 * Functions exposed globally (used in HTML onclick):
 *   window.goToStep(n)
 *   window.togglePw(id, btn)
 *
 * All other logic is encapsulated inside DOMContentLoaded.
 */

document.addEventListener("DOMContentLoaded", function () {

  /* ════════════════════════════
     1. STEP MANAGEMENT
  ════════════════════════════ */
  let currentStep = 1;

  window.goToStep = function (n) {
    document.getElementById('step-' + currentStep).classList.remove('active');
    currentStep = n;
    document.getElementById('step-' + n).classList.add('active');
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function updateProgress(n) {
    for (let i = 1; i <= 3; i++) {
      const circle = document.getElementById('sc-' + i);
      const label  = document.getElementById('sl-' + i);
      circle.classList.remove('active', 'done');
      label.classList.remove('active', 'done');
      if (i < n) {
        circle.classList.add('done');
        circle.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        label.classList.add('done');
      } else if (i === n) {
        circle.classList.add('active');
        circle.textContent = i;
        label.classList.add('active');
      } else {
        circle.textContent = i;
      }
    }
    for (let c = 1; c <= 2; c++) {
      const conn = document.getElementById('conn-' + c);
      conn.classList.toggle('done', c < n);
    }
  }


  /* ════════════════════════════
     2. PASSWORD TOGGLE
  ════════════════════════════ */
  window.togglePw = function (id, btn) {
    const input = document.getElementById(id);
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    const eye = btn.querySelector('svg');
    eye.innerHTML = isText
      ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
      : `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
  };


  /* ════════════════════════════
     3. PASSWORD STRENGTH
  ════════════════════════════ */
  function checkStrength(val) {
    const wrap = document.getElementById('strength-wrap');
    if (!val) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#DC2626', '#F97316', '#EAB308', '#22C55E'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];

    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById('sb-' + i);
      bar.style.background = i <= score ? colors[score - 1] : 'var(--border)';
    }
    const lbl = document.getElementById('strength-label');
    lbl.textContent = labels[score - 1] || '';
    lbl.style.color = colors[score - 1] || 'var(--text-light)';
  }

  // Attach strength checker to password input
  const adminPasswordEl = document.getElementById('adminPassword');
  if (adminPasswordEl) {
    adminPasswordEl.addEventListener('input', function () {
      checkStrength(this.value);
    });
  }


  /* ════════════════════════════
     4. INLINE ERROR HELPERS
  ════════════════════════════ */
  function showErr(id, show) {
    const el    = document.getElementById('err-' + id);
    const input = document.getElementById(id);
    if (!el || !input) return;
    el.classList.toggle('show', show);
    input.classList.toggle('error', show);
  }

  function clearErrors(ids) {
    ids.forEach(id => showErr(id, false));
  }


  /* ════════════════════════════
     5. CLEAR ERROR ON INPUT
  ════════════════════════════ */
  [
    'collegeName', 'aisheCode', 'secretKey', 'district', 'collegeType',
    'adminName', 'adminEmail', 'adminPassword', 'confirmPassword', 'adminPhone'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input',  () => showErr(id, false));
    if (el) el.addEventListener('change', () => showErr(id, false));
  });


  /* ════════════════════════════
     6. STEP 1 VALIDATION
  ════════════════════════════ */
  const form1 = document.getElementById('form-1');
  if (form1) {
    form1.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const collegeName = document.getElementById('collegeName').value.trim();
      const aisheCode   = document.getElementById('aisheCode').value.trim();
      const secretKey   = document.getElementById('secretKey').value.trim();
      const district    = document.getElementById('district').value;
      const collegeType = document.getElementById('collegeType').value;

      clearErrors(['collegeName', 'aisheCode', 'secretKey', 'district', 'collegeType']);

      if (!collegeName) { showErr('collegeName', true); valid = false; }
      if (!aisheCode || !/^C-\d{5}$/i.test(aisheCode)) { showErr('aisheCode', true); valid = false; }
      if (!secretKey)  { showErr('secretKey', true);   valid = false; }
      if (!district)   { showErr('district', true);    valid = false; }
      if (!collegeType){ showErr('collegeType', true); valid = false; }

      if (valid) goToStep(2);
    });
  }


  /* ════════════════════════════
     7. STEP 2 VALIDATION
  ════════════════════════════ */
  const form2 = document.getElementById('form-2');
  if (form2) {
    form2.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const adminName  = document.getElementById('adminName').value.trim();
      const adminEmail = document.getElementById('adminEmail').value.trim();
      const pw         = document.getElementById('adminPassword').value;
      const cpw        = document.getElementById('confirmPassword').value;
      const phone      = document.getElementById('adminPhone').value.trim();

      clearErrors(['adminName', 'adminEmail', 'adminPassword', 'confirmPassword', 'adminPhone']);

      if (!adminName) { showErr('adminName', true); valid = false; }

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!adminEmail || !emailRe.test(adminEmail)) { showErr('adminEmail', true); valid = false; }

      if (!pw || pw.length < 8) { showErr('adminPassword', true); valid = false; }
      if (!cpw || pw !== cpw)   { showErr('confirmPassword', true); valid = false; }

      const phoneDigits = phone.replace(/\D/g, '');
      if (!phone || phoneDigits.length < 10) { showErr('adminPhone', true); valid = false; }

      if (valid) goToStep(3);
    });
  }


  /* ════════════════════════════
     8. AISHE AUTO-FORMAT
  ════════════════════════════ */
  const aisheEl = document.getElementById('aisheCode');
  if (aisheEl) {
    aisheEl.addEventListener('input', function () {
      let v = this.value.toUpperCase().replace(/[^C0-9-]/g, '');
      if (v.length === 1 && v !== 'C') v = 'C-' + v;
      else if (v.startsWith('C') && !v.startsWith('C-') && v.length > 1) v = 'C-' + v.slice(1);
      this.value = v;
    });
  }


  /* ════════════════════════════
     9. PHONE FORMATTER
  ════════════════════════════ */
  const phoneEl = document.getElementById('adminPhone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function () {
      let v = this.value.replace(/[^\d+]/g, '');
      if (v.startsWith('+91')) v = '+91 ' + v.slice(3).replace(/(\d{5})(\d{5})/, '$1 $2');
      else if (v.length === 10) v = v.replace(/(\d{5})(\d{5})/, '$1 $2');
      this.value = v;
    });
  }

}); // end DOMContentLoaded
