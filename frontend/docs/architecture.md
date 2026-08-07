# Frontend Architecture Document
## American Fitness Gym — Frontend SPA

### 1. Architecture Overview
The frontend is built as a single page application (SPA) using **React 18** and **Vite**. It communicates with the backend REST API via `src/services/api.js`.

```
[ Browser / Client Viewport ]
       │
  (React Router / View Switcher)
       │
  ├── AppContext (Auth, Member Session, Bookings)
  ├── Page Components (HomePage, ClassesPage, DashboardPage, etc.)
  └── Services (api.js with VITE_API_BASE)
       │
       ▼  HTTP REST API (JSON)
[ Express Backend API on Port 5000 ]
```

---

### 2. File Organization
```
client/
├── public/                 # Static images & icons
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar.jsx, Footer.jsx, MobileBottomBar.jsx
│   │   └── common/         # BMICalculator.jsx, Modals, ToastContainer.jsx
│   ├── pages/              # View components (HomePage, ClassesPage, DashboardPage, etc.)
│   ├── services/           # api.js (Backend HTTP REST wrapper)
│   ├── context/            # AppContext.jsx (Theme & Member state)
│   ├── index.css           # Design tokens & glassmorphic system
│   ├── App.jsx             # Top-level view routing & app state layout
│   └── main.jsx            # Entry mount point
├── .env                    # VITE_API_BASE=http://localhost:5000/api
├── package.json
└── vite.config.js
```

---

### 3. Development Commands
- Launch Dev Server: `npm run dev` (Vite on `http://localhost:5173`)
- Build Production Assets: `npm run build`
- Preview Build: `npm run preview`
