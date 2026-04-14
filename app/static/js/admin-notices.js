/* ═══════════════════════════════════════════════════
   admin-notices.js — Notice posting + loading logic
   ScholarSetu Admin Dashboard
   ═══════════════════════════════════════════════════ */

/* ── Helpers ── */
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
    el.offsetHeight;
    el.style.animation = 'shake .4s ease';
}

function showQuickToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#DC2626;color:#fff;padding:12px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 6px 22px rgba(220,38,38,.35);white-space:nowrap;animation:fadeUp .25s ease;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

/* ── Notice type UI toggle ── */
function onTypeChange() {
    const type = document.querySelector('input[name="notice-type"]:checked')?.value;
    const emailBadge = document.getElementById('email-info-badge');
    emailBadge.classList.toggle('show', type === 'high');
    const dateField = document.getElementById('deadline-date-field');
    dateField.classList.toggle('visible', type === 'deadline');
}

/* ══════════════════════════════════════════════
   FORMAT DATE — "Posted 2 days ago · 18 Mar 2026"
   ══════════════════════════════════════════════ */
function formatPostedDate(isoString) {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now  = new Date();
    const diffMs   = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    if (diffDays === 0) return `Posted today · ${formatted}`;
    if (diffDays === 1) return `Posted yesterday · ${formatted}`;
    return `Posted ${diffDays} days ago · ${formatted}`;
}

/* ══════════════════════════════════════════════
   BUILD NOTICE CARD HTML — matches existing design exactly
   ══════════════════════════════════════════════ */
function buildNoticeCard(notice) {
    const badgeMap = {
        general:  `<span class="badge badge-general">🔔 General</span>`,
        high:     `<span class="badge badge-high">🔴 High Priority</span><span class="badge badge-email">📧 Email Sent</span>`,
        deadline: `<span class="badge badge-deadline">⏰ Deadline</span>`
    };
    const borderMap = {
        general:  'notice-general',
        high:     'notice-high',
        deadline: 'notice-deadline'
    };

    const emailBadgeHtml = notice.type === 'high'
        ? `<div class="email-sent-badge">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;">
                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                 <polyline points="22,6 12,13 2,6"/>
               </svg>
               Email sent to all students
           </div>`
        : '';

    const previewText = notice.content
        ? escHtml(notice.content.slice(0, 200)) + (notice.content.length > 200 ? '...' : '')
        : '';

    return `
        <article class="notice-card ${borderMap[notice.type] || 'notice-general'}"
                 id="adm-notice-${notice.notice_id}"
                 aria-label="${escHtml(notice.title)}">
            <div class="notice-top">
                <div class="notice-meta">${badgeMap[notice.type] || badgeMap.general}</div>
                <span class="notice-date">${formatPostedDate(notice.posted_at)}</span>
            </div>
            <div class="notice-title">${escHtml(notice.title)}</div>
            <div class="notice-preview">${previewText}</div>
            <div class="notice-footer">
                <div class="admin-read-receipt">
                    <span class="read-count">0 / —</span>
                    <span class="read-of">students read</span>
                    <div class="read-bar">
                        <div class="read-bar-fill" style="width:0%"></div>
                    </div>
                </div>
                ${emailBadgeHtml}
            </div>
        </article>`;
}

/* ══════════════════════════════════════════════
   LOAD NOTICES FROM FLASK — replaces hardcoded HTML
   ══════════════════════════════════════════════ */
async function loadNotices() {
    try {
        const res  = await fetch('/admin/get_notices');
        const data = await res.json();

        if (!data.success) return;

        const list  = document.getElementById('notices-list');
        const badge = document.getElementById('notices-count-badge');

        if (!data.notices || data.notices.length === 0) {
            list.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:var(--text-muted);font-size:14px;">
                    No notices posted yet. Post your first notice above.
                </div>`;
            if (badge) badge.textContent = '(0 notices)';
            return;
        }

        /* Clear existing hardcoded notices and render from DB */
        list.innerHTML = data.notices.map(buildNoticeCard).join('');
        if (badge) badge.textContent = `(${data.notices.length} notice${data.notices.length !== 1 ? 's' : ''})`;

        /* Update notices metric card */
        const mNotices = document.getElementById('m-notices');
        if (mNotices) mNotices.textContent = data.notices.length;

    } catch (err) {
        console.error('Failed to load notices:', err);
    }
}

/* ══════════════════════════════════════════════
   POST NOTICE — real fetch() to Flask
   ══════════════════════════════════════════════ */
async function postNotice() {
    const title    = document.getElementById('notice-title').value.trim();
    const content  = document.getElementById('notice-content').value.trim();
    const type     = document.querySelector('input[name="notice-type"]:checked')?.value || 'general';
    const deadline = document.getElementById('notice-deadline-date').value || null;

    if (!title || !content) {
        shakeEl('post-btn');
        showQuickToast('⚠️ Please fill in both the title and content before posting.');
        return;
    }

    if (type === 'deadline' && !deadline) {
        shakeEl('post-btn');
        showQuickToast('⚠️ Please select a deadline date for Deadline notices.');
        return;
    }

    /* Disable button while posting */
    const postBtn = document.getElementById('post-btn');
    postBtn.disabled = true;
    postBtn.textContent = 'Posting…';

    try {
        const res  = await fetch('/admin/post_notice', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title:         title,
                content:       content,
                type:          type,
                deadline_date: deadline
            })
        });

        const data = await res.json();

        if (data.success) {
            /* Clear form */
            document.getElementById('notice-title').value   = '';
            document.getElementById('notice-content').value = '';
            document.getElementById('nt-general').checked   = true;
            document.getElementById('notice-deadline-date').value = '';
            onTypeChange();

            /* Show success toast */
            const toast = document.getElementById('post-success');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 4000);

            /* Reload notices list from DB */
            await loadNotices();

        } else {
            showQuickToast('❌ Failed to post notice. Please try again.');
        }

    } catch (err) {
        console.error('Post notice error:', err);
        showQuickToast('❌ Network error. Please try again.');
    } finally {
        postBtn.disabled    = false;
        postBtn.innerHTML   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Post Notice`;
    }
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* Load real notices from DB on page load */
    loadNotices();

    /* Type radio buttons */
    document.querySelectorAll('input[name="notice-type"]').forEach(r =>
        r.addEventListener('change', onTypeChange)
    );

    /* Post button */
    const postBtn = document.getElementById('post-btn');
    if (postBtn) postBtn.addEventListener('click', postNotice);
});