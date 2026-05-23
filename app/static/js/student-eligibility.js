// ─────────────────────────────────────────
// student-eligibility.js — Eligibility Checker (Phase 11 frontend)
// ─────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// ── TASK 1 — Collect form fields & POST ───────────────────────────────────────

async function runEligibilityCheck(e) {
    e.preventDefault();

    // Map existing HTML field IDs to backend keys
    const disabilityRaw = val('elig-disability');          // "none" | "40plus" | ""
    const incomeRaw = val('elig-income');
    const yearRaw = val('elig-year');
    const percentRaw = val('elig-percent');
    const gapRaw = val('elig-gap');

    // Convert disability to boolean
    const disabilityBool = (disabilityRaw === 'true' || disabilityRaw === '40plus');

    // Convert income bracket string to a representative integer (midpoint / threshold)
    const incomeMap = {
        'below1L': 50000,
        '1to2.5L': 175000,
        '2.5to6L': 400000,
        '6to8L': 700000,
        'above8L': 900000,
    };
    const incomeInt = incomeMap[incomeRaw] ?? 0;

    // Convert percentage bracket to float
    const percentMap = {
        'below50': 45,
        '50to60': 55,
        '60to75': 67,
        '75to85': 80,
        'above85': 90,
    };
    const percentFloat = percentMap[percentRaw] ?? 0;

    // Convert gap years string to int
    const gapMap = { 'none': 0, '1': 1, '2plus': 2 };
    const gapInt = gapMap[gapRaw] ?? 0;

    const payload = {
        domicile: val('elig-domicile') === 'mh' ? 'Maharashtra' : 'Outside Maharashtra',
        caste: val('elig-caste'),
        religion: val('elig-religion'),
        income: incomeInt,
        course_level: val('elig-level'),        // existing ID: elig-level
        course_type: val('elig-type'),         // existing ID: elig-type
        admission_type: val('elig-admission'),    // existing ID: elig-admission
        year: parseInt(yearRaw, 10) || 1,
        percentage: percentFloat,
        gap_years: gapInt,
        applicant_type: val('elig-applicant') === 'DayScholar' ? 'Day Scholar' : val('elig-applicant'),    // existing ID: elig-applicant
        disability: disabilityBool,
        disability_percentage: disabilityBool ? 40 : 0,
        gender: val('elig-gender'),
        employment_status: val('elig-employment'),
    };

    // Basic required-field guard
    if (!payload.caste || !payload.income || !payload.course_level) {
        const miss = [];
        if (!payload.caste) miss.push('Caste Category');
        if (!payload.income) miss.push('Annual Family Income');
        if (!payload.course_level) miss.push('Course Level');
        const btn = document.getElementById('elig-submit-btn');
        if (btn) {
            btn.style.animation = 'none';
            btn.offsetHeight;
            btn.style.animation = 'shake .4s ease';
        }
        showEligToast('Please fill in: ' + miss.join(', '));
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('elig-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking…';
    }

    try {
        const resp = await fetch('/student/check_eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!resp.ok) { renderError(); return; }
        const data = await resp.json();
        renderResults(data);
    } catch (err) {
        renderError();
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Check My Eligibility →`;
        }
    }
}

// ── TASK 2-4 — Render results ──────────────────────────────────────────────────

function renderResults(data) {
    const stack = document.getElementById('elig-cards-stack');
    const countEl = document.getElementById('elig-results-count');
    const resultsEl = document.getElementById('elig-results');

    if (!data || !data.success) {
        renderError();
        return;
    }

    const schemes = data.eligible_schemes || [];

    // Update count heading
    if (countEl) {
        countEl.innerHTML = `<span>${schemes.length}</span> scholarship${schemes.length !== 1 ? 's' : ''} match your profile`;
    }

    // Clear existing static cards
    if (stack) stack.innerHTML = '';

    // TASK 4 — Empty state
    if (schemes.length === 0) {
        if (stack) {
            stack.innerHTML = `<div class="elig-empty-state" style="
                text-align:center; padding:40px 20px; color:var(--text-light);
                font-size:15px; line-height:1.7;">
                <div style="font-size:36px; margin-bottom:12px;">🔍</div>
                <div>No schemes match your profile.</div>
                <div style="margin-top:4px; font-size:13px;">Try adjusting your inputs — e.g. change income bracket or course level.</div>
            </div>`;
        }
        showResultsPanel();
        return;
    }

    // Build scheme ID lookup map for cross-reference
    const schemeMap = {};
    schemes.forEach(s => {
        if (s && s.scheme_id) {
            schemeMap[s.scheme_id] = s;
        }
    });

    // TASK 3 — Incompatibility banners
    const banners = buildIncompatibilityBanners(schemes);
    if (stack && banners) {
        stack.insertAdjacentHTML('beforebegin', banners);
    }

    // TASK 2 — Render one card per scheme
    schemes.forEach(scheme => {
        if (scheme) {
            const cardHtml = buildSchemeCard(scheme, schemeMap);
            if (stack) stack.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    showResultsPanel();
}

function showResultsPanel() {
    document.getElementById('elig-form-card').style.display = 'none';
    const resultsEl = document.getElementById('elig-results');
    if (resultsEl) {
        resultsEl.classList.add('visible');
        setTimeout(() => resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
}

function renderError() {
    const stack = document.getElementById('elig-cards-stack');
    if (stack) {
        stack.innerHTML = `<div class="elig-error-state" style="
            text-align:center; padding:40px 20px; color:var(--text-light);
            font-size:15px; line-height:1.7;">
            <div style="font-size:36px; margin-bottom:12px;">⚠️</div>
            <div>Something went wrong. Please try again.</div>
        </div>`;
    }
    showResultsPanel();
}

// ── SECTION A — Badge based on selection_type ─────────────────────────────────

function buildBadge(selectionType) {
    switch (selectionType) {
        case 'standard':
            return `<span class="result-badge badge-eligible">✅ You are eligible</span>`;
        case 'merit_based':
            return `<span class="result-badge badge-near-miss" style="background:rgba(139,92,246,.15); color:#a78bfa; border-color:rgba(139,92,246,.3);">⭐ You may be eligible — selection based on merit/ranking</span>`;
        case 'cap_dependent':
            return `<span class="result-badge badge-near-miss" style="background:rgba(59,130,246,.12); color:#60a5fa; border-color:rgba(59,130,246,.3);">🔵 You may qualify — subject to CAP seat availability</span>`;
        default:
            return `<span class="result-badge badge-eligible">✅ You are eligible</span>`;
    }
}

// ── SECTION C — Benefits summary ──────────────────────────────────────────────

function buildBenefitsSummary(benefits) {

    if (!benefits) return '';
    const type = benefits.type || '';
    const parts = [];

    // Per-type main content
    switch (type) {
        case 'maintenance_and_fees':
        case 'post_matric_scholarship':
            parts.push(buildFeesCovered(benefits.fees_covered));
            parts.push(buildMaintenanceAllowance(benefits.maintenance_allowance));
            break;
        case 'fee_reimbursement':
            parts.push(buildFeesCovered(benefits.fees_covered));
            break;
        case 'maintenance_allowance':
            parts.push(buildMaintenanceAllowance(benefits.maintenance_allowance));
            break;
        case 'merit_scholarship': {
            const amt = benefits.monthly_scholarship || benefits.annual_amount;
            if (amt != null) {
                parts.push(`<div class="benefit-row"><span class="benefit-label">Amount:</span>
                    <span class="benefit-val">₹${amt.toLocaleString('en-IN')}${benefits.monthly_scholarship ? '/month' : '/year'}</span></div>`);
            }
            break;
        }
        case 'fixed_monthly_scholarship': {
            const monthly = benefits.amount_per_month;
            const months = benefits.duration_months_per_year;
            if (monthly != null) {
                parts.push(`<div class="benefit-row"><span class="benefit-label">Monthly:</span>
                    <span class="benefit-val">₹${monthly.toLocaleString('en-IN')}/month${months ? ` × ${months} months/year` : ''}</span></div>`);
            }
            break;
        }
        case 'formula_based_scholarship':
            parts.push(buildSpecialConditionsList(benefits.special_conditions, 'Benefit Formula'));
            break;
        case 'full_concession':
            parts.push(buildFeesCovered(benefits.fees_covered, 'Full fee concession applicable'));
            break;
        case 'partial_freeship':
            parts.push(buildFeesCovered(benefits.fees_covered, 'Partial fee coverage — amount depends on income slab'));
            break;
    }

    // Always: note if non-empty
    if (benefits.note && benefits.note.trim()) {
        parts.push(`<div class="benefit-note" style="margin-top:6px; font-size:12.5px; color:var(--text-primary); font-style:italic;">${escHtml(benefits.note)}</div>`);
    }

    // Always: special_conditions if non-empty (except formula_based which already showed them)
    if (type !== 'formula_based_scholarship') {
        parts.push(buildSpecialConditionsList(benefits.special_conditions));
    }

    const inner = parts.filter(Boolean).join('');
    if (!inner) return '';
    return `<div class="result-benefits-block" style="margin:10px 0; padding:10px 12px; background:linear-gradient(135deg,#fffdf9 0%,#fef9f0 100%); border-radius:8px; border:1.5px solid #f0e6d3;">
        <div class="benefit-type-label" style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#c47c2f; margin-bottom:6px;">Benefits</div>
        ${inner}
    </div>`;
}

function buildFeesCovered(list, overrideLabel) {
    if (overrideLabel) {
        return `<div class="benefit-row"><span class="benefit-label">Fees:</span> <span class="benefit-val">${escHtml(overrideLabel)}</span></div>`;
    }
    if (!list || list.length === 0) return '';
    const items = list.map(f => `<span class="fee-pill" style="display:inline-block; background:linear-gradient(135deg,#fff7ed,#fef3c7); color:#92400e; border:1px solid #fcd34d; font-weight:600; border-radius:4px; padding:1px 7px; font-size:11.5px; margin:2px 3px 2px 0;">${escHtml(f)}</span>`).join('');
    return `<div class="benefit-row" style="margin-bottom:4px;"><span class="benefit-label" style="font-size:12px; color:var(--text-primary);">Fees covered: </span>${items}</div>`;
}

function buildMaintenanceAllowance(ma) {
    if (!ma || typeof ma !== 'object') return '';
    const rows = [];
    Object.entries(ma).forEach(([key, val]) => {
        if (val && typeof val === 'object') {
            const sub = Object.entries(val).map(([k, v]) => `${k}: ₹${v}`).join(' · ');
            rows.push(`<div class="benefit-row" style="font-size:12px;"><span style="color:var(--text-primary); text-transform:capitalize;">${escHtml(key.replace(/_/g, ' '))}:</span> <span>${escHtml(sub)}</span></div>`);
        } else if (val != null) {
            rows.push(`<div class="benefit-row" style="font-size:12px;"><span style="color:var(--text-primary); text-transform:capitalize;">${escHtml(key.replace(/_/g, ' '))}:</span> <span>₹${val}</span></div>`);
        }
    });
    if (!rows.length) return '';
    return `<div style="margin-top:4px;"><div style="font-size:11.5px; color:var(--text-primary); margin-bottom:3px;">Maintenance Allowance:</div>${rows.join('')}</div>`;
}

function formatConditionText(c) {
    if (!c) return '';
    // Convert "key: {'subkey': 'value'}" to "Key: subkey — value"
    return c
        .replace(/:\s*\{([^}]+)\}/g, (match, inner) => {
            const parts = inner
                .split(',')
                .map(p => p.replace(/['"]/g, '').trim())
                .map(p => p.replace(':', ' —'))
                .join(', ');
            return ': ' + parts;
        })
        .replace(/[{}'"\[\]]/g, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function buildSpecialConditionsList(list, heading) {
    if (!list || list.length === 0) return '';
    const items = list.map(c => `<li style="font-size:12.5px; margin-bottom:3px; color:var(--text-primary);">${escHtml(formatConditionText(c))}</li>`).join('');
    return `<div style="margin-top:6px;">${heading ? `<div style="font-size:11.5px; font-weight:600; margin-bottom:4px; color:var(--text-primary);">${escHtml(heading)}:</div>` : ''}<ul style="margin:0; padding-left:16px;">${items}</ul></div>`;
}

// ── SECTION D — Seat quota notice ─────────────────────────────────────────────

function buildSeatQuota(seat_quota) {
    if (!seat_quota) return '';
    const notices = [];
    if (seat_quota.is_seat_limited) {
        const seats = seat_quota.total_seats || seat_quota.district_limit || '?';
        notices.push(`⚠️ Limited seats — ${seats} seats available`);
    }
    if (seat_quota.cap_dependent) {
        notices.push(`🔵 Requires CAP seat allocation in this category`);
    }
    if (seat_quota.female_reservation != null) {
        notices.push(`${seat_quota.female_reservation} seats reserved for female students`);
    }
    if (!notices.length) return '';
    const rows = notices.map(n => `<div style="font-size:12.5px; margin-bottom:3px;">${escHtml(n)}</div>`).join('');
    return `<div class="seat-quota-block" style="margin:8px 0; padding:8px 12px; background:rgba(59,130,246,.08); border:1px solid rgba(59,130,246,.2); border-radius:7px;">${rows}</div>`;
}

// ── SECTION E — Additional conditions ─────────────────────────────────────────

function buildAdditionalConditions(conditions) {
    if (!conditions || conditions.length === 0) return '';
    const rows = conditions.map(c => `
        <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:5px;">
            <span style="flex-shrink:0; width:16px; height:16px; border:2px solid #92400e; border-radius:3px; display:inline-block; margin-top:2px;"></span>
            <span style="font-size:12.5px; color:#6b3a10; font-weight:500; line-height:1.5;">${escHtml(c)}</span>
        </div>`).join('');
    return `<div class="conditions-block" style="margin:10px 0; padding:10px 12px; background:linear-gradient(135deg,#fffbf0,#fff8e8); border:1.5px solid #e8a825; border-left:4px solid #d97706; border-radius:8px;">
        <div style="font-size:11.5px; font-weight:700; color:#92400e; text-transform:uppercase; letter-spacing:.06em; margin-bottom:7px;">⚠ Verify before applying</div>
        ${rows}
    </div>`;
}

// ── SECTION F — Dependent scheme notice ───────────────────────────────────────

function buildDependentNotice(dependent_on, schemeMap) {
    if (!dependent_on || dependent_on.length === 0) return '';
    const notices = dependent_on.map(id => {
        const dep = schemeMap[id];
        const label = dep ? `"${dep.name}" (Scheme #${id})` : `Scheme #${id}`;
        return `<div style="font-size:12.5px; margin-bottom:3px;">ℹ️ This scheme requires you to also apply for ${escHtml(label)}</div>`;
    }).join('');
    return `<div class="dependent-block" style="margin:8px 0; padding:8px 12px; background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.25); border-radius:7px;">${notices}</div>`;
}

// ── SECTION G — Documents ─────────────────────────────────────────────────────

function buildDocuments(docs) {
    if (!docs || docs.length === 0) return '';
    const items = docs.map(d => `<li style="font-size:12.5px; margin-bottom:3px; color:#3d2b1a;">📄 ${escHtml(d)}</li>`).join('');
    return `<div class="docs-block" style="margin:10px 0;">
        <div style="font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#8a7560; margin-bottom:6px;">Documents required</div>
        <ul style="margin:0; padding-left:4px; list-style:none;">${items}</ul>
    </div>`;
}

// ── SECTION H — Apply button ──────────────────────────────────────────────────

function buildApplyButton(link) {
    if (!link) return '';
    const arrowSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;
    return `<a href="${escHtml(link)}" target="_blank" rel="noopener" class="result-btn-primary" style="display:inline-flex; align-items:center; gap:6px; margin-top:4px; background:linear-gradient(135deg,#f97316,#ea580c); box-shadow:0 3px 10px rgba(234,88,12,.30); font-weight:700;">
        Apply / View on MahaDBT → ${arrowSvg}
    </a>`;
}

// ── Full card builder ─────────────────────────────────────────────────────────

function buildSchemeCard(scheme, schemeMap) {

    const {
        scheme_id, name, department, category_label, selection_type,
        benefits, seat_quota, additional_conditions,
        dependent_on, documents_required, official_link,
    } = scheme;

    const cardClass = selection_type === 'standard' ? 'eligible'
        : selection_type === 'merit_based' ? 'eligible'
            : 'near-miss';

    const accentColor = selection_type === 'merit_based' ? '#a78bfa'
        : selection_type === 'cap_dependent' ? '#60a5fa'
        : '#22c55e';

    return `
    <article class="result-card ${cardClass}" id="result-card-${scheme_id}" style="margin-bottom:20px; padding:24px 28px; background:#ffffff; border-radius:14px; border:1.5px solid #e8e0d5; border-left:4px solid ${accentColor}; box-shadow:0 2px 12px rgba(180,140,100,.10),0 1px 3px rgba(0,0,0,.06);">

        <!-- SECTION A: Badge -->
        <div class="result-card-top" style="margin-bottom:6px;">
            <div>${buildBadge(selection_type)}</div>
            ${category_label ? `<span class="result-benefit-pill">${escHtml(category_label)}</span>` : ''}
        </div>

        <!-- SECTION B: Identity -->
        <div class="result-scheme-name" style="font-size:17px; font-weight:700; color:#1a1208; letter-spacing:-0.01em;">${escHtml(name)}</div>
        <div class="result-dept" style="margin-bottom:4px; font-size:12.5px; color:#8a7560; font-weight:500;">
            🏛️ ${escHtml(department)}
        </div>

        <!-- SECTION C: Benefits -->
        ${buildBenefitsSummary(benefits)}

        <!-- SECTION D: Seat quota -->
        ${buildSeatQuota(seat_quota)}

        <!-- SECTION E: Additional conditions -->
        ${buildAdditionalConditions(additional_conditions)}

        <!-- SECTION F: Dependent notice -->
        ${buildDependentNotice(dependent_on, schemeMap)}

        <!-- SECTION G: Documents -->
        ${buildDocuments(documents_required)}

        <!-- SECTION H: Apply button -->
        <div class="result-actions" style="margin-top:12px;">
            ${buildApplyButton(official_link)}
        </div>

    </article>`;
}

// ── TASK 3 — Incompatibility banners ─────────────────────────────────────────

function buildIncompatibilityBanners(schemes) {
    const banners = [];

    // Rule A: schemes with incompatible_with: ["ALL"]
    const allExclusive = schemes.filter(s =>
        Array.isArray(s.incompatible_with) && s.incompatible_with.includes('ALL')
    );
    if (allExclusive.length > 0 && schemes.length > 1) {
        const nameList = allExclusive.map(s => `<strong>${escHtml(s.name)}</strong>`).join(', ');
        banners.push(`
        <div class="incompat-banner" style="margin-bottom:16px; padding:12px 16px;
            background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:9px;
            font-size:13px; color:#f87171; line-height:1.6;">
            ⚠️ Some schemes below are mutually exclusive — you can only apply to <strong>ONE</strong> of: ${nameList}
        </div>`);
    }

    // Rule B: pairwise mutual incompatibility
    const warned = new Set();
    for (let i = 0; i < schemes.length; i++) {
        for (let j = i + 1; j < schemes.length; j++) {
            const a = schemes[i], b = schemes[j];
            const pairKey = `${Math.min(a.scheme_id, b.scheme_id)}-${Math.max(a.scheme_id, b.scheme_id)}`;
            if (warned.has(pairKey)) continue;
            const aIncompat = Array.isArray(a.incompatible_with) && a.incompatible_with.includes(b.scheme_id);
            const bIncompat = Array.isArray(b.incompatible_with) && b.incompatible_with.includes(a.scheme_id);
            if (aIncompat || bIncompat) {
                warned.add(pairKey);
                banners.push(`
                <div class="incompat-banner" style="margin-bottom:16px; padding:12px 16px;
                    background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:9px;
                    font-size:13px; color:#f87171; line-height:1.6;">
                    ⚠️ <strong>${escHtml(a.name)}</strong> and <strong>${escHtml(b.name)}</strong> are mutually exclusive — you can only apply to one of these two.
                </div>`);
            }
        }
    }

    return banners.join('');
}

// ── Reset & wiring ────────────────────────────────────────────────────────────

function resetEligibility() {
    document.getElementById('elig-form').reset();
    const resultsEl = document.getElementById('elig-results');
    if (resultsEl) resultsEl.classList.remove('visible');

    // Remove any injected incompatibility banners
    document.querySelectorAll('.incompat-banner').forEach(el => el.remove());

    document.getElementById('elig-form-card').style.display = '';
    const panel = document.getElementById('panel-eligibility');
    if (panel) window.scrollTo({ top: panel.offsetTop - 120, behavior: 'smooth' });
}

// ── Toast helper (re-use existing if present) ─────────────────────────────────

function showEligToast(msg) {
    if (typeof showToast === 'function') { showToast(msg); return; }
    // Minimal fallback toast
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: '#1e1e1e', color: '#fff', padding: '10px 20px', borderRadius: '8px',
        fontSize: '13px', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        pointerEvents: 'none', opacity: '0', transition: 'opacity .25s',
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
}

// ── DOMContentLoaded wiring ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const eligForm = document.getElementById('elig-form');
    if (eligForm) eligForm.addEventListener('submit', runEligibilityCheck);

    const resetBtn = document.querySelector('.elig-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetEligibility);
});
