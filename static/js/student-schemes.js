// ─────────────────────────────────────────
// student-schemes.js — Apply Guide (Tab 5) schemes & document modal
// ─────────────────────────────────────────

// ── Per-scheme document + guide data ──────────────────────────
const SCHEME_DOCS = {
    sc1: {
        name: 'Rajarshi Chhatrapati Shahu Maharaj Scholarship',
        docs: [
            {
                name: 'Aadhaar Card',
                checked: true,
                guide: {
                    title: 'How to obtain your Aadhaar Card',
                    icon: '🪪',
                    label: 'Infographic: How to get Aadhaar Card',
                    steps: [
                        'Visit your nearest Aadhaar Enrolment Centre (locate via uidai.gov.in) with proof of identity and address.',
                        'Fill the enrolment form and biometric scan. Collect the acknowledgement slip with Enrolment ID.',
                        'Download your e-Aadhaar PDF from uidai.gov.in using the Enrolment ID within 90 days.'
                    ]
                }
            },
            {
                name: 'SC Caste Certificate',
                checked: true,
                guide: {
                    title: 'How to obtain your SC Caste Certificate',
                    icon: '📋',
                    label: 'Infographic: Get Caste Certificate',
                    steps: [
                        'Apply at your Tehsildar / Sub-Divisional Officer office or via MahaOnline portal (mahaonline.gov.in).',
                        'Submit Aadhaar, address proof, school leaving certificate, and affidavit from your family.',
                        'Certificate is issued within 15 working days. Verify validity each year for fresh applications.'
                    ]
                }
            },
            {
                name: 'Income Certificate (below ₹2.5L)',
                checked: true,
                guide: {
                    title: 'How to obtain an Income Certificate',
                    icon: '💰',
                    label: 'Infographic: Income Certificate Process',
                    steps: [
                        'Apply at the Tehsildar office or MahaOnline. Submit Aadhaar, bank statements, and Form 16 (if salaried parent).',
                        'Certificate is issued after field verification by a Revenue officer.',
                        'Income certificate must be of the current financial year.'
                    ]
                }
            },
            {
                name: 'Bonafide Certificate',
                checked: false,
                guide: {
                    title: 'How to obtain a Bonafide Certificate',
                    icon: '📑',
                    label: 'Infographic: College Bonafide',
                    steps: [
                        "Apply via your college's scholarship / student section with your PRN and fee receipt.",
                        "The college issues it with a seal and principal's signature — usually within 2–3 working days.",
                        'It must include your name, PRN, course, year, and academic year.'
                    ]
                }
            },
            {
                name: 'Previous Year Marksheet',
                checked: true,
                guide: {
                    title: 'How to obtain your Marksheet',
                    icon: '📝',
                    label: 'Infographic: Getting Marksheet',
                    steps: [
                        'Collect the original from your college examination section after results are declared.',
                        'If lost, apply for a duplicate from the university with prescribed fee and affidavit.',
                        'For first-year students, submit HSC (12th) marksheet as the previous qualifying exam.'
                    ]
                }
            },
            {
                name: 'DBT-enabled Bank Account Passbook',
                checked: false,
                guide: {
                    title: 'How to enable DBT on your bank account',
                    icon: '🏦',
                    label: 'Infographic: Enable DBT on Bank Account',
                    steps: [
                        'Visit your bank branch with your Aadhaar card and request Aadhaar-account seeding (DBT activation).',
                        'Verify seeding status on NPCI mapper at npci.org.in/npci/bankseeding.html.',
                        'Check the passbook or bank statement after 2–3 days to confirm DBT-enabled status.'
                    ]
                }
            },
            {
                name: 'Domicile Certificate',
                checked: false,
                guide: {
                    title: 'How to obtain a Domicile Certificate',
                    icon: '🗺️',
                    label: 'Infographic: Domicile Certificate',
                    steps: [
                        "Apply via MahaOnline or Tehsildar office. Submit Aadhaar, school certificate, and proof of 15-year residency in Maharashtra.",
                        "Submit parent's Domicile Certificate if you are below 18 years.",
                        'The certificate is issued usually within 15 days of verification.'
                    ]
                }
            }
        ]
    },
    sc2: {
        name: 'Post-Matric Scholarship for SC Students',
        docs: [
            { name: 'Aadhaar Card', checked: true, guide: { title: 'How to obtain your Aadhaar Card', icon: '🪪', label: 'Infographic: Aadhaar Card', steps: ['Visit uidai.gov.in to locate nearest enrolment centre.', 'Provide biometric and document proof for enrolment.', 'Download e-Aadhaar from uidai.gov.in after enrolment.'] } },
            { name: 'SC Caste Certificate', checked: true, guide: { title: 'How to get SC Caste Certificate', icon: '📋', label: 'Infographic: Caste Certificate', steps: ['Apply at Tehsildar or via MahaOnline.', 'Submit Aadhaar, address proof and school certificate.', 'Certificate issued within 15 working days.'] } },
            { name: 'Income Certificate (current year)', checked: false, guide: { title: 'How to get an Income Certificate', icon: '💰', label: 'Infographic: Income Certificate', steps: ['Apply at Tehsildar office or via MahaOnline.', 'Submit income proofs — salary slips or Form 16.', 'Current-year certificate mandatory each application cycle.'] } },
            { name: 'Bonafide Certificate', checked: false, guide: { title: 'Bonafide Certificate from College', icon: '📑', label: 'Infographic: Bonafide Certificate', steps: ['Request from college student section with PRN.', 'Must include course, year, and academic session.', 'Collect within 2–3 working days after request.'] } },
            { name: 'SSC (10th) Marksheet', checked: true, guide: { title: 'How to get SSC Marksheet', icon: '📝', label: 'Infographic: SSC Marksheet', steps: ['Collect original at your secondary school.', 'For duplicates, apply at Maharashtra State Board (MSBSHSE).', 'Provide board registration number and affidavit.'] } },
            { name: 'Previous Year Marksheet', checked: true, guide: { title: 'Previous Year Marksheet', icon: '📝', label: 'Infographic: Marksheet', steps: ['Collect from college examination section.', 'First-year students submit HSC (12th) marksheet.', 'Duplicate available from university with fee.'] } },
            { name: 'DBT-enabled Bank Account Passbook', checked: false, guide: { title: 'Enable DBT on Bank Account', icon: '🏦', label: 'Infographic: DBT Activation', steps: ['Visit bank branch with Aadhaar for seeding.', 'Check NPCI mapper status at npci.org.in.', 'Confirm DBT status in passbook after 2–3 days.'] } },
            { name: 'Passport-size Photograph', checked: true, guide: { title: 'Passport-size Photograph', icon: '📸', label: 'Infographic: Photo Requirements', steps: ['Use a recent (within 3 months) white background photo.', 'Size: 35mm × 45mm, colour preferred.', 'Upload as JPEG/PNG (max 200KB) on MahaDBT portal.'] } }
        ]
    },
    sc3: {
        name: 'Vijay Raje Scholarship for ST Students',
        docs: [
            { name: 'Aadhaar Card', checked: true, guide: { title: 'How to obtain Aadhaar Card', icon: '🪪', label: 'Infographic: Aadhaar', steps: ['Visit uidai.gov.in enrolment centre.', 'Biometric + document submission.', 'Download e-Aadhaar within 90 days.'] } },
            { name: 'ST Tribe Certificate', checked: true, guide: { title: 'How to get ST Tribe Certificate', icon: '📋', label: 'Infographic: Tribe Certificate', steps: ['Apply at Tribal Development Office or MahaOnline.', 'Submit Aadhaar, address proof, and family documents.', 'Issued within 30 working days after scrutiny.'] } },
            { name: 'Tribe Validity Certificate', checked: false, guide: { title: 'Tribe Validity Certificate', icon: '✅', label: 'Infographic: Validity Certificate', steps: ['Apply at District Caste Certificate Scrutiny Committee.', 'Submit original tribe certificate + supporting documents.', 'Hearing and issuance may take 3–6 months.'] } },
            { name: 'Income Certificate (below ₹2.5L)', checked: true, guide: { title: 'Income Certificate', icon: '💰', label: 'Infographic: Income Certificate', steps: ['Apply at Tehsildar or MahaOnline.', 'Submit salary slips or Form 16.', 'Must be current-year certificate.'] } },
            { name: 'Bonafide Certificate', checked: false, guide: { title: 'Bonafide from College', icon: '📑', label: 'Infographic: Bonafide', steps: ['Request at college scholarship cell.', 'Issued in 2–3 days.', 'Must have college seal and signature.'] } },
            { name: 'Previous Year Marksheet', checked: true, guide: { title: 'Marksheet', icon: '📝', label: 'Infographic: Marksheet', steps: ['Collect from examination section.', 'Duplicate from university if lost.', 'First-years: submit HSC marksheet.'] } },
            { name: 'DBT-enabled Bank Passbook', checked: false, guide: { title: 'DBT Bank Account', icon: '🏦', label: 'Infographic: DBT', steps: ['Seed Aadhaar to bank account.', 'Verify on NPCI mapper.', 'Confirm in passbook.'] } }
        ]
    },
    sc4: {
        name: 'OBC Non-Creamy Layer Post-Matric Scholarship',
        docs: [
            { name: 'Aadhaar Card', checked: true, guide: { title: 'Aadhaar Card', icon: '🪪', label: 'Infographic: Aadhaar', steps: ['Visit UIDAI enrolment centre.', 'Submit biometric and documents.', 'Download e-Aadhaar from uidai.gov.in.'] } },
            { name: 'OBC Caste Certificate', checked: true, guide: { title: 'OBC Caste Certificate', icon: '📋', label: 'Infographic: OBC Certificate', steps: ['Apply via MahaOnline or Tehsildar.', 'Submit Aadhaar, address proof, school certificate.', 'Issued within 15 working days.'] } },
            { name: 'Non-Creamy Layer Certificate (current year)', checked: false, guide: { title: 'Non-Creamy Layer Certificate', icon: '💰', label: 'Infographic: NCL Certificate', steps: ['Apply at Tehsildar office with income proof.', 'Family income must be below ₹8L per year.', 'Annual certificate — renew every year.'] } },
            { name: 'Income Certificate', checked: true, guide: { title: 'Income Certificate', icon: '💰', label: 'Infographic: Income', steps: ['Apply at Tehsildar or MahaOnline.', 'Submit salary slips, Form 16 or affidavit.', 'Must be for current financial year.'] } },
            { name: 'Bonafide Certificate', checked: false, guide: { title: 'Bonafide from College', icon: '📑', label: 'Infographic: Bonafide', steps: ['Request at college scholarship section.', 'Mention PRN, course, year, and session.', 'Issued within 2–3 days.'] } },
            { name: 'Previous Year Marksheet', checked: true, guide: { title: 'Marksheet', icon: '📝', label: 'Infographic: Marksheet', steps: ['From examination section.', 'University duplicate if lost.', 'HSC for first-year students.'] } },
            { name: 'DBT-enabled Bank Passbook', checked: false, guide: { title: 'DBT Bank Account', icon: '🏦', label: 'Infographic: DBT Account', steps: ['Seed Aadhaar to bank.', 'Check NPCI mapper status.', 'Confirm in passbook after 2–3 days.'] } }
        ]
    },
    sc5: {
        name: 'EBC Freeship — Open Category',
        docs: [
            { name: 'Aadhaar Card', checked: true, guide: { title: 'Aadhaar Card', icon: '🪪', label: 'Infographic: Aadhaar', steps: ['Visit uidai.gov.in enrolment centre.', 'Biometric and document submission.', 'Download e-Aadhaar after enrolment.'] } },
            { name: 'EBC Income Certificate (below ₹8L)', checked: false, guide: { title: 'EBC Income Certificate', icon: '💰', label: 'Infographic: EBC Income Certificate', steps: ['Apply at District Collector / Tehsildar office.', 'Submit salary proof — Form 16, pay slips, and IT returns.', 'Certificate must explicitly state "Economically Backward Class" category.'] } },
            { name: 'Admission Letter / Bonafide', checked: true, guide: { title: 'Admission Letter or Bonafide', icon: '📑', label: 'Infographic: Admission Letter', steps: ['Obtain from college scholarship / admission section.', 'Should mention course, year, and academic session.', 'Issued within 2–3 working days upon request.'] } },
            { name: '10th (SSC) Marksheet', checked: true, guide: { title: 'SSC Marksheet', icon: '📝', label: 'Infographic: SSC Marksheet', steps: ['Collect from secondary school.', 'Duplicate from MSBSHSE if lost.', 'Submit self-attested photocopy on portal.'] } },
            { name: '12th (HSC) Marksheet', checked: true, guide: { title: 'HSC Marksheet', icon: '📝', label: 'Infographic: HSC Marksheet', steps: ['Collect from junior college.', 'Duplicate from MSBSHSE if lost.', 'Self-attest before uploading.'] } },
            { name: 'Domicile Certificate', checked: false, guide: { title: 'Domicile Certificate', icon: '🗺️', label: 'Infographic: Domicile', steps: ['Apply at Tehsildar or MahaOnline.', 'Submit 15-year Maharashtra residency proof.', 'Issued within 15 working days.'] } },
            { name: 'DBT-enabled Bank Account Passbook', checked: false, guide: { title: 'Enable DBT on Bank Account', icon: '🏦', label: 'Infographic: DBT Activation', steps: ['Visit bank with Aadhaar for seeding.', 'Check NPCI mapper.', 'Confirm DBT-enabled status.'] } }
        ]
    },
    sc6: {
        name: 'VJNT & Special Backward Class Scholarship',
        docs: [
            { name: 'Aadhaar Card', checked: true, guide: { title: 'Aadhaar Card', icon: '🪪', label: 'Infographic: Aadhaar', steps: ['Visit UIDAI enrolment centre.', 'Biometric + document submission.', 'Download e-Aadhaar from uidai.gov.in.'] } },
            { name: 'VJNT / SBC Caste Certificate', checked: true, guide: { title: 'VJNT / SBC Caste Certificate', icon: '📋', label: 'Infographic: VJNT Certificate', steps: ['Apply at Tehsildar or MahaOnline.', 'Submit Aadhaar, address proof, and family certificate.', 'Issued within 15 working days.'] } },
            { name: 'Income Certificate (below ₹1L)', checked: false, guide: { title: 'Income Certificate', icon: '💰', label: 'Infographic: Income Certificate', steps: ['Apply at Tehsildar office.', 'Submit salary slips or sworn affidavit.', 'Must be current-year certificate.'] } },
            { name: 'Caste Validity Certificate', checked: false, guide: { title: 'Caste Validity Certificate', icon: '✅', label: 'Infographic: Validity Certificate', steps: ['Apply at District Caste Scrutiny Committee.', 'Submit original caste certificate and family documents.', 'Process takes 3–6 months — apply early.'] } },
            { name: 'Bonafide Certificate', checked: true, guide: { title: 'Bonafide from College', icon: '📑', label: 'Infographic: Bonafide', steps: ['Request at college scholarship section.', 'Includes PRN, course, year, academic session.', 'Issued within 2–3 days.'] } },
            { name: 'Previous Year Marksheet', checked: true, guide: { title: 'Marksheet', icon: '📝', label: 'Infographic: Marksheet', steps: ['From examination section.', 'University duplicate if lost.', 'HSC for first-year students.'] } },
            { name: 'DBT-enabled Bank Passbook', checked: false, guide: { title: 'DBT Bank Account', icon: '🏦', label: 'Infographic: DBT', steps: ['Seed Aadhaar to bank account.', 'Verify on NPCI mapper.', 'Confirm in passbook.'] } },
            { name: 'Passport-size Photograph', checked: true, guide: { title: 'Photograph Requirements', icon: '📸', label: 'Infographic: Photo', steps: ['White background, recent (within 3 months).', 'Size: 35mm × 45mm.', 'Upload as JPEG/PNG (max 200KB).'] } }
        ]
    }
};

// Currently open guide item index
let _sdmOpenGuide = null;
let _currentSchemeKey = null;

function openSchemeDocModal(schemeKey) {
    _currentSchemeKey = schemeKey;
    _sdmOpenGuide = null;
    const data = SCHEME_DOCS[schemeKey];
    if (!data) return;

    // Set heading
    document.getElementById('sdm-scheme-title').textContent = data.name;

    // Build checklist
    const list = document.getElementById('sdm-checklist');
    list.innerHTML = data.docs.map((doc, idx) => {
        const checkHtml = doc.checked
            ? `<div class="sdm-check checked"><svg viewBox="0 0 12 10" fill="none"><polyline points="1 5 4.5 8.5 11 1" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
            : `<div class="sdm-check"></div>`;
        return `
          <li class="sdm-item" id="sdm-item-${idx}" data-guide-idx="${idx}" role="button" tabindex="0" aria-expanded="false">
            ${checkHtml}
            <span class="sdm-doc-name">${doc.name}</span>
            <span class="sdm-arrow">▶</span>
          </li>
          <li class="doc-guide-card" id="sdm-guide-${idx}" aria-hidden="true">
            <div class="doc-guide-img-placeholder">
              <div class="placeholder-icon">${doc.guide.icon}</div>
              <div class="placeholder-lbl">${doc.guide.label}</div>
              <div style="font-size:11px; color:var(--text-light); margin-top:2px;">PDF infographic will appear here</div>
            </div>
            <div class="doc-guide-title">${doc.guide.title}</div>
            <ol class="doc-guide-steps">
              ${doc.guide.steps.map((s, i) => `<li><span class="step-num">${i + 1}</span><span>${s}</span></li>`).join('')}
            </ol>
            <button class="btn-pdf-ghost" data-pdf-guide="${idx}">
              ⬇ Download PDF Guide
            </button>
          </li>`;
    }).join('');

    // Wire guide item clicks
    list.querySelectorAll('.sdm-item[data-guide-idx]').forEach(item => {
        item.addEventListener('click', function () {
            toggleDocGuide(parseInt(this.dataset.guideIdx));
        });
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') toggleDocGuide(parseInt(this.dataset.guideIdx));
        });
    });

    // Wire PDF buttons
    list.querySelectorAll('[data-pdf-guide]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            alert('PDF Guide coming soon! This feature will link to downloadable infographics.');
        });
    });

    openModal('modal-scheme-docs');
}

function toggleDocGuide(idx) {
    const data = SCHEME_DOCS[_currentSchemeKey];
    if (!data) return;

    // Close previously open guide
    if (_sdmOpenGuide !== null && _sdmOpenGuide !== idx) {
        document.getElementById('sdm-guide-' + _sdmOpenGuide).classList.remove('visible');
        document.getElementById('sdm-item-' + _sdmOpenGuide).classList.remove('active-guide');
        document.getElementById('sdm-item-' + _sdmOpenGuide).setAttribute('aria-expanded', 'false');
    }

    const guideEl = document.getElementById('sdm-guide-' + idx);
    const itemEl = document.getElementById('sdm-item-' + idx);
    const isOpen = guideEl.classList.contains('visible');

    if (isOpen) {
        guideEl.classList.remove('visible');
        itemEl.classList.remove('active-guide');
        itemEl.setAttribute('aria-expanded', 'false');
        _sdmOpenGuide = null;
    } else {
        guideEl.classList.add('visible');
        itemEl.classList.add('active-guide');
        itemEl.setAttribute('aria-expanded', 'true');
        _sdmOpenGuide = idx;
        // Scroll guide into view inside the modal
        setTimeout(() => guideEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
    }
}

// ── Filter pills ───────────────────────────────────────────────
let _activePill = 'all';

function setPill(cat) {
    _activePill = cat;
    document.querySelectorAll('.filter-pill').forEach(btn => {
        const isActive = btn.id === 'pill-' + cat;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
    filterSchemes();
}

function filterSchemes() {
    const query = (document.getElementById('scheme-search-input') ?
        document.getElementById('scheme-search-input').value : '').toLowerCase().trim();
    const cards = document.querySelectorAll('.scheme-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const cats = (card.dataset.cats || '').toLowerCase();

        const matchesPill = _activePill === 'all' || cats.includes(_activePill);
        const matchesQuery = !query || name.includes(query) || cats.includes(query);

        const visible = matchesPill && matchesQuery;
        card.dataset.hidden = visible ? 'false' : 'true';
        if (visible) visibleCount++;
    });

    const noResults = document.getElementById('scheme-no-results');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

// ── Wire filter pills and scheme search on DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', function () {
    // Filter pills
    document.querySelectorAll('.filter-pill[data-pill]').forEach(btn => {
        btn.addEventListener('click', function () {
            setPill(this.dataset.pill);
        });
    });

    // Scheme search input
    const schemeSearch = document.getElementById('scheme-search-input');
    if (schemeSearch) {
        schemeSearch.addEventListener('input', filterSchemes);
        schemeSearch.addEventListener('keyup', filterSchemes);
    }

    // Scheme doc modal buttons via data attribute
    document.querySelectorAll('[data-open-scheme-docs]').forEach(btn => {
        btn.addEventListener('click', function () {
            openSchemeDocModal(this.dataset.openSchemeDocs);
        });
    });
});
