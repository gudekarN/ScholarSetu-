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
const SD_MODAL_BODY_HTML = document.querySelector('#sd-modal .modal-body').innerHTML;

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

    // Get all header names from index 7 onwards (after Year), excluding last Actions column
    const headers = Array.from(document.querySelectorAll('.sd-table thead tr th'));
    const extraHeaders = headers.slice(7, headers.length - 1).map(th => th.textContent.trim());

    // Get matching cell values
    const extraValues = Array.from(cells).slice(7, cells.length - 1).map(td => td.textContent.trim());

    // Build dynamic fields in modal
    const modalGrid = document.querySelector('#sd-modal .modal-grid');
    // Remove previously added dynamic fields
    modalGrid.querySelectorAll('.dynamic-extra-field').forEach(el => el.remove());

    extraHeaders.forEach((key, i) => {
        const div = document.createElement('div');
        div.className = 'form-row dynamic-extra-field';
        div.innerHTML = `<label class="form-label">${escHtml(key)}</label>
            <input class="form-input" data-extra-key="${escHtml(key)}" type="text" value="${escHtml(extraValues[i] || '')}">`;
        modalGrid.appendChild(div);
    });

    document.getElementById('sd-modal').classList.add('open');

    const deleteBtn = document.getElementById('sd-modal-delete');
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            // Replace modal body with confirmation view
            const modalBody = document.querySelector('#sd-modal .modal-body');
            modalBody.innerHTML = `
                <div style="text-align:center;padding:16px 0;">
                    <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
                    <div style="font-weight:600;font-size:16px;margin-bottom:8px;">Delete ${escHtml(sdCurrentRow.dataset.name)}?</div>
                    <div style="color:var(--text-secondary);font-size:13px;margin-bottom:20px;">This will permanently remove the student and all their data from the system. This action cannot be undone.</div>
                    <div style="display:flex;gap:10px;justify-content:center;">
                        <button class="btn-ghost" id="sd-delete-cancel">Cancel</button>
                        <button class="btn-red-ghost" id="sd-delete-confirm" style="background:#ef4444;color:white;border:none;">Yes, Delete</button>
                    </div>
                </div>`;
            document.querySelector('#sd-modal .modal-footer').style.display = 'none';
            document.getElementById('sd-delete-cancel').onclick = () => sdCloseModal();
            document.getElementById('sd-delete-confirm').onclick = () => sdConfirmDelete();
        };
    }
}

function sdCloseModal() {
    const modalBody = document.querySelector('#sd-modal .modal-body');
    if (modalBody) modalBody.innerHTML = SD_MODAL_BODY_HTML;
    document.querySelector('#sd-modal .modal-footer').style.display = '';
    document.getElementById('sd-modal').classList.remove('open');
}

async function sdConfirmDelete() {
    const studentId = sdCurrentRow.dataset.studentId;
    try {
        const res = await fetch('/admin/delete_student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId })
        });
        const data = await res.json();
        if (data.success) {
            sdCurrentRow.remove();
            sdCloseModal();
            gToast('Student deleted successfully.');
            sdRenderMobileCards();
        } else {
            gToast('❌ Delete failed. Please try again.');
        }
    } catch {
        gToast('❌ Network error.');
    }
}

function sdSaveEdit() {
    if (!sdCurrentRow) return;

    const studentId = sdCurrentRow.dataset.studentId;
    const payload = {
        student_id: studentId,
        full_name: document.getElementById('m-name').value,
        prn: document.getElementById('m-prn').value,
        email: document.getElementById('m-email').value,
        contact_number: document.getElementById('m-contact').value,
        department: document.getElementById('m-dept').value,
        year: document.getElementById('m-year').value
    };

    const extraData = {};
    document.querySelectorAll('#sd-modal .dynamic-extra-field input').forEach(inp => {
        extraData[inp.dataset.extraKey] = inp.value.trim();
    });
    if (Object.keys(extraData).length > 0) payload.extra_data = extraData;

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
            sdCurrentRow.dataset.prn = payload.prn;
            sdCurrentRow.dataset.dept = payload.department;
            sdCurrentRow.dataset.year = payload.year;

            const extraInputs = document.querySelectorAll('#sd-modal .dynamic-extra-field input');
            const extraCells = Array.from(sdCurrentRow.querySelectorAll('td')).slice(7, cells.length - 1);
            extraInputs.forEach((inp, i) => {
                if (extraCells[i]) extraCells[i].textContent = inp.value.trim();
            });

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

            const students = data.students;

            const extraKeys = [];
            students.forEach(s => {
                if (s.extra_data) {
                    Object.keys(s.extra_data).forEach(k => {
                        if (!extraKeys.includes(k)) extraKeys.push(k);
                    });
                }
            });

            // Dynamically update the HTML table header to include the new extraKeys
            const theadTr = document.querySelector('.sd-table thead tr');
            if (theadTr) {
                theadTr.innerHTML = `
                    <th>SR.NO.</th>
                    <th>FULL NAME</th>
                    <th>PRN</th>
                    <th>EMAIL</th>
                    <th>CONTACT</th>
                    <th>DEPARTMENT</th>
                    <th>YEAR</th>
                    ${extraKeys.map(k => `<th>${escHtml(k)}</th>`).join('')}
                    <th>ACTIONS</th>
                `;
            }

            const tbody = document.getElementById('sd-tbody');
            tbody.innerHTML = '';

            students.forEach((s, idx) => {
                const verifiedLabel = s.is_verified ? 'Verified' : 'Pending';
                const tr = document.createElement('tr');
                tr.dataset.studentId = s.student_id;
                tr.dataset.name = s.full_name;
                tr.dataset.prn = s.prn;
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
                    ${extraKeys.map(k => `<td>${s.extra_data && s.extra_data[k] ? escHtml(s.extra_data[k]) : '—'}</td>`).join('')}
                    <td><button class="btn-edit-row">✍️ Edit</button></td>
                `;
                tbody.appendChild(tr);
            });

            /* Wire edit buttons for newly created rows */
            tbody.querySelectorAll('.btn-edit-row').forEach(btn => {
                btn.addEventListener('click', () => sdOpenEdit(btn));
            });

            /* Update metrics strip */
            const total = data.students.length;
            const verified = data.students.filter(s => s.is_verified).length;
            const pending = total - verified;
            const mTotal = document.getElementById('m-total');
            const mVerified = document.getElementById('m-verified');
            const mPending = document.getElementById('m-pending');
            if (mTotal) mTotal.textContent = total;
            if (mVerified) mVerified.textContent = verified;
            if (mPending) mPending.textContent = pending;

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

    // Blocked column names — case insensitive check
    const blocked = ['PRN', 'FULL NAME', 'EMAIL'];
    if (blocked.includes(name.toLowerCase())) {
        const messages = {
            'PRN': '⚠️ PRN is already included as a locked column and cannot be added again.',
            'FULL NAME': '⚠️ Full Name is already included as a locked column and cannot be added again.',
            'EMAIL': '⚠️ Email requires verification and cannot be updated through Excel upload. Use the Edit button in Student Data to change emails individually.'
        };
        const msg = messages[name.toLowerCase()];

        // Show warning below the input field
        let warningEl = document.getElementById('gen-col-warning');
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'gen-col-warning';
            warningEl.style.cssText = 'font-size:13px; color:#b91c1c; background:#fef2f2; border:1px solid #fca5a5; border-radius:7px; padding:9px 13px; margin-top:8px; line-height:1.5;';
            inp.parentElement.insertAdjacentElement('afterend', warningEl);
        }
        warningEl.textContent = msg;
        warningEl.style.display = 'block';

        // Auto-hide warning after 4 seconds
        clearTimeout(warningEl._hideTimer);
        warningEl._hideTimer = setTimeout(() => {
            warningEl.style.display = 'none';
        }, 4000);

        inp.value = '';
        return;
    }

    // Hide warning if visible
    const warningEl = document.getElementById('gen-col-warning');
    if (warningEl) warningEl.style.display = 'none';

    // Check for duplicate column name
    if (genCols.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
        let warningEl = document.getElementById('gen-col-warning');
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'gen-col-warning';
            warningEl.style.cssText = 'font-size:13px; color:#b91c1c; background:#fef2f2; border:1px solid #fca5a5; border-radius:7px; padding:9px 13px; margin-top:8px; line-height:1.5;';
            inp.parentElement.insertAdjacentElement('afterend', warningEl);
        }
        warningEl.textContent = `⚠️ "${name}" is already added as a column.`;
        warningEl.style.display = 'block';
        clearTimeout(warningEl._hideTimer);
        warningEl._hideTimer = setTimeout(() => {
            warningEl.style.display = 'none';
        }, 4000);
        inp.value = '';
        return;
    }

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
async function upConfirm() {
    const btn = document.getElementById('up-confirm-btn');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = 'Saving…';
    btn.disabled = true;

    try {
        const resp = await fetch('/admin/confirm_excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: pendingRows.filter(r => r._status === 'success') })
        });
        const data = await resp.json();

        if (data.success) {
            gToast(`✅ ${data.saved} records saved to database.`);
            pendingRows = [];
            const resultEl = document.getElementById('upload-result');
            if (resultEl) resultEl.style.display = 'none';
            const zoneTitle = document.querySelector('#upload-zone .upload-zone-title');
            if (zoneTitle) zoneTitle.textContent = 'Drop your .xlsx file here';

            // Optionally, reload the student data to reflect changes
            loadStudentData();
        } else {
            gToast('❌ Save failed. Please try again.');
        }
    } catch (err) {
        gToast('❌ Save failed. Please check your connection.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
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

    const genBtn = document.getElementById('gen-download-btn');
    if (genBtn) genBtn.addEventListener('click', generateExcel);

    /* Upload Excel */
    const uploadZone = document.getElementById('upload-zone');
    const uploadInput = document.getElementById('upload-file-input');

    if (uploadZone && uploadInput) {
        uploadZone.addEventListener('click', () => uploadInput.click());

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--saffron)';
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '';
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.xlsx')) uploadExcel(file);
            else alert('Please drop a .xlsx file only.');
        });

        // File input change
        uploadInput.addEventListener('change', () => {
            const file = uploadInput.files[0];
            if (file) uploadExcel(file);
        });
    }

    const unmatchedToggle = document.getElementById('unmatched-toggle');
    const unmatchedList = document.getElementById('unmatched-list');
    if (unmatchedToggle && unmatchedList) {
        unmatchedToggle.addEventListener('click', () => {
            const isVisible = unmatchedList.style.display !== 'none';
            unmatchedList.style.display = isVisible ? 'none' : 'flex';
            unmatchedToggle.textContent = isVisible ? 'View Unmatched PRNs ▼' : 'Hide Unmatched PRNs ▲';
        });
    }

    const upConfirmBtn = document.getElementById('up-confirm-btn');
    if (upConfirmBtn) upConfirmBtn.addEventListener('click', upConfirm);

    /* Export buttons */
    document.querySelectorAll('[data-export-label]').forEach(btn => {
        btn.addEventListener('click', () => exportData(null, null));
    });

    // Export — By department
    const expDeptBtn = document.getElementById('exp-dept-btn');
    if (expDeptBtn) {
        expDeptBtn.addEventListener('click', () => {
            const dept = document.getElementById('exp-dept-sel')?.value;
            if (!dept) return;
            exportData('department', dept);
        });
    }

    // Export — By year
    const expYearBtn = document.getElementById('exp-year-btn');
    if (expYearBtn) {
        expYearBtn.addEventListener('click', () => {
            const year = document.getElementById('exp-year-sel')?.value;
            if (!year) return;
            exportData('year', year);
        });
    }

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

    // Manage Columns
    document.getElementById('dd-manage-cols')?.addEventListener('click', (e) => {
        e.preventDefault();
        const pd = document.getElementById('profile-dropdown');
        if (pd) pd.classList.remove('open');
        openManageCols();
    });
    document.getElementById('col-modal-close')?.addEventListener('click', () => {
        document.getElementById('col-modal').classList.remove('open');
    });

    /* Init mobile student cards */
    sdRenderMobileCards();

    /* Load real student data from backend */
    loadStudentData();
});

// ── GENERATE EXCEL ───────────────────────────────────────────────────────────

function generateExcel() {
    // Read custom column names from the UI column list
    const colItems = document.querySelectorAll('#gen-col-list .custom-col-item span');
    const customCols = Array.from(colItems).map(el => el.textContent.trim()).filter(Boolean);

    // Build query string with custom cols
    const params = new URLSearchParams();
    customCols.forEach(col => params.append('cols', col));

    const url = '/admin/generate_excel' + (customCols.length ? '?' + params.toString() : '');

    // Trigger file download
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ── UPLOAD EXCEL ─────────────────────────────────────────────────────────────

let pendingRows = [];

async function uploadExcel(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    // Show loading state
    const zone = document.getElementById('upload-zone');
    if (zone) zone.querySelector('.upload-zone-title').textContent = 'Uploading…';

    try {
        const resp = await fetch('/admin/parse_excel', {
            method: 'POST',
            body: formData
        });
        const data = await resp.json();

        if (!data.success) {
            alert(data.message || 'Upload failed. Please try again.');
            return;
        }

        renderUploadReport(file.name, data.report, data.headers);

    } catch (err) {
        alert('Upload failed. Please check your connection and try again.');
    } finally {
        if (zone) zone.querySelector('.upload-zone-title').textContent = 'Drop your .xlsx file here';
    }
}

function renderUploadReport(filename, report, headers) {
    // Show filename
    const fnEl = document.getElementById('upload-filename');
    if (fnEl) fnEl.textContent = `${filename} · ${report.total_rows} rows detected`;

    // Update metric cards
    const cards = document.querySelectorAll('.upload-metric-card');
    if (cards[0]) cards[0].querySelector('.upload-metric-val').textContent = report.success_count;
    if (cards[1]) cards[1].querySelector('.upload-metric-val').textContent = report.unmatched.length;
    if (cards[2]) cards[2].querySelector('.upload-metric-val').textContent = report.skipped.length;

    // Hide the old unmatched chip toggle / list — replaced by preview table
    const unmatchedToggle = document.getElementById('unmatched-toggle');
    const unmatchedList = document.getElementById('unmatched-list');
    if (unmatchedToggle) unmatchedToggle.style.display = 'none';
    if (unmatchedList) unmatchedList.style.display = 'none';

    // Remove any existing preview table before re-rendering
    const existingPreview = document.getElementById('upload-preview-wrap');
    if (existingPreview) existingPreview.remove();

    pendingRows = report.rows || [];

    // Build preview table (only if rows data exists)
    if (report.rows && report.rows.length > 0) {
        const colKeys = headers || Object.keys(report.rows[0]).filter(k => k !== '_status');

        // Legend
        const legend = `
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                <span style="font-size:12px;font-weight:600;color:var(--text-muted);">Legend:</span>
                <span style="background:#FFF3CD;color:#92400e;border-radius:4px;padding:2px 8px;font-size:12px;font-weight:500;">⚠️ PRN Not Matched</span>
                <span style="background:#F0F0F0;color:#6b7280;border-radius:4px;padding:2px 8px;font-size:12px;font-weight:500;">⏭ Row Skipped</span>
            </div>`;

        // Table header
        const thCells = ['Status', ...colKeys].map(k =>
            `<th style="background:#f5f5f0;padding:8px 12px;text-align:left;white-space:nowrap;position:sticky;top:0;border-bottom:1px solid var(--border);font-size:13px;">${escHtml(k)}</th>`
        ).join('');

        // Table rows
        const trRows = report.rows.map(row => {
            let rowBg = '';
            let statusCell = '';
            if (row._status === 'unmatched') {
                rowBg = 'background:#FFF3CD;';
                statusCell = `<td style="padding:7px 12px;border-bottom:1px solid var(--border);white-space:nowrap;color:#92400e;font-weight:600;">⚠️ PRN Not Matched</td>`;
            } else if (row._status === 'skipped') {
                rowBg = 'background:#F0F0F0;';
                statusCell = `<td style="padding:7px 12px;border-bottom:1px solid var(--border);white-space:nowrap;color:#6b7280;">⏭ Skipped</td>`;
            } else {
                statusCell = `<td style="padding:7px 12px;border-bottom:1px solid var(--border);white-space:nowrap;color:#16a34a;font-weight:600;">✅ Data Filled</td>`;
            }
            const dataCells = colKeys.map(k =>
                `<td style="padding:7px 12px;border-bottom:1px solid var(--border);white-space:nowrap;">${escHtml(row[k] ?? '')}</td>`
            ).join('');
            return `<tr style="${rowBg}">${statusCell}${dataCells}</tr>`;
        }).join('');

        const previewHtml = `
            <div id="upload-preview-wrap" style="margin:18px 0;">
                ${legend}
                <div style="overflow-x:auto;overflow-y:auto;max-height:340px;border-radius:10px;border:1px solid var(--border);">
                    <table style="border-collapse:collapse;width:100%;font-size:13px;font-family:'DM Sans',sans-serif;">
                        <thead><tr>${thCells}</tr></thead>
                        <tbody>${trRows}</tbody>
                    </table>
                </div>
            </div>`;

        // Insert between metric cards and unmatched-toggle
        const toggleEl = document.getElementById('unmatched-toggle');
        if (toggleEl) {
            toggleEl.insertAdjacentHTML('beforebegin', previewHtml);
        }
    }

    // Show result section
    const resultEl = document.getElementById('upload-result');
    if (resultEl) resultEl.style.display = 'block';
}

// ── EXPORT DATA ──────────────────────────────────────────────────────────────

function exportData(filterType, filterValue) {
    let url = '/admin/export_data';
    if (filterType && filterValue) {
        url += `?${filterType}=${encodeURIComponent(filterValue)}`;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ── MANAGE COLUMNS ───────────────────────────────────────────────────────────

function openManageCols() {
    // Get current extra column headers from the table
    const headers = Array.from(document.querySelectorAll('.sd-table thead tr th'));
    const extraHeaders = headers.slice(7, headers.length - 1).map(th => th.textContent.trim());

    const colList = document.getElementById('col-list');
    const colEmpty = document.getElementById('col-empty');
    if (!colList || !colEmpty) return;
    
    colList.innerHTML = '';

    if (extraHeaders.length === 0) {
        colEmpty.style.display = 'block';
    } else {
        colEmpty.style.display = 'none';
        extraHeaders.forEach(key => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid var(--border);border-radius:8px;background:var(--white);';
            row.innerHTML = `
                <span style="font-size:14px;font-weight:500;">${escHtml(key)}</span>
                <button data-col-key="${escHtml(key)}" style="background:none;border:none;cursor:pointer;font-size:18px;color:#ef4444;" title="Delete column">🗑️</button>`;
            row.querySelector('button').onclick = () => confirmDeleteCol(key, row);
            colList.appendChild(row);
        });
    }
    document.getElementById('col-modal').classList.add('open');
}

function confirmDeleteCol(key, rowEl) {
    rowEl.innerHTML = `
        <span style="font-size:13px;color:#92400e;flex:1;">Delete "<strong>${escHtml(key)}</strong>" for all students?</span>
        <div style="display:flex;gap:8px;">
            <button id="col-del-cancel" class="btn-ghost" style="padding:4px 10px;font-size:12px;">No</button>
            <button id="col-del-confirm" style="background:#ef4444;color:white;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">Yes, Delete</button>
        </div>`;
    rowEl.querySelector('#col-del-cancel').onclick = () => openManageCols();
    rowEl.querySelector('#col-del-confirm').onclick = async () => {
        try {
            const res = await fetch('/admin/delete_column', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ column: key })
            });
            const data = await res.json();
            if (data.success) {
                gToast(`Column "${key}" deleted.`);
                rowEl.remove();
                if (document.querySelectorAll('#col-list > div').length === 0) {
                    document.getElementById('col-empty').style.display = 'block';
                }
                loadStudentData();
            } else {
                gToast('❌ Delete failed.');
            }
        } catch {
            gToast('❌ Network error.');
        }
    };
}
