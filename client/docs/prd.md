# Frontend Product Requirements Document (PRD)
## American Fitness Gym — Frontend SPA

### 1. Vision & Executive Summary
American Fitness Gym frontend is an elite, responsive Single Page Application (SPA) designed with a dark, high-energy glassmorphic aesthetic. It provides prospective and active members with dynamic fitness tools, class booking capabilities, trainer showcases, and a full member portal.

---

### 2. Core Target Audience & Use Cases
- **Fitness Enthusiasts**: Browse specialized class schedules (HIIT, Boxing, Strength, Yoga), reserve class seats, and review trainer credentials.
- **New Prospects**: Claim instant 1-Day Free Day Passes, calculate BMI & daily caloric intake, and contact gym administration.
- **Active Members**: Access 24/7 digital QR membership access pass, manage active class bookings, and view membership details.

---

### 3. Frontend Features & Views

#### 1. Navigation & Layout (`src/components/layout/`)
- **Sticky Glassmorphic Header**: Translucent background (`backdrop-filter: blur(16px)`), brand logo, navigation links, and dynamic "Claim Free Day Pass" CTA button.
- **Footer**: Gym location details, operating hours, quick links, social links, and newsletter subscription form.
- **Mobile Bottom Bar**: Responsive quick navigation for mobile viewport users.

#### 2. Public Page Views (`src/pages/`)
- **Home (`HomePage.jsx`)**: Hero banner with gradient typography, live stats ticker (2.5k+ members, 45+ coaches), interactive BMI/Calorie calculator, featured workouts, trainer spotlight, and member transformation slider.
- **About (`AboutPage.jsx`)**: Mission statement, hygiene/safety standards, core values, and interactive facility milestones timeline.
- **Classes (`ClassesPage.jsx`)**: Filterable weekly schedule (Mon-Sun, workout type filters), class intensity badges, and seat reservation modal.
- **Memberships (`MembershipsPage.jsx`)**: Tier switcher (Monthly vs. Annual with 20% discount), feature comparison matrix, FAQs accordion, and Free Day Pass claim modal.
- **Trainers (`TrainersPage.jsx`)**: Filterable grid of trainers with specialization tags and booking request modal.
- **Facility (`FacilityPage.jsx`)**: Categorized photo gallery (Weights, Cardio, Sauna, Recovery Lounge) and virtual walkthrough preview.
- **Blog (`BlogPage.jsx`)**: Fitness articles filterable by categories (Nutrition, Workouts, Recovery) with full article reader modal.
- **Contact (`ContactPage.jsx`)**: Contact form with validation, direct contact CTAs, operating hours, and interactive location map.

#### 3. Member Portal Views (`src/pages/`)
- **Login (`LoginPage.jsx`)**: JWT user authentication login form.
- **Register (`RegisterPage.jsx`)**: New member registration form with plan selection.
- **Dashboard (`DashboardPage.jsx`)**: Member profile overview, digital 24/7 QR turnstile pass simulator, active class bookings list, and booking cancellation.

---

### 4. Technical Constraints
- Built with React 18+ and Vite.
- Custom CSS Design Tokens (`index.css`).
- Communication via `src/services/api.js` consuming `VITE_API_BASE` endpoint.
