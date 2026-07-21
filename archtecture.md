# System Architecture Document
## American Fitness Gym

### 1. High-Level System Architecture
American Fitness Gym follows a decoupled client-server architecture with an interactive Single Page Application (SPA) frontend and a modular Node.js/Express RESTful API backend.

```
[ Standalone Client: React + Vite + Custom Light/Dark Design System ]
                                │
                    REST API (HTTP / JSON)
                                │
                                ▼
[ Standalone Server: Node.js + Express REST API ]
   ├── /api/auth/register
   ├── /api/auth/login
   ├── /api/memberships
   ├── /api/facilities
   ├── /api/blog
   ├── /api/contact
   └── /api/trial-pass
                                │
                                ▼
[ Data Storage: Persistent In-Memory DB & Seed Data Store ]
```

---

### 2. Standalone Directory Architecture

```
american-fitness-gym/
├── client/                      # Standalone Frontend Application (React + Vite)
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   └── common/          # Modals, ToastContainer
│   │   ├── pages/               # Public & Auth Page Views
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── MembershipsPage.jsx
│   │   │   ├── FacilityPage.jsx
│   │   │   ├── BlogPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/            # API client wrapper (api.js with VITE_API_BASE)
│   │   ├── context/             # AppContext (Theme & Member Auth state)
│   │   ├── index.css            # Master Design System (Light/Dark mode)
│   │   ├── App.jsx              # Router & layout
│   │   └── main.jsx             # Entry point
│   ├── .env                     # VITE_API_BASE=http://localhost:5000/api
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Standalone Backend REST API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/         # Request Handlers (apiController.js)
│   │   ├── routes/              # Express Router (api.js)
│   │   ├── data/                # Seed Store & User Models (store.js)
│   │   ├── middleware/          # Cors & Error Handlers (errorHandler.js)
│   │   └── index.js             # Express Server Entry Point
│   ├── .env                     # PORT=5000, CLIENT_URL=http://localhost:5173
│   └── package.json
│
├── archtecture.md
├── design.md
├── phases.md
├── prd.md
├── trd.md
└── package.json
```

---

### 3. API Schema & Endpoints

#### Authentication & Public Endpoints
- `GET /api/health` -> System health check
- `POST /api/auth/register` -> Register new member account
- `POST /api/auth/login` -> Authenticate member session
- `GET /api/memberships` -> List membership pricing plans & features
- `GET /api/facilities` -> List gym equipment & zone specs
- `GET /api/blog` -> List fitness articles with tag filtering
- `POST /api/contact` -> Submit inquiry form lead
- `POST /api/trial-pass` -> Generate instant 1-Day Free Trial Pass

---

### 4. Data Models

```json
// User Model
{
  "id": "usr_17000000000",
  "fullName": "Alex Morgan",
  "email": "alex.morgan@example.com",
  "phone": "(555) 234-5678",
  "membershipPlan": "Pro Athlete",
  "status": "ACTIVE_MEMBER",
  "joinedDate": "2026-01-15"
}

// MembershipPlan Model
{
  "id": "pro-plan",
  "name": "Pro Athlete",
  "monthlyPrice": 59,
  "annualPrice": 49,
  "badge": "MOST POPULAR",
  "description": "Full access to gym & recovery spa.",
  "features": [
    "24/7 Access to all gym zones",
    "Steam Room, Sauna & Cold Plunge Spa",
    "1 Free Monthly Coaching Consultation",
    "Guest Pass (2 Guests per month)"
  ],
  "ctaText": "Claim Pro Membership"
}
```
