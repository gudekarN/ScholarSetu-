/* ═══ admin-notices.js — Notice posting logic ═══ */

function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function shakeEl(id) {
    const el = document.getElementById(id);
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake .4s ease';
}

function showQuickToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#DC2626;color:#fff;padding:12px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 6px 22px rgba(220,38,38,.35);white-space:nowrap;animation:fadeUp .25s ease;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function onTypeChange() {
    const type = document.querySelector('input[name="notice-type"]:checked')?.value;
    const emailBadge = document.getElementById('email-info-badge');
    emailBadge.classList.toggle('show', type === 'high');
    const dateField = document.getElementById('deadline-date-field');
    dateField.classList.toggle('visible', type === 'deadline');
}

let noticeCount = 3;

function postNotice() {
    const title = document.getElementById('notice-title').value.trim();
    const content = document.getElementById('notice-content').value.trim();
    const type = document.querySelector('input[name="notice-type"]:checked')?.value || 'general';

    if (!title || !content) {
        shakeEl('post-btn');
        showQuickToast('⚠️ Please fill in both the title and content before posting.');
        return;
    }

    const badgeMap = {
        general: `<span class="badge badge-general">🔔 General</span>`,
        high: `<span class="badge badge-high">🔴 High Priority</span><span class="badge badge-email">📧 Email Sent</span>`,
        deadline: `<span class="badge badge-deadline">⏰ Deadline</span>`
    };
    const borderMap = { general: 'notice-general', high: 'notice-high', deadline: 'notice-deadline' };
    const emailBadgeHtml = type === 'high'
        ? `<div class="email-sent-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email sent to all 312 students
           </div>` : '';

    noticeCount++;
    const newId = 'adm-notice-' + noticeCount;
    const article = document.createElement('article');
    article.className = `notice-card ${borderMap[type]}`;
    article.id = newId;
    article.setAttribute('aria-label', title);
    article.innerHTML = `
        <div class="notice-top">
          <div class="notice-meta">${badgeMap[type]}</div>
          <span class="notice-date">Just now</span>
        </div>
        <div class="notice-title">${escHtml(title)}</div>
        <div class="notice-preview">${escHtml(content.slice(0, 200))}${content.length > 200 ? '...' : ''}</div>
        <div class="notice-footer">
          <div class="admin-read-receipt">
            <span class="read-count">0 / 312</span>
            <span class="read-of">students read</span>
            <div class="read-bar"><div class="read-bar-fill" style="width:0%"></div></div>
          </div>
          ${emailBadgeHtml}
        </div>`;

    const list = document.getElementById('notices-list');
    list.insertBefore(article, list.firstChild);

    const mNotice = document.getElementById('m-notices');
    mNotice.textContent = parseInt(mNotice.textContent) + 1;

    document.getElementById('notices-count-badge').textContent = `(${noticeCount - 3 + 3} notices)`;

    document.getElementById('notice-title').value = '';
    document.getElementById('notice-content').value = '';
    document.getElementById('nt-general').checked = true;
    onTypeChange();

    const toast = document.getElementById('post-success');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    /* Type radio buttons */
    document.querySelectorAll('input[name="notice-type"]').forEach(r =>
        r.addEventListener('change', onTypeChange)
    );

    /* Post button */
    const postBtn = document.getElementById('post-btn');
    if (postBtn) postBtn.addEventListener('click', postNotice);
});
