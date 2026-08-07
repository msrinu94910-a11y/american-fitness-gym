# Frontend Technical Requirements Document (TRD)
## American Fitness Gym — Frontend SPA

### 1. Stack & Dependencies
- **React**: `^18.2.0`
- **Vite**: `^5.0.0`
- **Lucide Icons**: `lucide-react`
- **Styling**: Vanilla CSS Modules / CSS Custom Properties

---

### 2. Environment Variables (.env)
```env
VITE_API_BASE=http://localhost:5000/api
```

---

### 3. Key Client-Side Workflows
- **API Wrapper (`src/services/api.js`)**: Encapsulates `fetch` calls with `headers`, token injection, and JSON error handling.
- **Auth Context (`src/context/AppContext.jsx`)**: Manages logged-in user details, auth token persistence in `localStorage`, active class bookings, and toast messages.
- **View Switcher**: Clean, lightweight client routing between Public Pages (Home, About, Classes, Memberships, Trainers, Facility, Blog, Contact) and Auth/Member Pages (Login, Register, Dashboard).
