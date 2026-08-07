# Backend Product Requirements Document (PRD)
## American Fitness Gym — REST API Server

### 1. Overview
The backend server provides a secure, high-performance RESTful API powering the American Fitness Gym web application. It manages authentication, member accounts, day pass leads, trainer rosters, blog articles, and weekly class seat allocations.

---

### 2. Core API Responsibilities
1. **Authentication & Session Management**:
   - Register member accounts with validation.
   - Login authentication and token verification.
2. **Membership & Leads Management**:
   - Serve membership tiers, pricing plans, and plan features.
   - Capture contact form submissions and generate 1-Day Trial Passes.
3. **Class Schedule & Reservation Engine**:
   - Serve filterable weekly schedule by day and workout type.
   - Seat booking transaction handling with capacity limits.
   - Reservation cancellation and seat release logic.
4. **Member Profile & Digital Access Pass**:
   - Provide active profile stats and 24/7 QR Access Pass tokens.
