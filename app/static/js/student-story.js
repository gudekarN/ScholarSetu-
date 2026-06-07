// student-story.js — DB-driven Storytelling UI

const PROCESS_MAP = {
    'dbt-status': { npci: { process: 'check_dbt_npci', method: 'npci' }, myaadhaar: { process: 'check_dbt_myaadhar', method: 'myaadhar' } },
    'enable-dbt': { online: { process: 'enable_dbt_online', method: 'online' } },
    'grievance': { online: { process: 'grievance', method: 'online' } }
};

const storyState = {};

async function initStory(tabId) {
    let defaultMethod = 'npci';
    if (tabId === 'enable-dbt') defaultMethod = 'online';
    if (tabId === 'grievance') defaultMethod = 'online';
    storyState[tabId] = { method: defaultMethod, step: 0, steps: [] };
    await loadStory(tabId, defaultMethod);
}

async function loadStory(tabId, method) {
    const map = PROCESS_MAP[tabId][method];
    try {
        const res = await fetch(`/student/get_story/${map.process}/${map.method}`);
        const data = await res.json();
        if (!data.success || !data.steps.length) {
            console.warn('No steps found for', tabId, method);
            return;
        }
        storyState[tabId].steps = data.steps;
        storyState[tabId].method = method;
        storyState[tabId].step = 0;
        renderStory(tabId);
    } catch (err) {
        console.error('Failed to load story:', err);
    }
}

function renderStory(tabId) {
    const { step, steps } = storyState[tabId];
    if (!steps.length) return;
    const total = steps.length;
    const current = steps[step];
    const studentName = (typeof STUDENT !== 'undefined' && STUDENT.firstName) ? STUDENT.firstName : 'Student';

    document.getElementById(tabId + '-progress-label').textContent = `Step ${step + 1} of ${total}`;
    document.getElementById(tabId + '-progress-fill').style.width = `${((step + 1) / total) * 100}%`;
    document.getElementById(tabId + '-badge').textContent = step + 1;
    document.getElementById(tabId + '-title').textContent = current.caption;

    const img = document.getElementById(tabId + '-screenshot-img');
    if (img) {
        img.src = current.image_path;
        img.alt = current.caption;
    }
    const descEl = document.getElementById(tabId + '-instruction');
    if (descEl) {
        const studentName = (typeof STUDENT !== 'undefined' && STUDENT.firstName) ? STUDENT.firstName : 'Student';
        descEl.innerHTML = `<span class="student-name">${studentName}</span>, ${current.description || ''}`;
    }

    document.getElementById(tabId + '-prev').disabled = step === 0;

    const nextBtn = document.getElementById(tabId + '-next');
    if (step === total - 1) {
        nextBtn.textContent = 'Mark as Complete ✓';
        nextBtn.classList.add('step-btn-complete');
    } else {
        nextBtn.textContent = 'Next Step →';
        nextBtn.classList.remove('step-btn-complete');
    }
}

function switchStoryMethod(tabId, method) {
    document.getElementById(tabId + '-pills').querySelectorAll('.method-pill').forEach(p => {
        const isActive = p.id === tabId + '-pill-' + method;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-selected', isActive);
    });
    document.getElementById(tabId + '-step-card').style.display = '';
    document.getElementById(tabId + '-progress-wrap').style.display = '';
    document.getElementById(tabId + '-complete').classList.remove('visible');
    loadStory(tabId, method);
}

function storyNav(tabId, direction) {
    const state = storyState[tabId];
    const total = state.steps.length;
    if (direction === 'prev' && state.step > 0) {
        state.step--;
        renderStory(tabId);
    } else if (direction === 'next') {
        if (state.step === total - 1) {
            document.getElementById(tabId + '-step-card').style.display = 'none';
            document.getElementById(tabId + '-progress-wrap').style.display = 'none';
            document.getElementById(tabId + '-complete').classList.add('visible');
        } else {
            state.step++;
            renderStory(tabId);
        }
    }
}

function storyRestart(tabId) {
    storyState[tabId].step = 0;
    document.getElementById(tabId + '-step-card').style.display = '';
    document.getElementById(tabId + '-progress-wrap').style.display = '';
    document.getElementById(tabId + '-complete').classList.remove('visible');
    renderStory(tabId);
}

async function reportStep(tabId) {
    const state = storyState[tabId];
    const map = PROCESS_MAP[tabId][state.method];
    const btn = document.getElementById(tabId + '-report-btn');
    const confirmed = confirm('Are you sure this step is incorrect? This will send a report to the admin.');
    if (!confirmed) return;
    try {
        const res = await fetch('/student/report_step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ process: map.process, step_number: state.step + 1 })
        });
        const data = await res.json();
        if (data.success) {
            if (btn) { btn.textContent = '✅ Reported'; btn.disabled = true; }
            showToast('Thank you — this step has been flagged.');
        } else {
            showToast('Could not submit report. Please try again.');
        }
    } catch (err) {
        showToast('Could not submit report. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initStory('dbt-status');
    initStory('enable-dbt');
    initStory('grievance');

    document.querySelectorAll('[data-story-nav]').forEach(btn => {
        btn.addEventListener('click', function () {
            storyNav(this.dataset.storyId, this.dataset.storyNav);
        });
    });

    document.querySelectorAll('[data-story-method]').forEach(btn => {
        btn.addEventListener('click', function () {
            switchStoryMethod(this.dataset.storyId, this.dataset.storyMethod);
        });
    });

    document.querySelectorAll('[data-story-restart]').forEach(btn => {
        btn.addEventListener('click', function () {
            storyRestart(this.dataset.storyRestart);
        });
    });

    document.querySelectorAll('[data-open-report]').forEach(btn => {
        btn.addEventListener('click', function () {
            reportStep(this.dataset.openReport);
            this.id = this.dataset.openReport + '-report-btn';
        });
    });
});
