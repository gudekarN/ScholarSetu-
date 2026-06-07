/* ═══ admin-main.js — Tab switching + global init ═══ */
const TAB_IDS = ['notice', 'students', 'generate', 'upload', 'export', 'query', 'invite'];

const TAB_LABELS = {
    notice: 'notice-board',
    students: 'student-data',
    generate: 'generate-excel',
    upload: 'upload-excel',
    export: 'export-data',
    query: 'query-tracker',
    invite: 'invite-link'
};

const TAB_BY_LABEL = Object.fromEntries(
    Object.entries(TAB_LABELS).map(([id, label]) => [label, id])
);

let _adminFirstLoad = true;

function switchTab(id) {
    TAB_IDS.forEach(t => {
        const panel = document.getElementById('panel-' + t);
        const sbBtn = document.getElementById('sb-' + t);
        const btbBtn = document.getElementById('btb-' + t);
        const active = t === id;
        if (panel) {
            if (active && _adminFirstLoad) {
                panel.style.animation = 'none';
                panel.classList.add('active');
            } else {
                panel.style.animation = '';
                panel.classList.toggle('active', active);
            }
        }
        if (sbBtn) sbBtn.classList.toggle('active', active);
        if (btbBtn) btbBtn.classList.toggle('active', active);
    });
    _adminFirstLoad = false;
    const s = document.getElementById('tab-init-style');
    if (s) s.remove();
    history.replaceState(null, '', '#' + (TAB_LABELS[id] || id));
    const mc = document.querySelector('.main-content');
    if (mc) mc.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Wire sidebar buttons */
document.addEventListener('DOMContentLoaded', () => {
    TAB_IDS.forEach(id => {
        const sb = document.getElementById('sb-' + id);
        if (sb) sb.addEventListener('click', () => switchTab(id));
        const btb = document.getElementById('btb-' + id);
        if (btb) btb.addEventListener('click', () => switchTab(id));
    });
});

/* Run immediately — before first paint */
const _initHash = location.hash.slice(1);
const _initId = TAB_BY_LABEL[_initHash] || (TAB_IDS.includes(_initHash) ? _initHash : TAB_IDS[0]);
switchTab(_initId);
