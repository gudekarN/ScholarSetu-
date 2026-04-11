/* ═══════════════════════════════════════════════════
   admin-invite.js — Invite Link Tab Logic
   ScholarSetu Admin Dashboard
   ═══════════════════════════════════════════════════ */

const BASE_URL = window.location.origin;
const JOIN_BASE = BASE_URL + '/auth/join/';

/* ── DOM refs ── */
const inviteLinkInput  = document.getElementById('invite-link-val');
const inviteCopyBtn    = document.getElementById('invite-copy-btn');
const inviteRegenBtn   = document.getElementById('invite-regen-btn');
const regenModal       = document.getElementById('regen-modal');
const regenConfirmBtn  = document.getElementById('regen-confirm-btn');
const regenCancelBtn   = document.getElementById('regen-cancel-btn');
const createdChip      = document.getElementById('invite-created-chip');

/* ══════════════════════════════════════════════
   1. LOAD CURRENT TOKEN ON PAGE LOAD
   ══════════════════════════════════════════════ */
async function loadToken() {
    try {
        const res  = await fetch('/admin/get_token');
        const data = await res.json();

        if (data.success && data.token) {
            setLinkDisplay(data.token, data.created_at);
        } else {
            /* No active token yet */
            inviteLinkInput.value       = 'No active invite link — click Regenerate to create one';
            inviteLinkInput.style.color = 'var(--text-muted)';
            if (createdChip) createdChip.textContent = '🔗 No link created yet';
        }

    } catch (err) {
        console.error('Failed to load invite token:', err);
        inviteLinkInput.value = 'Error loading link — please refresh';
    }
}

/* ── helper: update input + created chip ── */
function setLinkDisplay(token, createdAt) {
    inviteLinkInput.value       = JOIN_BASE + token;
    inviteLinkInput.style.color = '';

    if (createdChip && createdAt) {
        const date = new Date(createdAt);
        const formatted = date.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        createdChip.textContent = '🔗 Created: ' + formatted;
    }
}

/* ══════════════════════════════════════════════
   2. COPY LINK TO CLIPBOARD
   ══════════════════════════════════════════════ */
function copyLink() {
    const link = inviteLinkInput.value;

    if (!link || link.startsWith('No active') || link.startsWith('Error')) {
        showCopyFeedback('⚠️ No link to copy', false);
        return;
    }

    navigator.clipboard.writeText(link)
        .then(() => showCopyFeedback('✅ Copied!', true))
        .catch(() => {
            /* Fallback for older browsers */
            inviteLinkInput.select();
            document.execCommand('copy');
            showCopyFeedback('✅ Copied!', true);
        });
}

/* ── visual feedback on copy button ── */
function showCopyFeedback(message, success) {
    const original = inviteCopyBtn.innerHTML;

    inviteCopyBtn.textContent = message;
    inviteCopyBtn.style.background = success ? 'var(--green, #16a34a)' : '#f59e0b';
    inviteCopyBtn.disabled = true;

    setTimeout(() => {
        inviteCopyBtn.innerHTML    = original;
        inviteCopyBtn.style.background = '';
        inviteCopyBtn.disabled     = false;
    }, 2000);
}

/* ══════════════════════════════════════════════
   3. REGENERATE MODAL — OPEN / CLOSE
   ══════════════════════════════════════════════ */
function openRegenModal() {
    if (regenModal) regenModal.classList.add('active');
}

function closeRegenModal() {
    if (regenModal) regenModal.classList.remove('active');
}

/* ══════════════════════════════════════════════
   4. CONFIRM REGENERATE — POST TO BACKEND
   ══════════════════════════════════════════════ */
async function confirmRegen() {
    regenConfirmBtn.textContent = 'Generating…';
    regenConfirmBtn.disabled    = true;

    try {
        const res  = await fetch('/admin/generate_token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({})
        });

        const data = await res.json();

        if (data.success && data.token) {
            setLinkDisplay(data.token, new Date().toISOString());
            closeRegenModal();
            showToast('✅ New invite link generated successfully!');
        } else {
            showToast('❌ Failed to generate link. Please try again.', true);
            closeRegenModal();
        }

    } catch (err) {
        console.error('Regen error:', err);
        showToast('❌ Network error. Please try again.', true);
        closeRegenModal();
    } finally {
        regenConfirmBtn.textContent = 'Yes, Regenerate';
        regenConfirmBtn.disabled    = false;
    }
}

/* ══════════════════════════════════════════════
   5. TOAST NOTIFICATION
   ══════════════════════════════════════════════ */
function showToast(message, isError = false) {
    /* Reuse the existing post-success-toast pattern if available,
       otherwise create a temporary toast */
    let toast = document.getElementById('invite-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'invite-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#ef4444' : '#16a34a'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent        = message;
    toast.style.background   = isError ? '#ef4444' : '#16a34a';
    toast.style.opacity      = '1';
    toast.style.display      = 'block';

    setTimeout(() => {
        toast.style.opacity  = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
}

/* ══════════════════════════════════════════════
   6. EVENT LISTENERS
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* Load token when page opens */
    loadToken();

    /* Copy button */
    if (inviteCopyBtn) {
        inviteCopyBtn.addEventListener('click', copyLink);
    }

    /* Open regen modal */
    if (inviteRegenBtn) {
        inviteRegenBtn.addEventListener('click', openRegenModal);
    }

    /* Confirm regen */
    if (regenConfirmBtn) {
        regenConfirmBtn.addEventListener('click', confirmRegen);
    }

    /* Cancel regen */
    if (regenCancelBtn) {
        regenCancelBtn.addEventListener('click', closeRegenModal);
    }

    /* Close modal on overlay click */
    if (regenModal) {
        regenModal.addEventListener('click', (e) => {
            if (e.target === regenModal) closeRegenModal();
        });
    }

});