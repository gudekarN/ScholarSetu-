// ─────────────────────────────────────────
// student-story.js — Storytelling UI Engine
// (DBT Status, Enable DBT, Grievance tabs)
// ─────────────────────────────────────────

const STORY_DATA = {
    'dbt-status': {
        npci: [
            {
                title: 'Open NPCI portal at npci.org.in',
                icon: '🖥️',
                screenshot: 'NPCI homepage with URL bar showing npci.org.in',
                instruction: n => `<span class="student-name">${n}</span>, open your browser and go to <strong>npci.org.in</strong>. You can use Chrome, Firefox, or any browser on your phone or laptop.`
            },
            {
                title: 'Click on "Check DBT Status" option',
                icon: '🖱️',
                screenshot: 'NPCI homepage highlighting the "Check DBT Status" button in navigation',
                instruction: n => `<span class="student-name">${n}</span>, on the NPCI homepage look for the <strong>"Check DBT Status"</strong> link — it's usually in the top navigation or a prominent section. Click on it to proceed.`
            },
            {
                title: 'Enter your Aadhaar number',
                icon: '🪪',
                screenshot: 'NPCI form showing the 12-digit Aadhaar number input field',
                instruction: n => `<span class="student-name">${n}</span>, carefully type your <strong>12-digit Aadhaar number</strong> in the input box shown. Double-check every digit before proceeding — a wrong number will show incorrect results.`
            },
            {
                title: 'Enter OTP received on your mobile',
                icon: '📱',
                screenshot: 'OTP input screen with a 6-digit OTP entry field and timer',
                instruction: n => `<span class="student-name">${n}</span>, you'll receive a <strong>6-digit OTP</strong> on the mobile number linked to your Aadhaar. Enter it quickly — OTPs are usually valid for only <strong>3 minutes</strong>.`
            },
            {
                title: 'View your DBT linking status',
                icon: '📊',
                screenshot: 'NPCI results page showing DBT Active / Inactive status with mapper details',
                instruction: n => `<span class="student-name">${n}</span>, after OTP verification the NPCI system will show your DBT status. Look for <strong>"Active"</strong> — if it shows <strong>"Inactive"</strong> or no result, move to the <strong>Enable DBT</strong> tab to fix it.`
            },
            {
                title: 'Note down your bank details shown',
                icon: '📝',
                screenshot: 'Bank name, account number (masked), and IIN displayed on NPCI results page',
                instruction: n => `<span class="student-name">${n}</span>, take a screenshot or write down the <strong>bank name, last 4 digits of account number, and IIN</strong> displayed. You'll need these if you face any issues during your MahaDBT scholarship application.`
            }
        ],
        myaadhaar: [
            {
                title: 'Download the MyAadhaar App',
                icon: '📲',
                screenshot: 'Play Store / App Store listing for the official MyAadhaar app by UIDAI',
                instruction: n => `<span class="student-name">${n}</span>, open the <strong>Google Play Store</strong> (Android) or <strong>App Store</strong> (iPhone) and search for <strong>"MyAadhaar"</strong>. Install the official app by UIDAI — it's free.`
            },
            {
                title: 'Login with your Aadhaar number',
                icon: '🔐',
                screenshot: 'MyAadhaar app login screen showing Aadhaar number field and Send OTP button',
                instruction: n => `<span class="student-name">${n}</span>, open the app and enter your <strong>12-digit Aadhaar number</strong>. Tap <strong>"Send OTP"</strong> — an OTP will arrive on your registered mobile number.`
            },
            {
                title: 'Navigate to Bank Seeding Status',
                icon: '🗂️',
                screenshot: 'MyAadhaar app dashboard with "Bank Seeding Status" option highlighted in the menu',
                instruction: n => `<span class="student-name">${n}</span>, after logging in, look for <strong>"Bank Seeding Status"</strong> or <strong>"DBT Status"</strong> in the app's main menu or services section. Tap on it.`
            },
            {
                title: 'View and save your DBT status',
                icon: '📊',
                screenshot: 'DBT status screen in MyAadhaar showing Active/Inactive and the linked bank IIN',
                instruction: n => `<span class="student-name">${n}</span>, the app will display your current DBT status and the linked bank details. If it shows <strong>Active</strong> — you're good! If not, go to the <strong>Enable DBT</strong> tab.`
            }
        ]
    },
    'enable-dbt': {
        online: [
            {
                title: 'Visit the MahaDBT portal',
                icon: '🌐',
                screenshot: 'MahaDBT portal homepage at mahadbt.maharashtra.gov.in',
                instruction: n => `<span class="student-name">${n}</span>, open your browser and go to <strong>mahadbt.maharashtra.gov.in</strong> — the official portal for Maharashtra scholarship applications and DBT management.`
            },
            {
                title: 'Log in with your MahaDBT credentials',
                icon: '🔑',
                screenshot: 'MahaDBT login screen with username and password fields',
                instruction: n => `<span class="student-name">${n}</span>, enter your <strong>MahaDBT username and password</strong>. If you haven't registered yet, click <strong>"New Registration"</strong> and create your account using your Aadhaar details.`
            },
            {
                title: 'Go to Profile → Bank Account & Aadhaar',
                icon: '🗂️',
                screenshot: 'MahaDBT dashboard with Profile menu expanded showing Bank Account & Aadhaar option',
                instruction: n => `<span class="student-name">${n}</span>, after logging in, hover over your <strong>Profile</strong> menu at the top. Click on <strong>"Bank Account &amp; Aadhaar Details"</strong> from the dropdown.`
            },
            {
                title: 'Enter and verify your bank account',
                icon: '🏧',
                screenshot: 'Bank account entry form with IFSC code, account number fields and a Verify button',
                instruction: n => `<span class="student-name">${n}</span>, fill in your <strong>Bank Account Number and IFSC Code</strong>. Click <strong>"Verify Bank Account"</strong> — the system checks with NPCI and activates DBT if Aadhaar is linked.`
            },
            {
                title: 'Confirm Aadhaar OTP to activate DBT',
                icon: '✅',
                screenshot: 'OTP confirmation screen with a success message after DBT activation on MahaDBT',
                instruction: n => `<span class="student-name">${n}</span>, the portal will send an OTP to your Aadhaar-linked mobile. Enter it to confirm. Once verified, your DBT status will show as <strong>Active</strong> — usually within <strong>24–48 hours</strong>.`
            }
        ]
    },
    'grievance': {
        online: [
            {
                title: 'Log in with MahaDBT credentials',
                icon: '🔑',
                screenshot: 'MahaDBT login screen with username and password',
                instruction: n => `<span class="student-name">${n}</span>, log in to <strong>mahadbt.maharashtra.gov.in</strong> with your official credentials.`
            },
            {
                title: 'Go to Grievance/Suggestions section',
                icon: '🖱️',
                screenshot: 'Dashboard left sidebar highlighting Grievance/Suggestions option',
                instruction: n => `<span class="student-name">${n}</span>, on your main dashboard look at the left sidebar menu and click on <strong>"Grievance/Suggestions"</strong>.`
            },
            {
                title: 'Select Scheme and Category',
                icon: '📋',
                screenshot: 'Grievance form dropdowns showing scheme selection',
                instruction: n => `<span class="student-name">${n}</span>, choose your specific scholarship scheme from the dropdown and select the category related to <strong>"Fund Disbursement Delay"</strong>.`
            },
            {
                title: 'Describe the issue clearly',
                icon: '📝',
                screenshot: 'Textarea field showing a written complaint template',
                instruction: n => `<span class="student-name">${n}</span>, in the description box, mention your <strong>Application ID</strong>, the <strong>date your form was approved</strong>, and state that your Aadhaar/DBT is active but funds are pending.`
            },
            {
                title: 'Submit and save Grievance ID',
                icon: '✅',
                screenshot: 'Success popup showing the generated Grievance Ticket ID',
                instruction: n => `<span class="student-name">${n}</span>, click submit. A <strong>Grievance Ticket ID</strong> will be generated — note this down immediately. You can track the status from the same menu using this ID.`
            }
        ]
    }
};

const storyState = {};

function initStory(tabId) {
    if (storyState[tabId]) return;
    let defaultMethod = 'npci';
    if (tabId === 'enable-dbt') defaultMethod = 'online';
    if (tabId === 'grievance') defaultMethod = 'online';

    storyState[tabId] = { method: defaultMethod, step: 0 };
    renderStory(tabId);
}

function switchStoryMethod(tabId, method) {
    storyState[tabId] = { method, step: 0 };
    document.getElementById(tabId + '-pills').querySelectorAll('.method-pill').forEach(p => {
        const isActive = p.id === tabId + '-pill-' + method;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-selected', isActive);
    });
    document.getElementById(tabId + '-step-card').style.display = '';
    document.getElementById(tabId + '-progress-wrap').style.display = '';
    document.getElementById(tabId + '-complete').classList.remove('visible');
    renderStory(tabId);
}

function renderStory(tabId) {
    const { method, step } = storyState[tabId];
    const steps = STORY_DATA[tabId][method];
    const total = steps.length;
    const data = steps[step];
    const studentName = (typeof STUDENT !== 'undefined' && STUDENT.firstName) ? STUDENT.firstName : 'Student';

    document.getElementById(tabId + '-progress-label').textContent = `Step ${step + 1} of ${total}`;
    document.getElementById(tabId + '-progress-fill').style.width = `${((step + 1) / total) * 100}%`;
    document.getElementById(tabId + '-badge').textContent = step + 1;
    document.getElementById(tabId + '-title').textContent = data.title;
    document.getElementById(tabId + '-ss-icon').textContent = data.icon;
    document.getElementById(tabId + '-screenshot-label').textContent = 'Screenshot: ' + data.screenshot;
    document.getElementById(tabId + '-instruction').innerHTML = data.instruction(studentName);

    const prevBtn = document.getElementById(tabId + '-prev');
    const nextBtn = document.getElementById(tabId + '-next');
    prevBtn.disabled = step === 0;

    if (step === total - 1) {
        nextBtn.textContent = 'Mark as Complete ✓';
        nextBtn.classList.add('step-btn-complete');
    } else {
        nextBtn.textContent = 'Next Step →';
        nextBtn.classList.remove('step-btn-complete');
    }
}

function storyNav(tabId, direction) {
    const { method, step } = storyState[tabId];
    const total = STORY_DATA[tabId][method].length;

    if (direction === 'prev' && step > 0) {
        storyState[tabId].step--;
        renderStory(tabId);
    } else if (direction === 'next') {
        if (step === total - 1) {
            document.getElementById(tabId + '-step-card').style.display = 'none';
            document.getElementById(tabId + '-progress-wrap').style.display = 'none';
            document.getElementById(tabId + '-complete').classList.add('visible');
        } else {
            storyState[tabId].step++;
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

// ── Report modal ──
let _reportSource = '';

function openReportModal(tabId) {
    _reportSource = tabId;
    document.querySelectorAll('input[name="report-issue"]').forEach(r => r.checked = false);
    openModal('modal-report');
}

function submitReport() {
    const selected = document.querySelector('input[name="report-issue"]:checked');
    if (!selected) { alert('Please select an issue type before submitting.'); return; }
    closeModal('modal-report');
    showToast('✅ Report submitted — thanks for helping improve ScholarSetu!');
}

// Init on load
document.addEventListener('DOMContentLoaded', function () {
    initStory('dbt-status');
    initStory('enable-dbt');
    initStory('grievance');

    // Wire story nav buttons using data attributes
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
            openReportModal(this.dataset.openReport);
        });
    });

    const reportSubmitBtn = document.getElementById('report-submit-btn');
    if (reportSubmitBtn) reportSubmitBtn.addEventListener('click', submitReport);
});
