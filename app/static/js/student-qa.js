// ─────────────────────────────────────────
// student-qa.js — Community Q&A (Tab 6) interactions
// ─────────────────────────────────────────

// ── Char counter & post button enable/disable ──
function qaHandleInput() {
    const ta = document.getElementById('qa-textarea');
    const ctr = document.getElementById('qa-char-counter');
    const btn = document.getElementById('qa-post-btn');
    const len = ta.value.length;

    ctr.textContent = len + ' / 500';
    ctr.classList.toggle('warn', len >= 400 && len < 490);
    ctr.classList.toggle('over', len >= 490);

    btn.disabled = len < 20;
}

// ── Post question — real fetch ──
function qaPostQuestion() {
    const ta  = document.getElementById('qa-textarea');
    const suc = document.getElementById('qa-post-success');
    const btn = document.getElementById('qa-post-btn');
    const text = ta.value.trim();

    if (text.length < 20) return;

    btn.disabled = true;

    fetch('/student/post_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: text })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) {
            btn.disabled = false;
            return;
        }
        ta.value = '';
        document.getElementById('qa-char-counter').textContent = '0 / 500';
        document.getElementById('qa-char-counter').classList.remove('warn', 'over');
        suc.classList.add('show');
        setTimeout(() => suc.classList.remove('show'), 4000);
        loadQuestions();
    })
    .catch(() => { btn.disabled = false; });
}

// ── Live search filter on feed ──
let _qaSort = 'latest';

function qaFilterFeed() {
    const searchEl = document.getElementById('qa-search-input');
    const query = (searchEl ? searchEl.value : '').toLowerCase().trim();
    const cards = document.querySelectorAll('.qa-card');
    let visible = 0;

    cards.forEach(card => {
        const text = (card.dataset.text || '').toLowerCase();
        const typeHidden = card.dataset.sortHidden === 'true';
        const matches = !query || text.includes(query);
        card.dataset.qaHidden = (!matches || typeHidden) ? 'true' : 'false';
        if (matches && !typeHidden) visible++;
    });

    const emptyEl = document.getElementById('qa-empty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
}

// ── Sort pills ──
function qaSetSort(sort) {
    _qaSort = sort;
    ['latest', 'unanswered', 'admin'].forEach(s => {
        const btn = document.getElementById('qa-sort-' + s);
        if (btn) {
            btn.classList.toggle('active', s === sort);
            btn.setAttribute('aria-pressed', String(s === sort));
        }
    });

    document.querySelectorAll('.qa-card').forEach(card => {
        const type = card.dataset.type; // admin | unanswered | peer
        let hide = false;
        if (sort === 'unanswered') hide = (type !== 'unanswered');
        if (sort === 'admin') hide = (type !== 'admin');
        card.dataset.sortHidden = hide ? 'true' : 'false';
    });

    qaFilterFeed();
}

// ── Toggle full thread ──
function qaToggleThread(cardId) {
    const thread = document.getElementById(cardId + '-thread');
    const btn = document.getElementById(cardId + '-replies-btn');
    const isOpen = thread.style.display !== 'none';
    thread.style.display = isOpen ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.textContent = isOpen ? '💬 2 replies · View thread' : '💬 2 replies · Hide thread';
}

// ── Toggle peer reply ──
function qaTogglePeerReply(cardId) {
    const reply = document.getElementById(cardId + '-peer-reply');
    const btn = document.getElementById(cardId + '-view-btn');
    const isOpen = reply.classList.contains('visible');
    reply.classList.toggle('visible', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.textContent = isOpen ? '👁 View 1 peer reply' : '👁 Hide peer reply';
}

// ── Toggle inline reply box ──
function qaToggleReplyBox(cardId) {
    const box = document.getElementById(cardId + '-reply-box');
    const btn = document.getElementById(cardId + '-reply-btn');
    const isOpen = box.classList.contains('open');
    box.classList.toggle('open', !isOpen);
    if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
    if (!isOpen) document.getElementById(cardId + '-reply-ta')?.focus();
}

function qaCloseReplyBox(cardId) {
    const box = document.getElementById(cardId + '-reply-box');
    box.classList.remove('open');
    const btn = document.getElementById(cardId + '-reply-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

// ── Submit peer reply — real fetch ──
function qaSubmitReply(cardId) {
    const ta = document.getElementById(cardId + '-reply-ta');
    if (!ta || ta.value.trim().length < 3) return;

    const queryId = document.getElementById(cardId).dataset.queryId;

    fetch('/student/post_reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_id: queryId, reply_text: ta.value.trim() })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) return;
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;padding:11px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 6px 22px rgba(19,136,8,.3);white-space:nowrap;animation:fadeUp .25s ease;';
        t.textContent = '✅ Reply posted!';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
        ta.value = '';
        qaCloseReplyBox(cardId);
        loadQuestions();
    })
    .catch(() => {});
}

// ── Build a single question card from data ──
function buildQaCard(q) {
    const cardId = 'qac-' + q.query_id;

    let type = 'unanswered';
    const adminReply = q.replies.find(r => r.is_admin);
    const peerReplies = q.replies.filter(r => !r.is_admin);
    if (adminReply) type = 'admin';
    else if (peerReplies.length > 0) type = 'peer';

    const stripClass = { admin: 'strip-admin', peer: 'strip-peer', unanswered: 'strip-await' }[type];
    const badgeHtml = {
        admin:      `<span class="qa-status-badge status-admin">✍️ Admin Replied</span>`,
        peer:       `<span class="qa-status-badge status-peer">👤 Peer Reply</span>`,
        unanswered: `<span class="qa-status-badge status-await">⏳ Awaiting Answer</span>`
    }[type];

    const adminReplyHtml = adminReply ? `
        <div class="qa-admin-reply">
            <div class="qa-reply-header">
                <span class="qa-admin-badge">Admin</span>
                <span class="qa-reply-date">${adminReply.replied_at || ''}</span>
            </div>
            <p class="qa-reply-text">${escHtml(adminReply.reply_text)}</p>
        </div>` : '';

    const peerCount = peerReplies.length;

    const peerRepliesHtml = peerReplies.length > 0 ? `
    <div class="qa-peer-replies" id="${cardId}-peer-replies" style="display:none;">
        ${peerReplies.map(r => `
            <div class="qa-peer-reply-item">
                <div class="qa-peer-reply-header">
                    <span class="qa-peer-badge">Student</span>
                    <span class="qa-reply-date">${r.replied_at || ''}</span>
                </div>
                <p class="qa-reply-text">${escHtml(r.reply_text)}</p>
            </div>`).join('')}
    </div>` : '';

    return `
        <article class="qa-card" id="${cardId}" role="listitem"
                 data-type="${type}"
                 data-query-id="${q.query_id}"
                 data-text="${escHtml((q.question_text || '').toLowerCase())}">
            <div class="qa-card-strip ${stripClass}">
                ${badgeHtml}
                <span class="qa-card-date">${q.posted_at || ''}</span>
            </div>
            <div class="qa-card-body">
                <p class="qa-question-text">&ldquo;${escHtml(q.question_text)}&rdquo;</p>
                ${adminReplyHtml}
                ${peerRepliesHtml}
            </div>
            <div class="qa-card-footer">
                ${peerCount > 0 ? `<button class="qa-replies-link" onclick="qaTogglePeerReplies('${cardId}')" style="background:none;border:none;cursor:pointer;color:var(--saffron);font-size:13px;font-weight:600;">💬 ${peerCount} peer ${peerCount === 1 ? 'reply' : 'replies'}</button>` : ''}
                <button class="btn-reply-ghost" id="${cardId}-reply-btn"
                    data-qa-reply-box="${cardId}" aria-expanded="false">↩ Reply</button>
            </div>
            <div class="qa-reply-box" id="${cardId}-reply-box">
                <textarea class="qa-reply-textarea" id="${cardId}-reply-ta"
                    placeholder="Share what you know..." rows="3" maxlength="400"></textarea>
                <div class="qa-reply-actions">
                    <button class="btn-reply-ghost" data-qa-cancel-reply="${cardId}"
                        style="font-size:12px;">Cancel</button>
                    <button class="btn-post-qa" style="padding:7px 16px; font-size:12.5px;"
                        data-qa-submit-reply="${cardId}">Post Reply</button>
                </div>
            </div>
        </article>`;
}

function qaTogglePeerReplies(cardId) {
    const block = document.getElementById(cardId + '-peer-replies');
    if (!block) return;
    block.style.display = block.style.display === 'none' ? 'block' : 'none';
}

// ── Load all questions from backend ──
function loadQuestions() {
    fetch('/student/get_questions')
        .then(r => r.json())
        .then(data => {
            const feed = document.getElementById('qa-feed');
            const empty = document.getElementById('qa-empty');
            if (!feed) return;

            if (!data.success || !data.questions.length) {
                feed.innerHTML = '';
                if (empty) feed.appendChild(empty);
                return;
            }

            feed.innerHTML = data.questions.map(buildQaCard).join('');
            if (empty) feed.appendChild(empty);

            const countBadge = document.getElementById('qa-count-badge');
            if (countBadge) countBadge.textContent = data.questions.length + ' questions';

            feed.querySelectorAll('[data-qa-reply-box]').forEach(btn => {
                btn.addEventListener('click', function () {
                    qaToggleReplyBox(this.dataset.qaReplyBox);
                });
            });
            feed.querySelectorAll('[data-qa-cancel-reply]').forEach(btn => {
                btn.addEventListener('click', function () {
                    qaCloseReplyBox(this.dataset.qaCancelReply);
                });
            });
            feed.querySelectorAll('[data-qa-submit-reply]').forEach(btn => {
                btn.addEventListener('click', function () {
                    qaSubmitReply(this.dataset.qaSubmitReply);
                });
            });

            qaFilterFeed();
        })
        .catch(err => console.error('Failed to load questions:', err));
}

// ── Wire all Q&A buttons on DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', function () {
    // Search input
    const qaSearch = document.getElementById('qa-search-input');
    if (qaSearch) {
        qaSearch.addEventListener('input', qaFilterFeed);
        qaSearch.addEventListener('keyup', qaFilterFeed);
    }

    // Textarea input counter
    const qaTa = document.getElementById('qa-textarea');
    if (qaTa) qaTa.addEventListener('input', qaHandleInput);

    // Post button
    const qaPostBtn = document.getElementById('qa-post-btn');
    if (qaPostBtn) qaPostBtn.addEventListener('click', qaPostQuestion);

    // Sort pills via data attribute
    document.querySelectorAll('[data-qa-sort]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaSetSort(this.dataset.qaSort);
        });
    });

    // Load real questions from backend
    loadQuestions();
});