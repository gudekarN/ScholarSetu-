// ─────────────────────────────────────────
// student-modal.js — Modal open/close helpers
// ─────────────────────────────────────────

function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
}

function handleBackdropClick(e, id) {
    if (e.target === e.currentTarget) closeModal(id);
}

// Close on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => {
            m.classList.remove('open');
        });
        document.body.style.overflow = '';
    }
});

// Wire up all modal backdrops and close buttons via data attributes
document.addEventListener('DOMContentLoaded', function () {
    // Backdrop click to close
    document.querySelectorAll('.modal-backdrop[data-modal-id]').forEach(backdrop => {
        backdrop.addEventListener('click', function (e) {
            if (e.target === e.currentTarget) closeModal(this.dataset.modalId);
        });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.dataset.closeModal);
        });
    });

    // Notice card wiring removed — handled dynamically by student-notices.js
});