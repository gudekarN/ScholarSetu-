/* ═══ admin-queries.js — Query reply logic ═══ */

let qtCurrentFilter = 'all';

function qtToggle(cardId) {
    const card = document.getElementById(cardId);
    card.classList.toggle('open');
}

function qtFilter(filter) {
    qtCurrentFilter = filter;
    ['all', 'unanswered', 'replied'].forEach(f => {
        const pill = document.getElementById('qt-filter-' + f);
        pill.classList.toggle('active', f === filter);
        pill.setAttribute('aria-selected', f === filter);
    });
    const cards = document.querySelectorAll('#qt-stack .qt-card');
    let visible = 0;
    cards.forEach(card => {
        const status = card.dataset.status;
        const show = filter === 'all' || status === filter;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    const empty = document.getElementById('qt-empty');
    empty.classList.toggle('show', visible === 0);
}

function qtEnableBtn(textareaId, btnId) {
    const val = document.getElementById(textareaId).value.trim();
    document.getElementById(btnId).disabled = !val;
}

function qtPostReply(cardId, textareaId, btnId, initials, name, dept, email) {
    const ta = document.getElementById(textareaId);
    const replyText = ta.value.trim();
    if (!replyText) return;

    const card = document.getElementById(cardId);
    const replyBody = card.querySelector('.qt-reply-body');

    const unansweredBadge = card.querySelector('.qt-badge-unanswered');
    if (unansweredBadge) {
        unansweredBadge.outerHTML = '<span class="qt-badge-replied">✅ Replied</span>';
    }

    const avatar = card.querySelector('.qt-avatar');
    avatar.style.background = 'linear-gradient(135deg, var(--green), #0d6605)';

    card.dataset.status = 'replied';
    card.classList.add('qt-replied');

    const blockId = 'qtreplyblock-' + cardId.split('-')[1];
    const textId = 'qtreplytext-' + cardId.split('-')[1];
    replyBody.innerHTML = `
        <div class="qt-reply-block" id="${blockId}">
          <div class="qt-reply-block-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:12px;height:12px;"><polyline points="20 6 9 17 4 12" /></svg>
            Official Admin Reply
          </div>
          <div class="qt-reply-text" id="${textId}">${escHtml(replyText)}</div>
        </div>
        <textarea class="qt-reply-textarea" id="${textareaId}" style="display:none;"></textarea>
        <div class="qt-reply-actions">
          <div class="qt-replied-meta">
            <span class="replied-tick">✅</span>
            Replied just now · <a href="mailto:${email}" style="color:var(--blue);font-weight:600;text-decoration:none;font-size:11.5px;">${email}</a>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn-edit-reply" id="${btnId}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Reply
            </button>
          </div>
        </div>`;

    // Re-wire the newly created edit button
    const newEditBtn = document.getElementById(btnId);
    newEditBtn.addEventListener('click', () => qtEditReply(cardId, textareaId, btnId, blockId, textId));

    // Re-wire textarea oninput
    document.getElementById(textareaId).addEventListener('input', () => qtEnableBtn(textareaId, btnId));

    qtRecountBadges();
    qtFilter(qtCurrentFilter);
    gToast('Reply posted successfully!');
}

function qtEditReply(cardId, textareaId, btnId, blockId, textId) {
    const block = document.getElementById(blockId);
    const ta = document.getElementById(textareaId);
    const currentText = document.getElementById(textId)?.textContent || '';

    if (ta.style.display === 'none' || ta.style.display === '') {
        ta.value = currentText;
        ta.style.display = 'block';
        block.style.display = 'none';
        const btn = document.getElementById(btnId);
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:12px;height:12px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Save Reply`;
        btn.className = 'btn-post-reply';
        btn.style.padding = '7px 16px';
        btn.onclick = null;
        btn.addEventListener('click', () => qtSaveEdit(cardId, textareaId, btnId, blockId, textId), { once: true });
        ta.focus();
    }
}

function qtSaveEdit(cardId, textareaId, btnId, blockId, textId) {
    const ta = document.getElementById(textareaId);
    const newText = ta.value.trim();
    if (!newText) return;

    document.getElementById(textId).textContent = newText;
    document.getElementById(blockId).style.display = '';
    ta.style.display = 'none';

    const btn = document.getElementById(btnId);
    btn.className = 'btn-edit-reply';
    btn.style.padding = '';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Reply`;
    btn.onclick = null;
    btn.addEventListener('click', () => qtEditReply(cardId, textareaId, btnId, blockId, textId));

    gToast('Reply updated successfully!');
}

function qtRecountBadges() {
    const cards = document.querySelectorAll('#qt-stack .qt-card');
    let unanswered = 0, replied = 0;
    cards.forEach(c => {
        if (c.dataset.status === 'unanswered') unanswered++;
        else replied++;
    });
    const total = unanswered + replied;
    document.getElementById('qt-cnt-all').textContent = total;
    document.getElementById('qt-cnt-unanswered').textContent = unanswered;
    document.getElementById('qt-cnt-replied').textContent = replied;
    document.getElementById('qt-total-badge').textContent = `(${total} questions)`;
}

document.addEventListener('DOMContentLoaded', () => {
    /* Filter pills */
    ['all', 'unanswered', 'replied'].forEach(f => {
        const pill = document.getElementById('qt-filter-' + f);
        if (pill) pill.addEventListener('click', () => qtFilter(f));
    });

    /* Card headers — toggle expand */
    document.querySelectorAll('.qt-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.qt-card');
            card.classList.toggle('open');
        });
    });

    /* Reply textareas — enable/disable associated post button */
    document.querySelectorAll('.qt-reply-textarea').forEach(ta => {
        ta.addEventListener('input', () => {
            // Find sibling post-reply button in same reply-body
            const body = ta.closest('.qt-reply-body');
            if (!body) return;
            const btn = body.querySelector('.btn-post-reply');
            if (btn) btn.disabled = !ta.value.trim();
        });
    });

    /* Post-reply buttons */
    document.querySelectorAll('[data-qt-reply]').forEach(btn => {
        btn.addEventListener('click', () => {
            const d = btn.dataset;
            qtPostReply(d.qtReply, d.qtTa, btn.id, d.qtInitials, d.qtName, d.qtDept, d.qtEmail);
        });
    });

    /* Edit-reply buttons (pre-rendered replied cards) */
    document.querySelectorAll('[data-qt-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
            qtEditReply(btn.dataset.qtEdit, btn.dataset.qtTa, btn.id, btn.dataset.qtBlock, btn.dataset.qtText);
        });
    });

    /* Export dept/year filtered buttons */
    const expDeptBtn = document.getElementById('exp-dept-btn');
    if (expDeptBtn) expDeptBtn.addEventListener('click', () => exportDownload(document.getElementById('exp-dept-sel').value));
    const expYearBtn = document.getElementById('exp-year-btn');
    if (expYearBtn) expYearBtn.addEventListener('click', () => exportDownload(document.getElementById('exp-year-sel').value));
});
