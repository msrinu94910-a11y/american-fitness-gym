# Frontend Design System & UI/UX Specifications
## American Fitness Gym — Frontend SPA

### 1. Aesthetic Direction
American Fitness Gym features a dark obsidian carbon, high-energy crimson design system built with custom CSS variables, glassmorphic card overlays, dynamic gradients, and smooth micro-animations.

---

### 2. Design Tokens (`src/index.css`)
```css
:root {
  --bg-deep: #090C10;                  /* Dark obsidian carbon background */
  --card-dark: #121720;                /* Sleek dark navy-gray card surface */
  --card-border: rgba(255, 255, 255, 0.08); /* Glassmorphic subtle border */
  --primary-red: #FF3838;              /* High-energy crimson red */
  --accent-gradient: linear-gradient(135deg, #FF3838 0%, #FF6B00 100%); /* Flame orange-red */
  --gold-accent: #FFB800;              /* Elite VIP badge color */
  --text-primary: #F8FAFC;             /* Off-white text */
  --text-muted: #94A3B8;               /* Slate gray body text */
  --success-green: #10B981;            /* Active status & badge green */
}
```

---

### 3. Typography Hierarchy
- **Headings (H1 - H4)**: `Outfit`, `Montserrat`, sans-serif (uppercase tracking, bold impact).
- **Body Text**: `Inter`, `Plus Jakarta Sans`, sans-serif (clean readability).
- **Numbers / Metrics**: `JetBrains Mono` for stat counters, pricing, and timing.

---

### 4. Interactive Components & Micro-Interactions
1. **Glassmorphic Sticky Header**:
   - `backdrop-filter: blur(16px)` background.
   - Hover line animation on nav links.
   - Pulse animation on the Day Pass CTA button.
2. **Interactive BMI & Calorie Calculator**:
   - Dynamic real-time calculation slider with BMI gauges (Underweight, Normal, Overweight, Obese).
   - Personalized workout recommendation cards.
3. **Membership Pricing Switcher**:
   - Monthly vs Annual toggle switch with "Save 20%" floating badge.
   - Card scale and hover glow effects.
4. **Toast Notifications**:
   - Floating notification alerts for form submissions, class bookings, and day pass claims.
