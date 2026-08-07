# Design System & UI/UX Specifications
## American Fitness Gym

### 1. Brand Identity & Aesthetic Guidelines
American Fitness Gym features a dark, premium, energetic aesthetic engineered to evoke motivation, athletic strength, and elite prestige.

---

### 2. Color Palette (Design Tokens)
- **Background Deep**: `#090C10` (Dark obsidian carbon)
- **Card / Surface Dark**: `#121720` (Sleek dark navy-gray slate)
- **Card Border**: `rgba(255, 255, 255, 0.08)` (Glassmorphism subtle edge)
- **Primary Electric Accent**: `#FF3838` (High-energy crimson red)
- **Secondary Gradient Accent**: `linear-gradient(135deg, #FF3838 0%, #FF6B00 100%)` (Electric flame orange-red)
- **Gold Premium Accent**: `#FFB800` (Elite VIP badge color)
- **Typography Primary**: `#F8FAFC` (Crisp off-white)
- **Typography Muted**: `#94A3B8` (Slate gray body text)
- **Success / Badge Accent**: `#10B981` (Emerald green)

---

### 3. Typography
- **Headings**: `Outfit`, `Montserrat`, sans-serif (Bold, uppercase tracking, impactful)
- **Body Text**: `Inter`, `Plus Jakarta Sans`, sans-serif (Clean, highly legible)
- **Monospace / Numbers**: `JetBrains Mono` or tabular numbers for stats & pricing.

---

### 4. Interactive Components Specification
1. **Glassmorphic Sticky Header**:
   - Translucent background with `backdrop-filter: blur(16px)`.
   - Brand logo with glowing crimson accent dot.
   - Smooth navigation links with animated bottom border on hover.
   - Highlighted "Free Day Pass" button with pulse animation.

2. **Hero Banner**:
   - Dramatic background image / overlay with diagonal gradient mask.
   - High-energy tagline with gradient text clip.
   - Stat ticker cards (2.5k Members, 45+ Trainers, 24/7 Access, 99% Satisfaction).

3. **Interactive Membership Tier Switcher**:
   - Monthly vs Annual toggle (with "Save 20%" badge).
   - Card scale effect on hover & highlight for "Pro Athlete" tier.

4. **Class Schedule Filter Grid**:
   - Interactive day buttons (Mon-Sun) and workout category pills.
   - Class cards showing time, trainer, room, intensity badge, and quick reserve modal trigger.

5. **Trainer Spotlight & Detail Modal**:
   - Hover zoom effect on trainer photography.
   - Modal popup showing bio, certifications, video snippet link, and session booking form.

6. **Interactive BMI & Calorie Calculator**:
   - Inputs: Height (cm), Weight (kg), Age, Gender, Activity Level.
   - Instant calculation with BMI gauge slider, category status, and personalized recommended workout plan.

7. **Toast Notifications**:
   - Custom sleek toast alerts for successful trial pass claim, booking submission, and contact form send.
