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

// ── Post question (demo) ──
function qaPostQuestion() {
    const ta = document.getElementById('qa-textarea');
    const suc = document.getElementById('qa-post-success');
    const btn = document.getElementById('qa-post-btn');

    if (ta.value.trim().length < 20) return;

    btn.disabled = true;
    ta.value = '';
    document.getElementById('qa-char-counter').textContent = '0 / 500';
    document.getElementById('qa-char-counter').classList.remove('warn', 'over');
    suc.classList.add('show');

    setTimeout(() => suc.classList.remove('show'), 4000);
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

// ── Submit peer reply (demo) ──
function qaSubmitReply(cardId) {
    const ta = document.getElementById(cardId + '-reply-ta');
    if (!ta || ta.value.trim().length < 3) return;
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;padding:11px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 6px 22px rgba(19,136,8,.3);white-space:nowrap;animation:fadeUp .25s ease;';
    t.textContent = '✅ Reply posted!';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
    ta.value = '';
    qaCloseReplyBox(cardId);
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

    // Thread toggle buttons via data attribute
    document.querySelectorAll('[data-qa-toggle-thread]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaToggleThread(this.dataset.qaToggleThread);
        });
    });

    // Peer reply toggle via data attribute
    document.querySelectorAll('[data-qa-toggle-peer]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaTogglePeerReply(this.dataset.qaTogglePeer);
        });
    });

    // Reply box toggle via data attribute
    document.querySelectorAll('[data-qa-reply-box]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaToggleReplyBox(this.dataset.qaReplyBox);
        });
    });

    // Reply cancel via data attribute
    document.querySelectorAll('[data-qa-cancel-reply]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaCloseReplyBox(this.dataset.qaCancelReply);
        });
    });

    // Submit reply via data attribute
    document.querySelectorAll('[data-qa-submit-reply]').forEach(btn => {
        btn.addEventListener('click', function () {
            qaSubmitReply(this.dataset.qaSubmitReply);
        });
    });
});
