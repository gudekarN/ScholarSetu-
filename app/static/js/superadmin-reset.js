/* superadmin-reset.js — Academic Year Reset modal flow */
function openResetModal() {
    document.getElementById('reset-modal').classList.add('open');
    document.getElementById('reset-confirm-input').value = '';
    document.getElementById('btn-modal-confirm').disabled = true;
}

function closeResetModal() {
    document.getElementById('reset-modal').classList.remove('open');
}

function checkResetConfirm(val) {
    document.getElementById('btn-modal-confirm').disabled = val.trim() !== 'CONFIRM RESET';
}

function confirmPreview() {
    closeResetModal();
    document.getElementById('btn-execute-reset').disabled = false;
    document.getElementById('preview-badge').classList.add('show');
}

function executeReset() {
    if (confirm('FINAL WARNING: This will execute the academic year reset across the entire database. This action cannot be undone. Proceed?')) {
        const btn = document.getElementById('btn-execute-reset');
        btn.innerHTML = 'Resetting platform...';
        btn.style.opacity = '0.8';

        setTimeout(() => {
            showToast('Academic Year Reset completed successfully!', true);
            setTimeout(() => window.location.reload(), 2000);
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-preview-reset')?.addEventListener('click', openResetModal);
    document.getElementById('btn-execute-reset')?.addEventListener('click', executeReset);
    document.getElementById('btn-modal-cancel')?.addEventListener('click', closeResetModal);
    document.getElementById('btn-modal-confirm')?.addEventListener('click', confirmPreview);

    document.getElementById('reset-confirm-input')?.addEventListener('keyup', function() {
        checkResetConfirm(this.value);
    });

    /* Close modal on overlay click */
    document.getElementById('reset-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('reset-modal')) closeResetModal();
    });
});
