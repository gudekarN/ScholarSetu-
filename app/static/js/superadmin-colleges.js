/* ═══════════════════════════════════════════════════
   superadmin-colleges.js — FIXED (2 STATE SYSTEM)
   Active / Inactive only
   ═══════════════════════════════════════════════════ */

/* ── Helpers ── */
function escHtml(s) {
    if (!s) return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

/* ══════════════════════════════════════════════
   BUILD TABLE ROW — FIXED
   ══════════════════════════════════════════════ */
function buildCollegeRow(college) {
    const isActive = college.status === true;
    const rowOpacity = isActive ? '1' : '0.7';

    const statusBadge = isActive
        ? `<span class="status-badge status-active">Active</span>`
        : `<span class="status-badge status-inactive">Inactive</span>`;

    const actionBtn = isActive
        ? `<button class="btn-deactivate" data-college-id="${college.college_id}">Deactivate</button>`
        : `<button class="btn-activate" data-college-id="${college.college_id}">Activate</button>`;

    return `
        <tr id="college-row-${college.college_id}" style="opacity:${rowOpacity};">
            <td><strong>${escHtml(college.college_name)}</strong></td>
            <td class="td-mono">${escHtml(college.aishe_code)}</td>
            <td>${escHtml(college.admin_email)}</td>
            <td>${statusBadge}</td>
            <td class="td-muted">${formatDate(college.created_at)}</td>
            <td>
                <div class="action-group">
                    ${actionBtn}
                    <button class="btn-link"
                        data-college-id="${college.college_id}"
                        data-college-name="${escHtml(college.college_name)}"
                        data-college-email="${escHtml(college.admin_email)}">
                        Update Email
                    </button>
                </div>
            </td>
        </tr>`;
}

/* ══════════════════════════════════════════════
   LOAD ALL COLLEGES
   ══════════════════════════════════════════════ */
async function loadColleges() {
    try {
        const res  = await fetch('/superadmin/get_colleges');
        const data = await res.json();

        if (!data.success) return;

        const tbody = document.getElementById('colleges-tbody');
        if (!tbody) return;

        if (!data.colleges || data.colleges.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">
                        No colleges registered yet.
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = data.colleges.map(buildCollegeRow).join('');

        /* Metrics */
        const total    = data.colleges.length;
        const active   = data.colleges.filter(c => c.status === true).length;
        const inactive = total - active;

        const elTotal   = document.getElementById('m-total-val');
        const elActive  = document.getElementById('m-active-val');
        const elPending = document.getElementById('m-pending-val'); // keep id same

        if (elTotal)   elTotal.textContent   = total;
        if (elActive)  elActive.textContent  = active;
        if (elPending) elPending.textContent = inactive;

        wireCollegeButtons();

    } catch (err) {
        console.error('Failed to load colleges:', err);
    }
}

/* ══════════════════════════════════════════════
   TOGGLE STATUS
   ══════════════════════════════════════════════ */
async function toggleStatus(btn) {
    const collegeId = btn.dataset.collegeId;
    const isDeactivate = btn.classList.contains('btn-deactivate');

    if (isDeactivate) {
        if (!confirm('Are you sure you want to deactivate this college?')) {
            return;
        }
    }

    btn.disabled = true;
    btn.textContent = 'Updating…';

    try {
        const res  = await fetch('/superadmin/toggle_status', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ college_id: collegeId })
        });

        const data = await res.json();

        if (data.success) {
            await loadColleges();
            showToast(data.new_status
                ? '✅ College activated successfully.'
                : '⚠️ College deactivated.');
        } else {
            showToast('❌ Failed to update status.');
            btn.disabled = false;
            btn.textContent = isDeactivate ? 'Deactivate' : 'Activate';
        }

    } catch (err) {
        console.error('Toggle status error:', err);
        showToast('❌ Network error.');
        btn.disabled = false;
        btn.textContent = isDeactivate ? 'Deactivate' : 'Activate';
    }
}

/* ══════════════════════════════════════════════
   UPDATE EMAIL — SIMPLE PROMPT VERSION
   (NO MODAL REQUIRED ✅)
   ══════════════════════════════════════════════ */
async function openEmailModal(btn) {
    const collegeId   = btn.dataset.collegeId;
    const collegeName = btn.dataset.collegeName;
    const currentEmail = btn.dataset.collegeEmail;

    const newEmail = prompt(
        `Update email for ${collegeName}\nCurrent: ${currentEmail}\n\nEnter new email:`
    );

    if (!newEmail || !newEmail.includes('@')) {
        showToast('❌ Invalid email.');
        return;
    }

    try {
        const res  = await fetch('/superadmin/update_admin_email', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                college_id: collegeId,
                new_email: newEmail.trim()
            })
        });

        const data = await res.json();

        if (data.success) {
            await loadColleges();
            showToast('✅ Email updated successfully.');
        } else {
            showToast(data.message || '❌ Failed to update email.');
        }

    } catch (err) {
        console.error(err);
        showToast('❌ Network error.');
    }
}

/* ══════════════════════════════════════════════
   WIRE BUTTONS
   ══════════════════════════════════════════════ */
function wireCollegeButtons() {
    document.querySelectorAll('.btn-activate, .btn-deactivate').forEach(btn => {
        btn.addEventListener('click', () => toggleStatus(btn));
    });

    document.querySelectorAll('.btn-link[data-college-id]').forEach(btn => {
        btn.addEventListener('click', () => openEmailModal(btn));
    });
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadColleges();
});