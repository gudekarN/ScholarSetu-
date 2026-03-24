/* superadmin-colleges.js — College registry actions */
function toggleStatus(btn) {
    const isDeactivate = btn.classList.contains('btn-deactivate');
    const tr = btn.closest('tr');
    const badge = tr.querySelector('.status-badge');

    if (isDeactivate) {
        if (confirm('Are you sure you want to pause access for this college?')) {
            btn.className = 'btn-activate';
            btn.innerText = 'Activate';
            badge.className = 'status-badge status-inactive';
            badge.innerText = 'Inactive';
            tr.style.opacity = '0.7';
            showToast('College deactivated.');
        }
    } else {
        btn.className = 'btn-deactivate';
        btn.innerText = 'Deactivate';
        badge.className = 'status-badge status-active';
        badge.innerText = 'Active';
        tr.style.opacity = '1';
        showToast('College activated successfully.');
    }
}

function promptEmail(collegeName, currentEmail) {
    const newEmail = prompt(`Update Admin Email for ${collegeName}`, currentEmail);
    if (newEmail && newEmail !== currentEmail && newEmail.includes('@')) {
        showToast(`Email updated to ${newEmail}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    /* Toggle status buttons */
    document.querySelectorAll('.btn-activate, .btn-deactivate').forEach(btn => {
        btn.addEventListener('click', () => toggleStatus(btn));
    });

    /* Update email links — use data attributes */
    document.querySelectorAll('[data-college-name]').forEach(btn => {
        btn.addEventListener('click', () => {
            promptEmail(btn.dataset.collegeName, btn.dataset.collegeEmail);
        });
    });
});
