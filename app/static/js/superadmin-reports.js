/* superadmin-reports.js — Step Report Tracker */

const PROCESS_LABELS = {
    'check_dbt_npci': 'Check DBT Status (NPCI)',
    'check_dbt_myaadhar': 'Check DBT Status (MyAadhaar)',
    'enable_dbt_online': 'Enable DBT (Online)',
    'grievance': 'Grievance (Online)'
};

async function loadStepReports() {
    const tbody = document.getElementById('step-reports-tbody');
    if (!tbody) return;

    try {
        const res = await fetch('/superadmin/get_step_reports');
        const data = await res.json();

        if (!data.success || !data.reports.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No reports submitted yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.reports.forEach(report => {
            const label = PROCESS_LABELS[report.process] || report.process;
            const badgeClass = report.report_count >= 5 ? 'report-count-badge' : 'report-count-badge low';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${label}</strong></td>
                <td>Step ${report.step_number}</td>
                <td><span class="${badgeClass}">${report.report_count}</span></td>
                <td class="td-muted">${report.last_reported}</td>
                <td>
                    <button class="btn-mark-updated" onclick="markUpdated(this, '${report.process}', ${report.step_number})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Mark as Updated
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load step reports:', err);
    }
}

async function markUpdated(btn, process, stepNumber) {
    try {
        const res = await fetch('/superadmin/clear_step_reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ process: process, step_number: stepNumber })
        });
        const data = await res.json();
        if (!data.success) { showToast('Failed to clear reports.'); return; }
    } catch (err) {
        showToast('Failed to clear reports.');
        return;
    }
    const tr = btn.closest('tr');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Resolved`;
    btn.classList.add('done');
    btn.disabled = true;
    tr.style.opacity = '0.6';
    setTimeout(() => tr.remove(), 500);
    showToast('Step marked as updated and reports cleared.');
}

document.addEventListener('DOMContentLoaded', () => {
    loadStepReports();
});
