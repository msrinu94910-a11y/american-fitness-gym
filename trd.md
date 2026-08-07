# Technical Requirements Document (TRD)
## American Fitness Gym

### 1. Technology Stack Requirements
- **Frontend Framework**: React 18+ powered by Vite (Fast HMR, optimized production build).
- **Icons**: Lucide React icons.
- **Styling Strategy**:
  - CSS custom properties (Design Tokens for colors, glassmorphism, gradients, typography).
  - Modern layout: CSS Grid & Flexbox, micro-animations with standard CSS transitions/keyframes.
- **Backend Runtime**: Node.js v18+.
- **Backend Framework**: Express.js (v4.18+).
- **Communication Protocol**: RESTful JSON over HTTP with CORS middleware.
- **Development Tooling**: Concurrent client and server execution via npm scripts.

---

### 2. Environment Variables (.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_PREFIX=/api
APP_NAME=American Fitness Gym
```

---

### 3. Build & Execution Scripts
- Client: `npm run dev` (Vite dev server on port 5173).
- Server: `npm run dev` / `node index.js` (Express API server on port 5000).
- Root command: `npm run dev` (using `concurrently` to launch both frontend and backend).

---

### 4. Browser & Performance Metrics
- Core Web Vitals: Largest Contentful Paint (LCP) < 2.0s, First Input Delay (FID) < 100ms, Cumulative Layout Shift (CLS) < 0.1.
- Supported Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).
