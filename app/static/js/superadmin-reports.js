/* superadmin-reports.js — Step Report Tracker */
function markUpdated(btn) {
    const tr = btn.closest('tr');
    const badge = tr.querySelector('.report-count-badge');

    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Resolved`;
    btn.classList.add('done');
    btn.disabled = true;

    badge.className = 'report-count-badge none';
    badge.innerText = '0';

    tr.style.opacity = '0.6';
    showToast('Step marked as updated and reports cleared.');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-mark-updated').forEach(btn => {
        btn.addEventListener('click', () => markUpdated(btn));
    });
});
