/* ═══ admin-navbar.js — Profile dropdown ═══ */
function toggleDropdown() {
    const dd = document.getElementById('profile-dropdown');
    const btn = document.getElementById('profile-btn');
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
}

document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', toggleDropdown);
        profileBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') toggleDropdown();
        });
    }

    /* Close dropdown when clicking outside */
    document.addEventListener('click', e => {
        const wrap = document.querySelector('.profile-wrap');
        if (wrap && !wrap.contains(e.target)) {
            document.getElementById('profile-dropdown').classList.remove('open');
            document.getElementById('profile-btn').setAttribute('aria-expanded', false);
        }
    });
});
