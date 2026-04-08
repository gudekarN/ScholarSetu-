/* superadmin-keys.js — Secret key generator */
let generatedKey = '';

function generateKey() {
    const col   = document.getElementById('gk-college').value.trim();
    const aishe = document.getElementById('gk-aishe').value.trim();

    if (!col || !aishe) {
        alert('Please enter both College Name and AISHE Code.');
        return;
    }

    // Send to Flask — let Flask generate the secure key
    fetch('/superadmin/generate_key', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ college_name: col, aishe_code: aishe })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            generatedKey = data.key;

            const display    = document.getElementById('secret-key-display');
            const btnReveal  = document.getElementById('btn-reveal');

            display.innerText = '••••••••••••••••••••••••••••';
            display.classList.add('masked');
            btnReveal.innerText = 'Reveal';

            document.getElementById('key-result').classList.add('show');
        } else {
            alert(data.message || 'Failed to generate key.');
        }
    })
    .catch(() => alert('Network error. Please try again.'));
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
