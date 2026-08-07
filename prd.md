# Product Requirements Document (PRD)
## American Fitness Gym Web Application

### 1. Vision & Executive Summary
American Fitness Gym is an elite, state-of-the-art fitness center platform engineered to convert visitors into active members, showcase world-class training facilities, provide seamless class scheduling, and deliver a high-energy digital brand experience.

---

### 2. Core Target Audience
- **Fitness Enthusiasts & Athletes**: Looking for high-end equipment, specialized classes (HIIT, Boxing, Functional Training), and expert personal coaching.
- **Beginners & Lifestyle Changers**: Looking for structured guidance, friendly atmosphere, transformation plans, and free trial passes.
- **Busy Professionals**: Requiring 24/7 access, convenient online class booking, and efficient workout routines.

---

### 3. Comprehensive Feature Requirements by Phase

#### Phase 1: Public Web Experience & Backing REST APIs (Current Objective)
1. **Global Navigation & Footer**
   - Glassmorphic sticky Navbar with brand logo, quick navigation links, mobile drawer navigation, and "Claim Free Day Pass" CTA button.
   - Comprehensive Footer with gym location, operating hours, quick links, newsletter subscription, and social media handles.
2. **Home Page (`/`)**
   - **Hero Section**: Dramatic high-impact hero with action-driven tagline ("Transform Your Body, Unleash Your Potential"), video/image showcase, and primary CTAs.
   - **Live Gym Stats**: Dynamic counters (e.g., 2,500+ Active Members, 45+ Certified Trainers, 60+ Weekly Classes, 24/7 Access).
   - **Featured Programs & Classes**: Interactive cards detailing popular workouts.
   - **Trainer Spotlight**: Showcase top elite coaches with quick bio and specialization tags.
   - **Member Transformations**: Before/After interactive slider and video/written testimonials.
   - **Interactive Fitness Tools**: Built-in BMI & Daily Caloric Intake Calculator.
3. **About Us Page (`/about`)**
   - Gym story, mission statement, and core values (Excellence, Community, Discipline, Innovation).
   - Health, Hygiene, and Safety standards breakdown.
   - Interactive Facility Timeline / Milestones.
4. **Classes & Schedule Page (`/classes`)**
   - Complete Weekly Class Schedule filterable by day and workout type (HIIT, Strength, Cardio, Yoga, Boxing).
   - Class detail view/modal showing intensity rating, trainer, duration, room location, and calories burned.
   - Instant "Reserve Seat / Class Inquiry" modal connected to the backend.
5. **Memberships & Pricing Page (`/memberships`)**
   - Tiered Pricing Cards (Basic, Pro, Elite VIP) with Monthly vs Annual billing discount toggle.
   - Interactive Plan Features comparison matrix.
   - Free 1-Day Trial Pass claim modal with backend lead capture.
   - Interactive FAQ Accordion answering common membership questions.
6. **Trainers & Personal Coaching Page (`/trainers`)**
   - Filterable trainer grid by discipline (Bodybuilding, Functional, Cardio, Boxing, Yoga).
   - Detailed Trainer Modal with bio, experience level, achievements, and "Book Private Session" form.
7. **Facility & Amenities Page (`/facility`)**
   - Categorized photo gallery (Weight Floor, Cardio Deck, Sauna & Steam Room, Recovery Lounge, Smoothie Bar).
   - Interactive equipment list and virtual walkthrough preview.
8. **Blog & Fitness Insights Page (`/blog`)**
   - Articles on workout routines, nutrition, supplements, and recovery.
   - Read Article modal / reader with search and category tags.
9. **Contact & Location Page (`/contact`)**
   - Contact form with client validation and backend API persistence.
   - Operating hours display, direct call/email action buttons, and interactive Google Map location widget.

#### Phase 2: Member Portal & Authentication (Future Phase)
- User Authentication (JWT, Register/Login, Password Reset).
- Member Dashboard (Profile, Active Plan QR Digital Membership Pass, Workout History, Class Bookings).
- Online Payment Integration (Stripe/PayPal integration for membership subscriptions).

#### Phase 3: Admin Management Portal (Future Phase)
- Admin Dashboard (Member roster, Lead management for day pass requests, Class schedule manager, Revenue analytics).

---

### 4. Non-Functional Requirements
- **Performance**: Initial load under 1.5 seconds; 60fps UI animations.
- **Responsiveness**: Mobile-first architecture supporting mobile (320px+), tablet, and 4K desktop viewports.
- **Accessibility**: High contrast dark theme adhering to WCAG 2.1 AA standards with keyboard navigation support.
