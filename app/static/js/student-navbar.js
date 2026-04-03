// ─────────────────────────────────────────
// student-navbar.js — Profile dropdown logic
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const ddDocs = document.getElementById('dd-docs');
    const ddAbout = document.getElementById('dd-about');
    const ddLogout = document.getElementById('dd-logout');

    function toggleDropdown() {
        if (!profileDropdown) return;
        const open = profileDropdown.classList.toggle('open');
        if (profileBtn) profileBtn.setAttribute('aria-expanded', open);
    }

    function closeDropdown() {
        if (!profileDropdown) return;
        profileDropdown.classList.remove('open');
        if (profileBtn) profileBtn.setAttribute('aria-expanded', false);
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', toggleDropdown);
        profileBtn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') toggleDropdown();
        });
    }

    if (ddDocs) ddDocs.addEventListener('click', closeDropdown);
    if (ddAbout) ddAbout.addEventListener('click', closeDropdown);
    if (ddLogout) ddLogout.addEventListener('click', function () {
        window.location.href = '/auth/logout';
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
        const wrap = document.querySelector('.profile-wrap');
        if (wrap && !wrap.contains(e.target)) closeDropdown();
    });
});
