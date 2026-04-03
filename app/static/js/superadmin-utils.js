/* superadmin-utils.js — Shared utility: showToast */
function showToast(msg, isError = false) {
    const existing = document.querySelector('.toast-fixed');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'toast-fixed';
    t.innerText = msg;
    t.style.background = isError ? '#DC2626' : '#138808';
    t.style.color = '#fff';
    document.body.appendChild(t);

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%, 10px)';
        t.style.transition = 'all 0.3s ease';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}
