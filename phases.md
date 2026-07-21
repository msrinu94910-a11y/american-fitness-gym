# Implementation Phases Plan
## American Fitness Gym

### Phase 1: Foundation, Full Backend REST API & All Public Pages (CURRENT OBJECTIVE)
- [ ] **Task 1.1: Environment & Project Scaffolding**
  - Setup Express backend in `server/` with API routing structure, JSON seed data, CORS, and error handlers.
  - Setup Vite + React SPA in `client/` with custom CSS design tokens, Lucide icons, glassmorphism UI system, and client-side router.
- [ ] **Task 1.2: Backend REST APIs**
  - Implement endpoints for `/api/classes`, `/api/memberships`, `/api/trainers`, `/api/facilities`, `/api/blog`, `/api/contact`, `/api/trial-pass`, `/api/bmi-calc`.
  - Add seed data for classes, trainers, membership tiers, facility gallery, blog articles, and testimonial data.
- [ ] **Task 1.3: Navigation & Footer**
  - Build responsive Navbar with sticky glass effect, active page links, mobile menu overlay, and Day Pass modal trigger.
  - Build Footer with gym operating hours, location details, quick links, and working newsletter signup.
- [ ] **Task 1.4: Public Page - Home (`/`)**
  - Hero Section with high-energy visuals, CTA buttons, and key stats counters.
  - Featured Fitness Programs cards.
  - Trainer Spotlight teaser.
  - Member Transformation & Review Slider.
  - Interactive BMI & Calorie Intake Calculator component.
- [ ] **Task 1.5: Public Page - About Us (`/about`)**
  - Gym Mission, Story, and Philosophy.
  - Core Values & Hygiene/Safety Standards breakdown.
  - Facilities timeline & accreditation badges.
- [ ] **Task 1.6: Public Page - Classes & Schedule (`/classes`)**
  - Schedule Filter by Day (Mon-Sun) and Category (HIIT, Strength, Yoga, Boxing, Cardio).
  - Class Detail Cards with duration, intensity, trainer info, and Class Reservation Modal.
- [ ] **Task 1.7: Public Page - Memberships & Pricing (`/memberships`)**
  - Billing Toggle (Monthly vs Annual with 20% discount).
  - Tier Comparison Cards (Basic, Pro Athlete, VIP Elite) with feature checklist.
  - Free 1-Day Pass Request Modal connected to backend `/api/trial-pass`.
  - FAQ Accordion with instant expand/collapse.
- [ ] **Task 1.8: Public Page - Trainers & Coaches (`/trainers`)**
  - Trainer Grid filterable by specialization.
  - Detailed Trainer Modal (Bio, Certifications, Experience) with Private Training Booking Form.
- [ ] **Task 1.9: Public Page - Facility & Amenities (`/facility`)**
  - Categorized Gallery (Weights, Cardio, Sauna, Recovery Lounge, Smoothie Bar).
  - Equipment List & Virtual Walkthrough feature cards.
- [ ] **Task 1.10: Public Page - Blog & Fitness Insights (`/blog`)**
  - Articles List filterable by tags (Nutrition, Workouts, Recovery).
  - Article Reader Modal with full content and share CTA.
- [ ] **Task 1.11: Public Page - Contact & Location (`/contact`)**
  - Working Contact Form integrated with `/api/contact`.
  - Hours of operation, direct call/email links, and interactive map card.
- [ ] **Task 1.12: End-to-End Verification & Polish**
  - Verify all public pages, modals, calculators, forms, and responsive mobile/desktop layouts.

---

### Phase 2: User Authentication & Member Portal (Next Phase)
- [ ] Member Registration & JWT Login.
- [ ] Member Dashboard & Digital Membership QR Pass.
- [ ] Class Booking History & Cancellation.

---

### Phase 3: Admin Portal & Management Analytics (Future Phase)
- [ ] Lead Management (Day Pass requests, Contact form leads).
- [ ] Class Roster & Schedule Editor.
- [ ] Revenue & Membership Analytics.
