# Backend Architecture Document
## American Fitness Gym — Express REST API

### 1. Architecture Overview
The backend is a Node.js REST API using Express.js. It follows a modular controller-route pattern and manages persistent seed data in `src/data/store.js`.

```
[ HTTP Requests from Client (Port 5173) ]
                   │
                   ▼
  ├── Middleware (CORS, Express JSON Body Parser, Auth Handler)
  ├── Express Router (src/routes/api.js)
  ├── Controller Layer (src/controllers/apiController.js)
  └── Persistent Seed Store (src/data/store.js)
                   │
                   ▼
[ HTTP JSON Response / Error Middleware ]
```

---

### 2. File Organization
```
server/
├── src/
│   ├── controllers/
│   │   └── apiController.js   # API Handler Logic (Auth, Memberships, Classes, Leads, BMI)
│   ├── data/
│   │   └── store.js           # In-Memory Database Store (Users, Classes, Plans, Leads)
│   ├── middleware/
│   │   └── errorHandler.js    # Express Centralized Error Handler
│   ├── routes/
│   │   └── api.js             # Express Router defining REST endpoints
│   └── index.js               # Express app initialization, CORS & listener
├── .env                       # PORT=5000, CLIENT_URL=http://localhost:5173, API_PREFIX=/api
└── package.json
```

---

### 3. API Endpoints & Routes (`/api`)

#### Public Endpoints
- `GET /api/health` — System status ping.
- `POST /api/auth/register` — Register member account.
- `POST /api/auth/login` — Authenticate member session & generate auth token.
- `GET /api/memberships` — Retrieve pricing tiers and comparison matrix data.
- `GET /api/facilities` — Retrieve zone specs & photo gallery data.
- `GET /api/trainers` — Retrieve coach profiles and specializations.
- `GET /api/blog` — List articles with tag filters.
- `POST /api/contact` — Lead capture for contact inquiries.
- `POST /api/trial-pass` — Generate 1-Day Free Trial Pass lead.
- `POST /api/bmi-calc` — Server-side fitness metrics calculator endpoint.

#### Member Endpoints
- `GET /api/classes` — Fetch filterable weekly schedule & seat counts.
- `POST /api/classes/reserve` — Reserve class seat.
- `DELETE /api/classes/cancel` — Cancel class booking.
- `GET /api/user/profile` — Fetch member details & digital QR access code.

---

### 4. Data Models

#### User Model
```json
{
  "id": "usr_17000000000",
  "fullName": "Alex Morgan",
  "email": "alex.morgan@example.com",
  "phone": "(555) 234-5678",
  "membershipPlan": "Pro Athlete",
  "status": "ACTIVE_MEMBER",
  "qrCodePass": "AFG-PASS-98213-X",
  "joinedDate": "2026-01-15",
  "bookings": ["cls_hiit_01"]
}
```

#### Class Model
```json
{
  "id": "cls_hiit_01",
  "title": "High-Octane HIIT",
  "category": "HIIT",
  "day": "Monday",
  "time": "07:00 AM - 08:00 AM",
  "trainer": "Marcus Vance",
  "capacity": 20,
  "bookedCount": 14,
  "intensity": "High"
}
```
