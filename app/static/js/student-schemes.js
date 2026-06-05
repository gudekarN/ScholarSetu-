// ─────────────────────────────────────────
// student-schemes.js — Apply Guide (Tab 5) schemes & document modal
// ─────────────────────────────────────────

// SCHEME_DOCS is built dynamically from scholarships.json after fetch
let SCHEME_DOCS = {};

// Currently open guide item index
let _sdmOpenGuide = null;
let _currentSchemeKey = null;

// ── Category mapping from JSON field → data-cats tokens ──────────
function buildDataCats(scheme) {
    const cats = [];
    const cat = (scheme.category || '').toLowerCase();
    const courseTypes = (scheme.eligibility && scheme.eligibility.course_types) || [];

    // Primary caste/category pill
    if (cat.includes('sc') || cat.includes('neo-buddhist')) cats.push('sc');
    if (cat.includes('st')) cats.push('st');
    if (cat.includes('obc')) cats.push('obc');
    if (cat.includes('vjnt') || cat.includes('sbc')) cats.push('vjnt');
    if (cat.includes('open') || cat.includes('ews')) {
        cats.push('ews');
        cats.push('open');
    }
    if (cat.includes('minority')) cats.push('minority');

    // Course type pills
    const courseTypesLower = courseTypes.map(t => t.toLowerCase());
    if (courseTypesLower.some(t => t.includes('technical') || t.includes('professional'))) {
        cats.push('technical');
    }
    if (courseTypesLower.some(t => t.includes('non-professional') || t.includes('non professional'))) {
        cats.push('nontechnical');
    }

    return [...new Set(cats)].join(' ');
}

// ── Income limit display ───────────────────────────────────────────
function incomeLabel(scheme) {
    const ic = scheme.eligibility && scheme.eligibility.income_criteria;
    if (!ic || ic.max === null) return null;
    const lakh = ic.max / 100000;
    const display = Number.isInteger(lakh) ? `₹${lakh}L` : `₹${lakh}L`;
    return `Income limit ${display}`;
}

// ── Department badge helper ───────────────────────────────────────
function getDeptBadge(department) {
    const d = department || '';
    if (d.includes('Social Justice')) return { cls: 'dept-sj', label: 'Social Justice' };
    if (d.includes('Tribal')) return { cls: 'dept-td', label: 'Tribal Dev.' };
    if (d.includes('OBC') || d.includes('Backward') || d.includes('Nomadic'))
        return { cls: 'dept-obc', label: 'OBC Welfare' };
    if (d.includes('Higher') || d.includes('Technical Education'))
        return { cls: 'dept-hte', label: 'Higher & Tech. Ed.' };
    if (d.includes('Minority')) return { cls: 'dept-hte', label: 'Minority Dev.' };
    // Fallback: first 3 words
    const short = d.split(' ').slice(0, 3).join(' ');
    return { cls: 'dept-sj', label: short };
}

// ── Card HTML builder ──────────────────────────────────────────────
function buildCardHTML(scheme) {
    const key = `sc${scheme.scheme_id}`;
    const dataCats = buildDataCats(scheme);
    const dataName = scheme.name.toLowerCase();
    const badge = getDeptBadge(scheme.department);
    const income = incomeLabel(scheme);
    const levels = (scheme.eligibility && scheme.eligibility.course_levels) || [];

    // Income pill
    const incomePill = income
        ? `<span class="cat-pill cat-neutral">${income}</span>`
        : '';

    // Course levels pill (shorten long lists)
    let levelPill = '';
    if (levels.length > 0 && levels.length <= 4) {
        levelPill = `<span class="cat-pill cat-neutral">${levels.join(' / ')}</span>`;
    } else if (levels.length > 4) {
        levelPill = `<span class="cat-pill cat-neutral">${levels.slice(0, 3).join(' / ')} …</span>`;
    }

    // Category label pill (first readable one)
    const catLabel = scheme.category_label || scheme.category || '';
    const catPill = catLabel ? `<span class="cat-pill">${catLabel}</span>` : '';

    return `
        <article class="scheme-card" id="sc-${scheme.scheme_id}" role="listitem"
            data-name="${dataName}" data-cats="${dataCats}">
            <div class="scheme-card-header">
                <h3 class="scheme-name">${scheme.name}</h3>
                <span class="dept-badge ${badge.cls}">${badge.label}</span>
            </div>
            <div class="scheme-cats">
                ${catPill}
                ${incomePill}
                ${levelPill}
            </div>
            <div class="scheme-actions">
                <button class="btn-ghost-sm" data-open-scheme-docs="${key}">
                    📄 Required Documents
                </button>
                <a href="${scheme.official_link || 'https://mahadbt.maharashtra.gov.in'}"
                    target="_blank" rel="noopener" class="btn-saffron-sm">
                    Apply on MahaDBT ↗
                </a>
            </div>
        </article>`;
}

// ── Build SCHEME_DOCS entry from JSON scheme ───────────────────────
function buildSchemeDocsEntry(scheme) {
    const docs = (scheme.documents_required || []).map(d => ({
        name: d,
        checked: true,
        guide: {
            title: 'How to obtain: ' + d,
            icon: '📄',
            label: d,
            steps: [
                'Visit the relevant government office or portal.',
                'Submit required supporting documents.',
                'Collect the certificate within the stipulated time.'
            ]
        }
    }));
    return { name: scheme.name, docs };
}

function openSchemeDocModal(schemeKey) {
    _currentSchemeKey = schemeKey;
    console.log('key:', schemeKey, 'found:', !!SCHEME_DOCS[schemeKey]);
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

    // ── Fetch scholarships.json and render cards ──────────────────
    const grid = document.getElementById('scheme-grid');
    const noResults = document.getElementById('scheme-no-results');

    fetch('/static/data/scholarships.json')
        .then(res => res.json())
        .then(schemes => {
            // Build SCHEME_DOCS map
            SCHEME_DOCS = {};
            schemes.forEach(scheme => {
                const key = `sc${scheme.scheme_id}`;
                SCHEME_DOCS[key] = buildSchemeDocsEntry(scheme);
            });

            // Render cards (insert before the no-results div)
            const fragment = document.createDocumentFragment();
            schemes.forEach(scheme => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = buildCardHTML(scheme).trim();
                fragment.appendChild(wrapper.firstElementChild);
            });
            grid.insertBefore(fragment, noResults);

            // Run initial filter (keeps "All" pill correct on load)
            filterSchemes();

            // ── Event delegation for "Required Documents" buttons ──
            grid.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-open-scheme-docs]');
                if (btn) {
                    openSchemeDocModal(btn.dataset.openSchemeDocs);
                }
            });
        })
        .catch(err => {
            console.error('Failed to load scholarships.json:', err);
            if (noResults) {
                noResults.textContent = '⚠️ Could not load scheme data. Please refresh the page.';
                noResults.style.display = 'block';
            }
        });
});
