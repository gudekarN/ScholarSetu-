// ─────────────────────────────────────────
// student-tabs.js — Tab switching logic
// ─────────────────────────────────────────

const TAB_IDS = ['home', 'dbt-status', 'enable-dbt', 'eligibility', 'apply-guide', 'qa', 'grievance'];

function switchTab(id) {
    TAB_IDS.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        const panel = document.getElementById('panel-' + t);
        const active = t === id;
        if (btn) {
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active);
        }
        if (panel) panel.classList.toggle('active', active);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });
});
