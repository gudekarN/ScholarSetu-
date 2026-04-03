// ─────────────────────────────────────────
// student-eligibility.js — Eligibility Checker logic
// ─────────────────────────────────────────

const SCHEMES = [
    {
        id: 'docs-1',
        name: 'Government Vidya Niketan Scholarship',
        dept: '🏛️ Social Justice & Special Assistance Dept. · MahaDBT Scheme',
        benefit: 'Up to ₹32,000/year',
        type: 'eligible',
        eligibleIf: d => d.domicile === 'mh' && ['SC', 'ST'].includes(d.caste) && !['6to8L', 'above8L'].includes(d.income) && ['UG', 'PG', 'Diploma', '11-12'].includes(d.level),
        docs: [
            { icon: '🪪', text: 'Aadhaar Card (self)' },
            { icon: '📋', text: 'Caste Certificate (SC/ST) — from competent authority' },
            { icon: '🏠', text: 'Domicile / Residence Certificate (Maharashtra)' },
            { icon: '💰', text: 'Income Certificate (current year) — sub-divisional office' },
            { icon: '📑', text: 'Bonafide Certificate from college' },
            { icon: '📝', text: 'Previous year marksheet (attested copy)' },
            { icon: '🏦', text: 'Bank passbook (DBT-enabled, Aadhaar-linked)' },
        ]
    },
    {
        id: 'docs-2',
        name: 'Post-Matric Scholarship for SC Students',
        dept: '🏛️ Social Justice & Special Assistance Dept. · MahaDBT Scheme',
        benefit: 'Up to ₹20,000/year',
        type: 'eligible',
        eligibleIf: d => d.domicile === 'mh' && d.caste === 'SC' && d.income !== 'above8L' && ['UG', 'PG', 'Diploma', 'PhD'].includes(d.level),
        docs: [
            { icon: '🪪', text: 'Aadhaar Card (self + parents)' },
            { icon: '📋', text: 'SC Caste Certificate' },
            { icon: '💰', text: 'Income Certificate (below ₹2.5L for full benefit)' },
            { icon: '📑', text: 'Bonafide Certificate' },
            { icon: '📝', text: 'SSC Marksheet (10th)' },
            { icon: '📝', text: 'Previous year / last exam marksheet' },
            { icon: '🏦', text: 'Bank account details (DBT-enabled)' },
            { icon: '📸', text: 'Passport-size photograph' },
        ]
    },
    {
        id: 'docs-3',
        name: 'Rajarshi Chhatrapati Shahu Maharaj Scholarship',
        dept: '🏛️ Higher & Technical Education Dept. · MahaDBT Scheme',
        benefit: '₹1,200/month maintenance',
        type: 'eligible',
        eligibleIf: d => d.domicile === 'mh' && ['OBC', 'VJNT', 'SBC'].includes(d.caste) && !['above8L'].includes(d.income) && ['UG', 'Diploma'].includes(d.level),
        docs: [
            { icon: '🪪', text: 'Aadhaar Card' },
            { icon: '📋', text: 'OBC / VJNT / SBC Caste Certificate' },
            { icon: '💰', text: 'Non-Creamy Layer Certificate (NCL) — current year' },
            { icon: '💰', text: 'Income Certificate (below ₹8L)' },
            { icon: '📑', text: 'Bonafide Certificate' },
            { icon: '📝', text: 'Previous year marksheet' },
            { icon: '🏦', text: 'DBT-enabled bank account passbook' },
        ]
    },
    {
        id: 'docs-4',
        name: 'EBC Scholarship for Open Category Students',
        dept: '🏛️ Higher & Technical Education Dept. · MahaDBT Scheme',
        benefit: 'Up to ₹48,000/year',
        type: 'near-miss',
        nearMissNote: '⚠️ <strong>Almost eligible:</strong> This scheme requires income <strong>below ₹8L per year</strong>. Your selected income bracket is close to the threshold — verify your income certificate amount before applying.',
        eligibleIf: d => d.domicile === 'mh' && d.caste === 'Open' && d.income !== 'above8L' && ['UG', 'PG', 'Diploma'].includes(d.level),
        docs: [
            { icon: '🪪', text: 'Aadhaar Card' },
            { icon: '📋', text: 'Open Category / General Certificate (if applicable)' },
            { icon: '💰', text: 'EBC Income Certificate (below ₹8L) — district authority' },
            { icon: '📑', text: 'Admission letter / bonafide from college' },
            { icon: '📝', text: '10th & 12th marksheets' },
            { icon: '🏦', text: 'Bank account passbook (DBT-enabled, Aadhaar-linked)' },
            { icon: '📸', text: 'Passport-size photograph' },
        ]
    }
];

const FALLBACK_SCHEMES = [
    {
        id: 'docs-fb1',
        name: 'Swadhar Gruh Scheme (SC Students)',
        dept: '🏛️ Social Justice & Special Assistance Dept. · MahaDBT Scheme',
        benefit: 'Up to ₹51,000/year',
        type: 'eligible',
        docs: [
            { icon: '🪪', text: 'Aadhaar Card' },
            { icon: '📋', text: 'SC Caste Certificate' },
            { icon: '💰', text: 'Income Certificate (below ₹2.5L)' },
            { icon: '📑', text: 'Bonafide Certificate' },
            { icon: '🏦', text: 'DBT-enabled Bank Account passbook' },
        ]
    },
    {
        id: 'docs-fb2',
        name: 'Minority Scholarship – Pre-Matric & Post-Matric',
        dept: '🏛️ Minority Development Dept. · MahaDBT Scheme',
        benefit: 'Up to ₹10,000/year',
        type: 'eligible',
        docs: [
            { icon: '🪪', text: 'Aadhaar Card' },
            { icon: '📋', text: 'Community / Religion Certificate' },
            { icon: '💰', text: 'Income Certificate (below ₹2L)' },
            { icon: '📑', text: 'School / College Certificate' },
            { icon: '🏦', text: 'Bank Account details (DBT-enabled)' },
        ]
    },
    {
        id: 'docs-fb3',
        name: 'NMMS – National Means-cum-Merit Scholarship',
        dept: '🏛️ Ministry of Education, Govt. of India · Central Scheme',
        benefit: '₹1,000/month',
        type: 'eligible',
        docs: [
            { icon: '🪪', text: 'Aadhaar Card' },
            { icon: '💰', text: 'Income Certificate (below ₹3.5L)' },
            { icon: '📝', text: '8th / 9th marksheet' },
            { icon: '📑', text: 'School bonafide certificate' },
            { icon: '🏦', text: 'Bank account passbook (DBT-enabled)' },
        ]
    }
];

// Registry for docs modal
const docsRegistry = {};
SCHEMES.forEach(s => { docsRegistry[s.id] = s; });
FALLBACK_SCHEMES.forEach(s => { docsRegistry[s.id] = s; });

function runEligibilityCheck(e) {
    e.preventDefault();
    const d = {
        domicile: document.getElementById('elig-domicile').value,
        caste: document.getElementById('elig-caste').value,
        religion: document.getElementById('elig-religion').value,
        income: document.getElementById('elig-income').value,
        ration: document.getElementById('elig-ration').value,
        disability: document.getElementById('elig-disability').value,
        level: document.getElementById('elig-level').value,
        type: document.getElementById('elig-type').value,
        admission: document.getElementById('elig-admission').value,
        year: document.getElementById('elig-year').value,
        percent: document.getElementById('elig-percent').value,
        gap: document.getElementById('elig-gap').value,
        applicant: document.getElementById('elig-applicant').value,
    };

    if (!d.domicile || !d.caste || !d.income || !d.level) {
        const miss = [];
        if (!d.domicile) miss.push('Domicile');
        if (!d.caste) miss.push('Caste Category');
        if (!d.income) miss.push('Annual Family Income');
        if (!d.level) miss.push('Course Level');
        const btn = document.getElementById('elig-submit-btn');
        btn.style.animation = 'none';
        btn.offsetHeight; // reflow
        btn.style.animation = 'shake .4s ease';
        showEligToast('Please fill in: ' + miss.join(', '));
        return;
    }

    let matched = SCHEMES.filter(s => s.eligibleIf && s.eligibleIf(d));
    if (matched.length === 0) matched = FALLBACK_SCHEMES.slice(0, 3);

    const eligible = matched.filter(s => s.type === 'eligible');
    const nearMiss = matched.filter(s => s.type === 'near-miss');

    let displayEligible = [...eligible];
    if (displayEligible.length < 3) {
        FALLBACK_SCHEMES.forEach(fb => {
            if (displayEligible.length < 3 && !displayEligible.find(x => x.id === fb.id)) {
                displayEligible.push(fb);
            }
        });
    }
    const displayNearMiss = nearMiss.length > 0 ? nearMiss[0] : SCHEMES.find(s => s.type === 'near-miss');

    document.getElementById('elig-results-count').innerHTML =
        `<span>${displayEligible.length}</span> scholarship${displayEligible.length !== 1 ? 's' : ''} match your profile`;

    const cardIds = ['rc1', 'rc2', 'rc3'];
    displayEligible.slice(0, 3).forEach((scheme, i) => {
        const prefix = cardIds[i];
        document.getElementById(prefix + '-name').textContent = scheme.name;
        document.getElementById(prefix + '-dept').innerHTML = scheme.dept;
        document.getElementById(prefix + '-benefit').textContent = scheme.benefit;
        document.getElementById(prefix + '-docs-btn').dataset.openDocs = scheme.id;
    });

    if (displayNearMiss) {
        document.getElementById('rc4-name').textContent = displayNearMiss.name;
        document.getElementById('rc4-dept').innerHTML = displayNearMiss.dept;
        document.getElementById('rc4-benefit').textContent = displayNearMiss.benefit;
        document.getElementById('rc4-note').innerHTML = displayNearMiss.nearMissNote || '⚠️ <strong>Check manually:</strong> One or more criteria for this scheme might not be met. Verify on the MahaDBT portal.';
        document.getElementById('rc4-docs-btn').dataset.openDocs = displayNearMiss.id;
    }

    document.getElementById('elig-form-card').style.display = 'none';
    const resultsEl = document.getElementById('elig-results');
    resultsEl.classList.add('visible');
    setTimeout(() => resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function resetEligibility() {
    document.getElementById('elig-form').reset();
    document.getElementById('elig-results').classList.remove('visible');
    document.getElementById('elig-form-card').style.display = '';
    window.scrollTo({ top: document.getElementById('panel-eligibility').offsetTop - 120, behavior: 'smooth' });
}

function openDocsModal(schemeId) {
    const scheme = docsRegistry[schemeId];
    if (!scheme) return;
    document.getElementById('docs-modal-title').textContent = scheme.name;
    const list = document.getElementById('docs-modal-list');
    list.innerHTML = scheme.docs.map(d => `<li><span class="doc-icon">${d.icon}</span>${d.text}</li>`).join('');
    openModal('modal-docs');
}

// Wire eligibility form & buttons
document.addEventListener('DOMContentLoaded', function () {
    const eligForm = document.getElementById('elig-form');
    if (eligForm) eligForm.addEventListener('submit', runEligibilityCheck);

    const resetBtn = document.querySelector('.elig-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetEligibility);

    // Wire docs buttons via delegation
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-open-docs]');
        if (btn) openDocsModal(btn.dataset.openDocs);
    });
});
