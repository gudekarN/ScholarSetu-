// ─────────────────────────────────────────
// student-tabs.js — Tab switching logic
// ─────────────────────────────────────────

const TAB_IDS = ['home', 'dbt-status', 'enable-dbt', 'eligibility', 'apply-guide', 'qa', 'grievance'];

const TAB_LABELS = {
    'home': 'home',
    'dbt-status': 'check-dbt-status',
    'enable-dbt': 'enable-dbt',
    'eligibility': 'eligibility',
    'apply-guide': 'apply-guide',
    'qa': 'qa',
    'grievance': 'grievance'
};

const TAB_BY_LABEL = Object.fromEntries(
    Object.entries(TAB_LABELS).map(([id, label]) => [label, id])
);

let _isFirstLoad = true;

function switchTab(id) {
    TAB_IDS.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        const panel = document.getElementById('panel-' + t);
        const active = t === id;
        if (btn) {
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active);
        }
        if (panel) {
            if (active && _isFirstLoad) {
                panel.style.animation = 'none';
                panel.classList.add('active');
            } else {
                panel.style.animation = '';
                panel.classList.toggle('active', active);
            }
        }
    });
    _isFirstLoad = false;
    const s = document.getElementById('tab-init-style');
    if (s) s.remove();
    history.replaceState(null, '', '#' + (TAB_LABELS[id] || id));
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });
});

/* Run immediately — before first paint */
const _initHash = location.hash.slice(1);
const _initId = TAB_BY_LABEL[_initHash] || (TAB_IDS.includes(_initHash) ? _initHash : TAB_IDS[0]);
switchTab(_initId);
