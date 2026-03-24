/* superadmin-keys.js — Secret key generator */
let generatedKey = '';

function generateKey() {
    const col = document.getElementById('gk-college').value.trim();
    const aishe = document.getElementById('gk-aishe').value.trim();

    if (!col || !aishe) {
        alert('Please enter both College Name and AISHE Code.');
        return;
    }

    const initials = col.split(' ').map(n => n[0]).join('').substring(0, 4).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    generatedKey = `SS-${initials}-${aishe.substring(2)}-${randomStr}`;

    const display = document.getElementById('secret-key-display');
    const btnReveal = document.getElementById('btn-reveal');

    display.innerText = '••••••••••••••••••••••••••••';
    display.classList.add('masked');
    btnReveal.innerText = 'Reveal';

    document.getElementById('key-result').classList.add('show');
}

function toggleKeyReveal() {
    const display = document.getElementById('secret-key-display');
    const btn = document.getElementById('btn-reveal');

    if (display.classList.contains('masked')) {
        display.innerText = generatedKey;
        display.classList.remove('masked');
        btn.innerText = 'Hide';
    } else {
        display.innerText = '••••••••••••••••••••••••••••';
        display.classList.add('masked');
        btn.innerText = 'Reveal';
    }
}

function copyKey() {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey).then(() => {
        showToast('Key copied to clipboard!');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-generate-key')?.addEventListener('click', generateKey);
    document.getElementById('btn-reveal')?.addEventListener('click', toggleKeyReveal);
    document.getElementById('btn-copy-key')?.addEventListener('click', copyKey);
});
