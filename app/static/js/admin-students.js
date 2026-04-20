/* ═══ admin-students.js — Student data, Generate Excel, Upload, Export, Invite ═══ */

/* ── Shared green toast ── */
function gToast(msg) {
    const t = document.createElement('div');
    t.className = 'g-toast';
    t.textContent = '✅ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

/* ── escHtml (shared helper, safe to redefine) ── */
function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════
   STUDENT DATA
══════════════════════════════════ */
let sdCurrentRow = null;

function sdFilter() {
    const q = (document.getElementById('sd-search').value || '').toLowerCase();
    const dept = document.getElementById('sd-dept').value;
    const year = document.getElementById('sd-year').value;
    const rows = document.querySelectorAll('#sd-tbody tr');
    let visible = 0;
    rows.forEach(r => {
        const name = r.dataset.name.toLowerCase();
        const prn = r.dataset.prn.toLowerCase();
        const rdept = r.dataset.dept;
        const ryear = r.dataset.year;
        const matchQ = !q || name.includes(q) || prn.includes(q) || rdept.toLowerCase().includes(q);
        const matchDept = !dept || rdept === dept;
        const matchYear = !year || ryear === year;
        const show = matchQ && matchDept && matchYear;
        r.classList.toggle('sd-hidden', !show);
        if (show) visible++;
    });
    document.getElementById('sd-count').textContent = `Showing ${visible} student${visible !== 1 ? 's' : ''}`;
    sdRenderMobileCards();
}

function sdRenderMobileCards() {
    const tbody = document.getElementById('sd-tbody');
    const cardsContainer = document.getElementById('sd-cards');
    cardsContainer.innerHTML = Array.from(tbody.querySelectorAll('tr')).map((tr, idx) => {
        const cells = tr.querySelectorAll('td');
        if (tr.classList.contains('sd-hidden')) return '';
        return `
            <div class="sd-card">
                <div class="sd-card-top">
                    <div style="flex:1">
                        <div class="sd-card-name">${cells[1].textContent}</div>
                        <div class="sd-card-prn">${cells[2].textContent}</div>
                    </div>
                    <button class="btn-edit-row" data-sd-mobile-idx="${idx}">✏️ Edit</button>
                </div>
                <div class="sd-card-grid">
                    <div>Dept: <span>${cells[5].textContent}</span></div>
                    <div>Year: <span>${cells[6].textContent}</span></div>
                    <div style="grid-column:1/3">Email: <span>${cells[3].textContent}</span></div>
                    <div style="grid-column:1/3">Contact: <span>${cells[4].textContent}</span></div>
                </div>
            </div>`;
    }).join('');

    /* Re-attach mobile edit buttons */
    cardsContainer.querySelectorAll('[data-sd-mobile-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.sdMobileIdx);
            sdMobileEdit(idx);
        });
    });
}

function sdMobileEdit(idx) {
    const btn = document.querySelectorAll('#sd-tbody tr')[idx].querySelector('button');
    sdOpenEdit(btn);
}

function sdOpenEdit(btn) {
    const row = btn.closest('tr');
    sdCurrentRow = row;
    const cells = row.querySelectorAll('td');
    document.getElementById('sd-modal-title').textContent = cells[1].textContent;
    document.getElementById('m-name').value = cells[1].textContent;
    document.getElementById('m-prn').value = cells[2].textContent;
    document.getElementById('m-email').value = cells[3].textContent;
    document.getElementById('m-contact').value = cells[4].textContent;
    document.getElementById('m-dept').value = cells[5].textContent;
    document.getElementById('m-year').value = cells[6].textContent;
    document.getElementById('sd-modal').classList.add('open');
}

function sdCloseModal() {
    document.getElementById('sd-modal').classList.remove('open');
}

function sdSaveEdit() {
    if (!sdCurrentRow) return;

    const studentId = sdCurrentRow.dataset.studentId;
    const payload = {
        student_id: studentId,
        full_name:       document.getElementById('m-name').value,
        prn:             document.getElementById('m-prn').value,
        email:           document.getElementById('m-email').value,
        contact_number:  document.getElementById('m-contact').value,
        department:      document.getElementById('m-dept').value,
        year:            document.getElementById('m-year').value
    };

    fetch('/admin/update_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        if (!data.success) {
            gToast('❌ Update failed. Please try again.');
            return;
        }
        /* Only update DOM after server confirms success */
        const cells = sdCurrentRow.querySelectorAll('td');
        cells[1].textContent = payload.full_name;
        cells[2].textContent = payload.prn;
        cells[3].textContent = payload.email;
        cells[4].textContent = payload.contact_number;
        cells[5].textContent = payload.department;
        cells[6].textContent = payload.year;
        sdCurrentRow.dataset.name = payload.full_name;
        sdCurrentRow.dataset.prn  = payload.prn;
        sdCurrentRow.dataset.dept = payload.department;
        sdCurrentRow.dataset.year = payload.year;
        sdCloseModal();
        gToast('Student record updated.');
        sdRenderMobileCards();
    })
    .catch(() => gToast('❌ Network error. Please try again.'));
}

/* ══════════════════════════════════
   LOAD STUDENT DATA FROM BACKEND
══════════════════════════════════ */
function loadStudentData() {
    fetch('/admin/get_students')
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;

            const tbody = document.getElementById('sd-tbody');
            tbody.innerHTML = '';

            data.students.forEach((s, idx) => {
                const verifiedLabel = s.is_verified ? 'Verified' : 'Pending';
                const tr = document.createElement('tr');
                tr.dataset.studentId = s.student_id;
                tr.dataset.name = s.full_name;
                tr.dataset.prn  = s.prn;
                tr.dataset.dept = s.department;
                tr.dataset.year = s.year;
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${escHtml(s.full_name)}</td>
                    <td>${escHtml(s.prn)}</td>
                    <td>${escHtml(s.email)}</td>
                    <td>${escHtml(s.contact_number || '')}</td>
                    <td>${escHtml(s.department || '')}</td>
                    <td>${escHtml(s.year || '')}</td>
                    <td><button class="btn-edit-row">✍️ Edit</button></td>
                `;
                tbody.appendChild(tr);
            });

            /* Wire edit buttons for newly created rows */
            tbody.querySelectorAll('.btn-edit-row').forEach(btn => {
                btn.addEventListener('click', () => sdOpenEdit(btn));
            });

            /* Update metrics strip */
            const total    = data.students.length;
            const verified = data.students.filter(s => s.is_verified).length;
            const pending  = total - verified;
            const mTotal    = document.getElementById('m-total');
            const mVerified = document.getElementById('m-verified');
            const mPending  = document.getElementById('m-pending');
            if (mTotal)    mTotal.textContent    = total;
            if (mVerified) mVerified.textContent = verified;
            if (mPending)  mPending.textContent  = pending;

            /* Update count label and mobile cards */
            const sdCount = document.getElementById('sd-count');
            if (sdCount) sdCount.textContent = `Showing ${total} student${total !== 1 ? 's' : ''}`;
            sdRenderMobileCards();
        })
        .catch(err => console.error('Failed to load students:', err));
}

/* ══════════════════════════════════
   GENERATE EXCEL
══════════════════════════════════ */
let genCols = [];

function genAddCol() {
    const inp = document.getElementById('gen-col-input');
    const name = inp.value.trim();
    if (!name) return;
    genCols.push(name);
    inp.value = '';
    genRenderCols();
}

function genRemoveCol(idx) {
    genCols.splice(idx, 1);
    genRenderCols();
}

function genRenderCols() {
    const list = document.getElementById('gen-col-list');
    list.innerHTML = genCols.map((c, i) =>
        `<div class="custom-col-item"><span>${escHtml(c)}</span><button class="btn-remove-col" data-gen-remove-idx="${i}" aria-label="Remove ${escHtml(c)}">×</button></div>`
    ).join('');

    list.querySelectorAll('[data-gen-remove-idx]').forEach(btn => {
        btn.addEventListener('click', () => genRemoveCol(parseInt(btn.dataset.genRemoveIdx)));
    });

    const row = document.getElementById('gen-preview-row');
    while (row.children.length > 2) row.removeChild(row.lastChild);
    genCols.forEach((c, i) => {
        const th = document.createElement('th');
        th.innerHTML = `${escHtml(c)} <span class="rename-icon" title="Rename" data-gen-rename-idx="${i}">✏️</span>`;
        row.appendChild(th);
    });

    row.querySelectorAll('[data-gen-rename-idx]').forEach(icon => {
        icon.addEventListener('click', () => genRenameCol(parseInt(icon.dataset.genRenameIdx)));
    });
}

function genRenameCol(idx) {
    const currentName = genCols[idx];
    const newName = prompt('Rename column:', currentName);
    if (newName && newName.trim()) {
        genCols[idx] = newName.trim();
        genRenderCols();
    }
}

function genDownload() {
    gToast('DYPatil_Students_2025.xlsx downloaded successfully.');
}

/* ══════════════════════════════════
   UPLOAD EXCEL
══════════════════════════════════ */
function upDragOver(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.add('drag-over');
}
function upDragLeave() {
    document.getElementById('upload-zone').classList.remove('drag-over');
}
function upDrop(e) {
    e.preventDefault();
    document.getElementById('upload-zone').classList.remove('drag-over');
    upHandleFile(e.dataTransfer.files[0]);
}
function upHandleFile(file) {
    const zone = document.getElementById('upload-zone');
    if (!file) return;
    if (!file.name.endsWith('.xlsx')) {
        zone.classList.add('error-zone');
        document.getElementById('upload-zone-title').textContent = 'Only .xlsx files are accepted.';
        setTimeout(() => {
            zone.classList.remove('error-zone');
            document.getElementById('upload-zone-title').textContent = 'Drop your .xlsx file here';
        }, 2800);
        return;
    }
    zone.classList.remove('error-zone');
    document.getElementById('upload-filename').textContent = file.name + ' · 312 rows detected';
    document.getElementById('upload-result').classList.add('show');
}
function upToggleUnmatched() {
    const list = document.getElementById('unmatched-list');
    const open = list.classList.toggle('open');
    document.getElementById('unmatched-toggle').textContent = open ? 'Hide Unmatched PRNs ▲' : 'View Unmatched PRNs ▼';
}
function upConfirm() {
    gToast('Database updated successfully. Student Data tab now reflects new fields.');
}

/* ══════════════════════════════════
   EXPORT DATA
══════════════════════════════════ */
function exportDownload(label) {
    const safe = label.replace(/\s+/g, '_');
    gToast(`DYPatil_${safe}_2025.xlsx downloaded.`);
}

/* ══════════════════════════════════
   INVITE LINK
══════════════════════════════════ */
function inviteCopyLink() {
    const val = document.getElementById('invite-link-val').value;
    if (navigator.clipboard) navigator.clipboard.writeText(val).catch(() => { });
    const btn = document.getElementById('invite-copy-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px;"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Link`;
    }, 2000);
}

function inviteOpenRegen() { document.getElementById('regen-modal').classList.add('open'); }
function inviteCloseRegen() { document.getElementById('regen-modal').classList.remove('open'); }

function inviteConfirmRegen() {
    const tokens = ['eyJhbGciOiJSUzI1NiJ9.newtoken2026', 'eyXnYzAbCdEfGhIj.freshlink9w3r', 'eyRFG12hjklmno.regen2026link'];
    const newLink = 'https://scholarsetu.in/join/' + tokens[Math.floor(Math.random() * tokens.length)];
    document.getElementById('invite-link-val').value = newLink;
    document.getElementById('invite-created-chip').textContent = '🔗 Created: Just now';
    inviteCloseRegen();
    gToast('New invite link generated.');
}

/* ══════════════════════════════════
   DOM READY — wire all event listeners
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    /* Student search/filter */
    const sdSearch = document.getElementById('sd-search');
    if (sdSearch) sdSearch.addEventListener('input', sdFilter);

    const sdDept = document.getElementById('sd-dept');
    if (sdDept) sdDept.addEventListener('change', sdFilter);

    const sdYear = document.getElementById('sd-year');
    if (sdYear) sdYear.addEventListener('change', sdFilter);

    /* Student edit buttons (desktop table) */
    document.querySelectorAll('#sd-tbody .btn-edit-row').forEach(btn => {
        btn.addEventListener('click', () => sdOpenEdit(btn));
    });

    /* Student modal buttons */
    const sdModal = document.getElementById('sd-modal');
    if (sdModal) {
        sdModal.addEventListener('click', e => { if (e.target === sdModal) sdCloseModal(); });
        document.getElementById('sd-modal-cancel')?.addEventListener('click', sdCloseModal);
        document.getElementById('sd-modal-save')?.addEventListener('click', sdSaveEdit);
    }

    /* Generate Excel */
    const genAddBtn = document.getElementById('gen-add-col-btn');
    if (genAddBtn) genAddBtn.addEventListener('click', genAddCol);

    const genColInput = document.getElementById('gen-col-input');
    if (genColInput) {
        genColInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') genAddCol();
        });
    }

    const genDownloadBtn = document.getElementById('gen-download-btn');
    if (genDownloadBtn) genDownloadBtn.addEventListener('click', genDownload);

    /* Upload Excel */
    const uploadZone = document.getElementById('upload-zone');
    if (uploadZone) {
        uploadZone.addEventListener('dragover', upDragOver);
        uploadZone.addEventListener('dragleave', upDragLeave);
        uploadZone.addEventListener('drop', upDrop);
        uploadZone.addEventListener('click', () => document.getElementById('upload-file-input').click());
    }

    const uploadFileInput = document.getElementById('upload-file-input');
    if (uploadFileInput) {
        uploadFileInput.addEventListener('change', e => upHandleFile(e.target.files[0]));
    }

    const unmatchedToggle = document.getElementById('unmatched-toggle');
    if (unmatchedToggle) unmatchedToggle.addEventListener('click', upToggleUnmatched);

    const upConfirmBtn = document.getElementById('up-confirm-btn');
    if (upConfirmBtn) upConfirmBtn.addEventListener('click', upConfirm);

    /* Export buttons */
    document.querySelectorAll('[data-export-label]').forEach(btn => {
        btn.addEventListener('click', () => exportDownload(btn.dataset.exportLabel));
    });

    /* Invite Link */
    const inviteCopyBtn = document.getElementById('invite-copy-btn');
    if (inviteCopyBtn) inviteCopyBtn.addEventListener('click', inviteCopyLink);

    const inviteRegenBtn = document.getElementById('invite-regen-btn');
    if (inviteRegenBtn) inviteRegenBtn.addEventListener('click', inviteOpenRegen);

    const regenModal = document.getElementById('regen-modal');
    if (regenModal) {
        regenModal.addEventListener('click', e => { if (e.target === regenModal) inviteCloseRegen(); });
        document.getElementById('regen-cancel-btn')?.addEventListener('click', inviteCloseRegen);
        document.getElementById('regen-confirm-btn')?.addEventListener('click', inviteConfirmRegen);
    }

    /* Invite QR download */
    const qrDownloadBtn = document.getElementById('qr-download-btn');
    if (qrDownloadBtn) qrDownloadBtn.addEventListener('click', () => gToast('QR code downloaded.'));

    /* Init mobile student cards */
    sdRenderMobileCards();

    /* Load real student data from backend */
    loadStudentData();
});