/* ═══ admin-main.js — Tab switching + global init ═══ */
const TAB_IDS = ['notice', 'students', 'generate', 'upload', 'export', 'query', 'invite'];

function switchTab(id) {
    TAB_IDS.forEach(t => {
        const panel = document.getElementById('panel-' + t);
        const sbBtn = document.getElementById('sb-' + t);
        const btbBtn = document.getElementById('btb-' + t);
        const active = t === id;
        panel.classList.toggle('active', active);
        if (sbBtn) sbBtn.classList.toggle('active', active);
        if (btbBtn) btbBtn.classList.toggle('active', active);
    });
    document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
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
