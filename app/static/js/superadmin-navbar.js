/* superadmin-navbar.js — Profile dropdown */
function toggleDropdown() {
    document.getElementById('profile-dropdown').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) profileBtn.addEventListener('click', toggleDropdown);

    /* Logout button */
    const logoutBtn = document.getElementById('sa-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        window.location.href = '/auth/logout';
    });

    /* Close dropdown on outside click */
    document.addEventListener('click', (e) => {
        const wrap = document.querySelector('.profile-wrap');
        if (wrap && !wrap.contains(e.target)) {
            document.getElementById('profile-dropdown').classList.remove('open');
        }
    });
});
