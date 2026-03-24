# 🎓 ScholarSetu

> **Empowering Students. Simplifying Scholarships.**

**ScholarSetu** is a centralized platform designed to help students seamlessly explore scholarships, check their eligibility, understand necessary documents, and follow a step-by-step application guide. 

We bridge the gap between students and their educational rights by simplifying complex processes like DBT (Direct Benefit Transfer) linkages, Aadhaar mapping, and grievance submissions.

---

## 🌟 Key Features

*   **🔍 Smart Eligibility Checker:** Answer a few questions to instantly discover which MahaDBT scholarships you qualify for.
*   **📚 Interactive Application Guide:** Step-by-step storytelling UI to guide you through applying and enabling Direct Benefit Transfer (DBT).
*   **🏫 Centralized Notice Board:** Stay updated with high-priority notices, academic deadlines, and read receipts.
*   **💬 Community Q&A:** Engage with peers to resolve queries and share documentation strategies.

---

## 🏛️ Project Architecture

The application is built on a **Modular Front-end Architecture**, prepared directly for robust **Flask Integration**.

The system isolates the ecosystem into three beautifully contained portals:
1.  **👨‍🎓 Student Dashboard** (`/templates/student-dashboard.html`)
2.  **👨‍🏫 College Admin Panel** (`/templates/admin-dashboard.html`)
3.  **👑 Super Admin Portal** (`/templates/superadmin.html`)

### 📂 Directory Layout
```text
ScholarSetu/
├── static/
│   ├── css/      # Feature-specific styling modules (e.g. student-eligibility.css)
│   └── js/       # Independent interactive modules (e.g. admin-notices.js)
└── templates/    # Flask-ready HTML views for all portals
```

---

## 🚀 Getting Started

To run this application via Flask:

**1. Clone the repository**
```bash
git clone https://github.com/your-username/ScholarSetu.git
cd ScholarSetu
```

**2. Setup your Backend (Flask Example)**
Ensure your `app.py` renders the templates within the directory correctly using:
```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
```

**3. Run the application**
```bash
python app.py
```

---

## 🤝 Contribution

We welcome contributions to make the scholarship process easier for every student across the nation. Feel free to open issues or submit pull requests. Let's build a brighter future, together!
