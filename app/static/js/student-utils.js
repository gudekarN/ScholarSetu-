// ─────────────────────────────────────────
// student-utils.js — Shared utility functions
// ─────────────────────────────────────────

/**
 * Show a floating toast notification.
 * @param {string} msg  - Message text
 * @param {'info'|'success'|'error'} type - Toast style
 */
function showToast(msg, type = 'info') {
    const colors = {
        success: 'var(--green)',
        error: '#DC2626',
        info: '#1A1A1A'
    };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${colors[type] || colors.info};color:#fff;padding:13px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,.28);animation:fadeUp .25s ease;white-space:nowrap;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3400);
}

/**
 * Show a red error toast (used by eligibility checker).
 */
function showEligToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#DC2626;color:#fff;padding:12px 22px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 6px 22px rgba(220,38,38,.35);white-space:nowrap;animation:fadeUp .25s ease;';
    t.textContent = '⚠️ ' + msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Inject shake keyframe animation for form validation
(function injectShakeStyle() {
    const s = document.createElement('style');
    s.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';
    document.head.appendChild(s);
})();
