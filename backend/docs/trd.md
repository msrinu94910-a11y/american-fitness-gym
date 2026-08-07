# Backend Technical Requirements Document (TRD)
## American Fitness Gym — Express REST API

### 1. Technology Requirements
- **Node.js**: `v18.0.0+`
- **Express Framework**: `^4.18.2`
- **CORS**: `^2.8.5` (Configured for `http://localhost:5173`)
- **Protocol**: HTTP/1.1 RESTful JSON

---

### 2. Environment Configuration (`.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_PREFIX=/api
APP_NAME=American Fitness Gym API
```

---

### 3. Server Execution Commands
- Development Mode: `npm run dev` (Runs Node server on Port 5000)
- Production Start: `npm start` (`node src/index.js`)

---

### 4. Error Handling Strategy
Centralized error handling middleware in `src/middleware/errorHandler.js` returns formatted JSON errors:
```json
{
  "error": true,
  "message": "Detailed error description message",
  "timestamp": "2026-08-06T14:28:21Z"
}
```
