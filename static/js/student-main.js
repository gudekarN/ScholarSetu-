// ─────────────────────────────────────────
// student-main.js — App bootstrap & global event wiring
// ─────────────────────────────────────────
// This file initialises the application after all other JS modules
// have loaded. It converts any remaining inline-handler patterns
// that could not be wired in their own feature files.

document.addEventListener('DOMContentLoaded', function () {

    // ── Default active tab ──────────────────────────────────────
    // Ensure the first tab is active on page load.
    if (typeof switchTab === 'function') {
        switchTab('home');
    }

    // ── Toast animation keyframe (fallback if utils not loaded) ──
    if (!document.getElementById('fadeup-style')) {
        const s = document.createElement('style');
        s.id = 'fadeup-style';
        s.textContent = '@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(s);
    }

    // ── Global toast helper (safe fallback) ──────────────────────
    if (typeof showToast !== 'function') {
        window.showToast = function (msg) {
            console.info('[ScholarSetu]', msg);
        };
    }

});
