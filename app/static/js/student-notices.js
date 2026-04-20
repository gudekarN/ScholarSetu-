/* ═══════════════════════════════════════════════════
   student-notices.js — Load notices + modal + countdown
   ScholarSetu Student Dashboard
   ═══════════════════════════════════════════════════ */

function escHtml(s) {
    if (!s) return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

/* ══════════════════════════════════════════════
   COUNTDOWN TIMER
   ══════════════════════════════════════════════ */
let countdownTarget = null;
let countdownInterval = null;

function startCountdown(deadlineDateStr) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownTarget = new Date(deadlineDateStr);

    function tick() {
        const now = new Date();
        let diff  = Math.max(0, Math.floor((countdownTarget - now) / 1000));

        const d = Math.floor(diff / 86400); diff -= d * 86400;
        const h = Math.floor(diff / 3600);  diff -= h * 3600;
        const m = Math.floor(diff / 60);    diff -= m * 60;
        const s = diff;

        const elDays  = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins  = document.getElementById('cd-mins');
        const elSecs  = document.getElementById('cd-secs');

        if (elDays)  elDays.textContent  = pad(d);
        if (elHours) elHours.textContent = pad(h);
        if (elMins)  elMins.textContent  = pad(m);
        if (elSecs)  elSecs.textContent  = pad(s);
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════
   BUILD NOTICE CARD
   ══════════════════════════════════════════════ */
function buildStudentNoticeCard(notice) {
    const modalId = `modal-notice-dyn-${notice.notice_id}`;

    const badgeMap = {
        general:  `<span class="badge badge-general">General</span>`,
        high:     `<span class="badge badge-high">🔴 High Priority</span>`,
        deadline: `<span class="badge badge-deadline">📌 Deadline</span><span class="badge badge-pinned">Pinned</span>`
    };

    const emailIndicator = notice.type === 'high'
        ? `<div class="email-indicator">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                   <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                   <polyline points="22,6 12,13 2,6"/>
               </svg>
               Email sent to all students
           </div>`
        : '';

    const countdownHtml = notice.type === 'deadline' && notice.deadline_date
        ? `<div class="countdown-wrap">
               <span class="countdown-label">Closes in:</span>
               <div class="countdown-units">
                   <div class="cd-unit"><span class="cd-num" id="cd-days">--</span><span class="cd-lbl">Days</span></div>
                   <span class="cd-sep">:</span>
                   <div class="cd-unit"><span class="cd-num" id="cd-hours">--</span><span class="cd-lbl">Hrs</span></div>
                   <span class="cd-sep">:</span>
                   <div class="cd-unit"><span class="cd-num" id="cd-mins">--</span><span class="cd-lbl">Min</span></div>
                   <span class="cd-sep">:</span>
                   <div class="cd-unit"><span class="cd-num" id="cd-secs">--</span><span class="cd-lbl">Sec</span></div>
               </div>
           </div>`
        : '';

    return `
        <article class="notice-card notice-${notice.type || 'general'}"
                 id="notice-dyn-${notice.notice_id}"
                 data-modal="${modalId}"
                 style="cursor:pointer;"
                 aria-label="Open full notice — ${escHtml(notice.title)}">
            <div class="notice-top">
                <div class="notice-meta">${badgeMap[notice.type] || badgeMap.general}</div>
                <span class="notice-date">Posted ${formatDate(notice.posted_at)}</span>
            </div>
            <div class="notice-title">${escHtml(notice.title)}</div>
            ${countdownHtml}
            <div class="notice-footer">
                <div class="read-receipt">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    — students read
                    <div class="read-bar">
                        <div class="read-bar-fill" style="width:0%"></div>
                    </div>
                </div>
                ${emailIndicator}
                <span class="notice-expand-hint">Tap to read full notice →</span>
            </div>
        </article>`;
}

/* ══════════════════════════════════════════════
   BUILD NOTICE MODAL
   ══════════════════════════════════════════════ */
function buildNoticeModal(notice) {
    const modalId = `modal-notice-dyn-${notice.notice_id}`;

    const badgeMap = {
        general:  `<span class="badge badge-general">General</span>`,
        high:     `<span class="badge badge-high">🔴 High Priority</span>`,
        deadline: `<span class="badge badge-deadline">📌 Deadline</span><span class="badge badge-pinned">Pinned</span>`
    };

    const contentHtml = notice.content
        ? notice.content.split('\n').map(line => `<p style="word-break:break-word;overflow-wrap:break-word;margin:0 0 8px;">${escHtml(line)}</p>`).join('')
        : '<p>No content available.</p>';

    const deadlineNote = notice.type === 'deadline' && notice.deadline_date
        ? `<p style="font-size:13px;color:var(--saffron);font-weight:600;">⏰ Deadline: ${formatDate(notice.deadline_date)}</p>`
        : '';

    return `
        <div class="modal-backdrop" id="${modalId}" role="dialog" aria-modal="true"
             aria-labelledby="${modalId}-title" data-modal-id="${modalId}">
            <div class="modal-box" style="max-height:80vh;overflow-y:auto;word-break:break-word;overflow-wrap:break-word;">
                <div class="modal-header">
                    <div class="modal-titles">
                        <div class="modal-badge-wrap">${badgeMap[notice.type] || badgeMap.general}</div>
                        <div class="modal-title" id="${modalId}-title" style="word-break:break-word;">${escHtml(notice.title)}</div>
                    </div>
                    <button class="modal-close" data-close-modal="${modalId}" aria-label="Close notice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body" style="word-break:break-word;overflow-wrap:break-word;">
                    ${deadlineNote}
                    ${contentHtml}
                    <p style="font-size:12px;color:var(--text-light);margin-top:16px;">
                        Posted by: College Administration · ${formatDate(notice.posted_at)}
                    </p>
                </div>
            </div>
        </div>`;
}

/* ══════════════════════════════════════════════
   WIRE NOTICE CARDS
   ══════════════════════════════════════════════ */
function wireNoticeCards() {
    document.querySelectorAll('.notice-card[data-modal]').forEach(card => {
        const fresh = card.cloneNode(true);
        card.parentNode.replaceChild(fresh, card);
        fresh.addEventListener('click', function () {
            openModal(this.dataset.modal);
        });
    });

    document.querySelectorAll('#dynamic-notice-modals [data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.dataset.closeModal);
        });
    });

    document.querySelectorAll('#dynamic-notice-modals .modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', function (e) {
            if (e.target === this) closeModal(this.dataset.modalId);
        });
    });
}

/* ══════════════════════════════════════════════
   LOAD NOTICES FROM FLASK
   ══════════════════════════════════════════════ */
async function loadStudentNotices() {
    try {
        const res  = await fetch('/student/get_notices');
        const data = await res.json();

        if (!data.success) return;

        const stack = document.querySelector('.notices-stack');
        if (!stack) return;

        document.querySelectorAll('.modal-backdrop').forEach(el => {
            if (el.id !== 'modal-report') el.remove();
        });

        const existingContainer = document.getElementById('dynamic-notice-modals');
        if (existingContainer) existingContainer.remove();

        if (!data.notices || data.notices.length === 0) {
            stack.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:var(--text-muted);font-size:14px;">
                    No notices from your college yet.
                </div>`;
            return;
        }

        stack.innerHTML = data.notices.map(n => buildStudentNoticeCard(n)).join('');

        const modalContainer = document.createElement('div');
        modalContainer.id = 'dynamic-notice-modals';
        modalContainer.innerHTML = data.notices.map(buildNoticeModal).join('');
        document.body.appendChild(modalContainer);

        wireNoticeCards();

        const deadlineNotice = data.notices.find(n => n.type === 'deadline' && n.deadline_date);
        if (deadlineNotice) startCountdown(deadlineNotice.deadline_date);

    } catch (err) {
        console.error('Failed to load student notices:', err);
    }
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    loadStudentNotices();
});