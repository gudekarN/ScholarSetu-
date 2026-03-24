// ─────────────────────────────────────────
// student-notices.js — Live countdown timer & notice card interactions
// ─────────────────────────────────────────

// ── Live countdown timer ──
// Target: 12 days 4 hours 22 minutes from page load
const TARGET = new Date();
TARGET.setDate(TARGET.getDate() + 12);
TARGET.setHours(TARGET.getHours() + 4);
TARGET.setMinutes(TARGET.getMinutes() + 22);

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
    const now = new Date();
    let diff = Math.max(0, Math.floor((TARGET - now) / 1000));

    const d = Math.floor(diff / 86400); diff -= d * 86400;
    const h = Math.floor(diff / 3600); diff -= h * 3600;
    const m = Math.floor(diff / 60); diff -= m * 60;
    const s = diff;

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins = document.getElementById('cd-mins');
    const elSecs = document.getElementById('cd-secs');

    if (elDays) elDays.textContent = pad(d);
    if (elHours) elHours.textContent = pad(h);
    if (elMins) elMins.textContent = pad(m);
    if (elSecs) elSecs.textContent = pad(s);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── Notice card click → open modal ──
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.notice-card[data-modal]').forEach(card => {
        card.addEventListener('click', function () {
            openModal(this.dataset.modal);
        });
    });
});
