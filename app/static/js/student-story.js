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
        ],
        offline: [
            {
                title: 'Visit your nearest bank branch',
                icon: '🏦',
                screenshot: 'Bank branch exterior entrance illustration',
                instruction: n => `<span class="student-name">${n}</span>, go to the bank branch where your scholarship account is held. Make sure to visit during banking hours — usually <strong>10 AM to 4 PM on weekdays</strong>.`
            },
            {
                title: 'Carry required documents',
                icon: '📁',
                screenshot: 'Checklist of required documents: Aadhaar, passbook, mobile, photo',
                instruction: n => `<span class="student-name">${n}</span>, before leaving home make sure you carry all required documents:<ul><li>✅ Aadhaar card (original + photocopy)</li><li>✅ Bank passbook or account statement</li><li>✅ Mobile phone linked to Aadhaar</li><li>✅ Passport-size photo (just in case)</li></ul>`
            },
            {
                title: 'Ask for DBT enabling form at the counter',
                icon: '📋',
                screenshot: 'Bank counter with staff handing over a DBT/Aadhaar seeding form',
                instruction: n => `<span class="student-name">${n}</span>, at the counter tell the staff: <strong>"I need to enable Direct Benefit Transfer (DBT) for my account linked to Aadhaar."</strong> They will give you the appropriate seeding request form.`
            },
            {
                title: 'Fill the form with Aadhaar details',
                icon: '📝',
                screenshot: 'Filled Aadhaar seeding / DBT activation form with all fields completed in capital letters',
                instruction: n => `<span class="student-name">${n}</span>, fill in your <strong>full name (as in Aadhaar), 12-digit Aadhaar number, and account number</strong>. Write clearly in capital letters. Don't leave any field blank — ask the bank staff if you're unsure.`
            },
            {
                title: 'Submit and collect acknowledgment slip',
                icon: '🧾',
                screenshot: 'Bank acknowledgment slip showing reference number and submission date',
                instruction: n => `<span class="student-name">${n}</span>, hand the filled form to the counter staff along with your Aadhaar photocopy. Make sure to collect the <strong>acknowledgment slip or receipt</strong> with a reference number — keep it safe. DBT is usually activated within <strong>7 working days</strong>.`
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
        ],
        offline: [
            {
                title: 'Prepare all necessary documents',
                icon: '🗂️',
                screenshot: 'Stack of documents: application printout, Aadhaar, passbook',
                instruction: n => `<span class="student-name">${n}</span>, print out a copy of your <strong>approved MahaDBT application</strong>, your NPCI DBT active status page, Aadhaar card, and the latest bank passbook page.`
            },
            {
                title: 'Visit your college scholarship section',
                icon: '🏫',
                screenshot: 'College admin office desk',
                instruction: n => `<span class="student-name">${n}</span>, go to your college's administrative office or scholarship desk and ask the clerk to verify if the fund delay is at the college level or department level.`
            },
            {
                title: 'Submit a written complaint to the Principal',
                icon: '📝',
                screenshot: 'Handwritten letter addressed to the Principal citing MahaDBT application ID',
                instruction: n => `<span class="student-name">${n}</span>, if the college cannot resolve it, submit a formal written application addressed to the <strong>Principal</strong> detailing your Application ID, scheme name, and attachment proofs.`
            },
            {
                title: 'Follow up every 15 days',
                icon: '🗓️',
                screenshot: 'Calendar highlighting dates 15 days apart',
                instruction: n => `<span class="student-name">${n}</span>, keep a stamped acknowledgement of your letter and follow up in-person with the scholarship-in-charge every <strong>15 to 20 days</strong> until the issue is cleared.`
            }
        ]
    }
};

const storyState = {};

function initStory(tabId) {
    if (storyState[tabId]) return;
    let defaultMethod = 'npci';
    if (tabId === 'enable-dbt') defaultMethod = 'offline';
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
    const studentName = 'Rahul';

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
