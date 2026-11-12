# 🏛️ Chief Minister's Grievance Redressal Portal — Government of Kerala

An AI-augmented, role-based public grievance management platform designed for transparent, accountable, and time-bound grievance resolution across government departments in Kerala.

---

## 🌐 Live Deployments & Endpoints

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Portal** | Vercel | `[https://cm-kerala-grievance-portal-frontend.vercel.app](https://cm-kerala-grievance-portal-frontend.vercel.app)` |
| **Backend API** | Render | `[https://cm-kerala-api-yjw1.onrender.com](https://cm-kerala-api-yjw1.onrender.com)` |
| **Interactive API Docs** | Swagger UI | `[https://cm-kerala-api-yjw1.onrender.com/docs](https://cm-kerala-api-yjw1.onrender.com/docs)` |
| **Alternative Docs** | ReDoc | `[https://cm-kerala-api-yjw1.onrender.com/redoc](https://cm-kerala-api-yjw1.onrender.com/redoc)` |

---

## 👥 Demo Credentials

Use the following seeded accounts to test different role-based workflows:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **CMO Administrator** | `cmo.admin@kerala.gov.in` | `Admin@123` | Full portal overview, department routing, grievance escalation, private notes, cross-department analytics. |
| **Department Officer** | `pwd.officer@kerala.gov.in` | `Officer@123` | Department-specific petition triage, status lifecycle management, Action-Taken Report (ATR) submission with evidence. |
| **Citizen (Test User)** | `citizen.test@kerala.gov.in` | `Citizen@123` | Lodge grievances, upload attachments, track real-time resolution timeline, view ATR remarks. |

> **Note:** Anyone can also register as a new Citizen directly from the portal without pre-configured credentials.

---

## ⚡ Key Features

- **Multi-Role Access Control (RBAC):** Dedicated dashboards tailored specifically for Citizens, Departmental Grievance Redressal Officers (GROs), and Chief Minister's Office (CMO) Administrators.
- **AI-Powered Grievance Triage:** Integrated with **Google Gemini SDK** to analyze complaint narratives, summarize core issues, evaluate urgency/priority, and recommend accurate government department routing automatically.
- **Action-Taken Report (ATR) Workflow:** Enforces accountability by requiring department officers to submit formal resolution summaries and evidence before closing a petition.
- **Public Reference ID Tracking:** Zero-friction status checks for citizens via unique tracking references without forcing repetitive logins.
- **Interactive REST APIs:** FastAPI backend with OpenAPI 3.1 specifications, JWT authentication, and structured schema validations.

---

## 🏗️ System Architecture & Tech Stack

```text
[ Citizen / Admin Browser ]
            |
            v
 [ React + Vite + Tailwind CSS ] (Vercel)
            |
            | HTTPS / REST API / JWT
            v
  [ FastAPI + Uvicorn ] (Render Web Service)
     |               \
     | SQLAlchemy     \ Google Gemini API
     v                 v
[ SQLite / DB ]    [ AI Triage & Summarization ]

Backend
Framework: Python 3.12 / FastAPI

Database Engine: SQLite via SQLAlchemy ORM

Authentication: OAuth2 with JWT tokens (python-jose), bcrypt password hashing (passlib)

AI Integration: Google Gemini API for natural language extraction and priority scoring

Hosting: Render Web Service (bound dynamically via $PORT)

Frontend
Framework: React 18 with Vite

Styling: Tailwind CSS with responsive layout components

Routing: React Router v6 with SPA wildcard rewrites (vercel.json)

State & HTTP: Axios / Fetch API with dynamic VITE_API_BASE_URL binding

Hosting: Vercel

🚀 Local Development Setup
1. Clone the Repository
git clone https://github.com/ThomasBaby27/cm-kerala-grievance-portal.git
cd cm-kerala-grievance-portal

2. Backend Setup
cd backend
python -m venv venv

.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload --port 8000

API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

3. Frontend Setup
cd ../frontend
npm install

# Run the frontend server
npm run dev
Open http://localhost:5173 in your browser.

Security & Data Hygiene
Passwords are salted and hashed using standard bcrypt algorithms.
JWT bearer tokens validate role claims on protected endpoints.
CORS policies configured for production origins.
Sensitive environment variables (GEMINI_API_KEY, SECRET_KEY) are managed through platform secrets and excluded from source control.