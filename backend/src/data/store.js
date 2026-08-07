// American Fitness Gym - Comprehensive Data Store & Seed Database

const membershipPlans = [
  {
    id: 'basic-plan',
    name: 'Basic Gym Access',
    tier: 'basic',
    monthlyPrice: 29,
    annualPrice: 24,
    badge: 'STARTER',
    description: 'Perfect for independent training with full access to gym floor and cardio equipment.',
    popular: false,
    features: [
      'Access to Main Weight Floor & Cardio Deck',
      'Locker Room & Shower Access',
      'Free Initial Fitness Assessment',
      '24/7 Facility Access Keycard',
      'Mobile App Workout Tracking'
    ],
    ctaText: 'Get Started'
  },
  {
    id: 'pro-plan',
    name: 'Pro Athlete',
    tier: 'pro',
    monthlyPrice: 59,
    annualPrice: 49,
    badge: 'MOST POPULAR',
    description: 'The complete athletic package including unlimited facility zones and recovery spa.',
    popular: true,
    features: [
      'Everything in Basic Plan',
      'Steam Room, Sauna & Hydromassage Spa',
      '1 Free Monthly Fitness Coaching Consultation',
      'Guest Pass (2 Guests per month)',
      'Free Smoothie at Fuel Bar on Sign-up'
    ],
    ctaText: 'Claim Pro Membership'
  },
  {
    id: 'vip-plan',
    name: 'VIP Elite',
    tier: 'vip',
    monthlyPrice: 99,
    annualPrice: 84,
    badge: 'VIP ELITE',
    description: 'All-inclusive premium experience with dedicated coach, private lockers, and custom nutrition.',
    popular: false,
    features: [
      'Everything in Pro Plan',
      '2 Monthly 1-on-1 Personal Coaching Sessions',
      'Customized Meal & Supplement Blueprint',
      'Permanent Reserved VIP Locker & Towel Service',
      'Unlimited Guest Passes (1 Guest every visit)',
      '15% Off All Gym Merchandise & Supplements'
    ],
    ctaText: 'Join VIP Elite'
  }
];

const facilities = [
  {
    id: 'free-weights',
    name: 'Olympic Free Weight Arena',
    category: 'Weights',
    description: 'Over 15,000 sq. ft. equipped with Rogue power racks, Eleiko bumper plates, dumbbells up to 150 lbs, and competition bench platforms.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    specs: ['12 Rogue Power Racks', 'Dumbbells 5 lbs - 150 lbs', 'Deadlift Platforms with Calibrated Plates']
  },
  {
    id: 'cardio-deck',
    name: 'High-Tech Cardio Deck',
    category: 'Cardio',
    description: 'Custom Woodway treadmills, Assault AirBikes, Concept2 Rowers, and StairMasters equipped with 4K touchscreens and heart-rate telemetry.',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
    specs: ['25 Woodway Curve Treadmills', '10 Concept2 Ergometers', 'Assault AirBikes & SkiErgs']
  },
  {
    id: 'fuel-bar',
    name: 'Organic Fuel & Smoothie Bar',
    category: 'Nutrition',
    description: 'On-site nutrition hub crafting cold-pressed juices, whey/plant protein shakes, pre-workout energy shots, and macro-balanced gourmet meals.',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    specs: ['100% Organic Whey & Vegan Protein', 'Custom Pre/Post Workout Blends', 'Fresh Meal Prep Grab & Go']
  }
];

const blogPosts = [
  {
    id: 'hypertrophy-guide-2026',
    title: 'The Ultimate Guide to Hypertrophy: Building Lean Muscle Mass',
    category: 'Workouts',
    author: 'Marcus Vance',
    date: 'July 15, 2026',
    readTime: '6 min read',
    summary: 'Discover the science of mechanical tension, metabolic stress, and progressive overload to maximize muscle growth efficiency.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    content: `
      Building muscular hypertrophy requires more than just lifting heavy weights. It requires a strategic balance of mechanical tension, muscle damage, and metabolic stress.

      ### 1. Progressive Overload
      The fundamental driver of muscle growth is progressive overload. Increase the weight, reps, or control tempo over time to continuously force adaptation.

      ### 2. Optimal Volume & Frequency
      Research shows that 10 to 20 working sets per muscle group per week yields optimal hypertrophy for most lifters.

      ### 3. Nutrition & Sleep
      Muscle is built outside the gym. Consume 1.6 - 2.2g of protein per kg of bodyweight daily and prioritize 7 to 9 hours of deep sleep.
    `
  },
  {
    id: 'post-workout-recovery-hacks',
    title: '5 Post-Workout Recovery Strategies backed by Sports Science',
    category: 'Recovery',
    author: 'Chloe Bennett',
    date: 'July 10, 2026',
    readTime: '4 min read',
    summary: 'Learn why cold plunges, sauna thermal therapy, and active mobility routines accelerate muscular repair and reduce soreness.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    content: `
      Optimizing recovery allows you to train with higher intensity and frequency while preventing burnout.

      ### Key Recovery Pillar: Contrast Water Therapy
      Alternating between the Finnish sauna and cold plunge tub stimulates vasodilation and vasoconstriction, flushing out metabolic waste and reducing inflammation.
    `
  },
  {
    id: 'protein-timing-nutrition',
    title: 'Nutrition Myth-Busting: Does the Anabolic Window Really Exist?',
    category: 'Nutrition',
    author: 'Elena Rostova',
    date: 'July 02, 2026',
    readTime: '5 min read',
    summary: 'We dive deep into scientific studies regarding post-workout nutrient timing, daily protein totals, and meal distribution.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    content: `
      The infamous "30-minute anabolic window" has been widely misunderstood. While consuming protein post-workout is beneficial, total daily protein intake is far more critical for muscle synthesis than hyper-precise timing.
    `
  }
];

const classes = [
  {
    id: 'cls_hiit_01',
    title: 'Metabolic HIIT Inferno',
    category: 'HIIT',
    intensity: 'High',
    duration: '45 mins',
    trainer: 'Marcus Vance',
    timeSlot: '07:00 AM - 07:45 AM',
    scheduleDays: ['Monday', 'Wednesday', 'Friday'],
    room: 'Studio A (Performance Zone)',
    capacity: 20,
    spotsLeft: 4,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    description: 'High-intensity interval training combining kettlebells, air bikes, and plyometrics to spike your metabolic rate and ignite fat burn for 24 hours.'
  },
  {
    id: 'cls_strength_02',
    title: 'Olympic Barbell & Strength Masterclass',
    category: 'Strength',
    intensity: 'Elite',
    duration: '60 mins',
    trainer: 'Darius Thorne',
    timeSlot: '09:00 AM - 10:00 AM',
    scheduleDays: ['Tuesday', 'Thursday', 'Saturday'],
    room: 'Heavy Iron Arena',
    capacity: 15,
    spotsLeft: 3,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    description: 'Master compound movements: Squat, Bench Press, Deadlift, and Clean & Jerk under expert strength biomechanics coaching.'
  },
  {
    id: 'cls_boxing_03',
    title: 'Championship Boxing Conditioning',
    category: 'Boxing',
    intensity: 'High',
    duration: '50 mins',
    trainer: 'Elena Rostova',
    timeSlot: '05:30 PM - 06:20 PM',
    scheduleDays: ['Monday', 'Tuesday', 'Thursday'],
    room: 'Combat Boxing Ring',
    capacity: 16,
    spotsLeft: 6,
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy bag drills, speed work, footwork agility, and core conditioning designed by professional fight coaches.'
  },
  {
    id: 'cls_yoga_04',
    title: 'Thermal Infrared Recovery Yoga',
    category: 'Yoga',
    intensity: 'Moderate',
    duration: '60 mins',
    trainer: 'Chloe Bennett',
    timeSlot: '06:30 PM - 07:30 PM',
    scheduleDays: ['Wednesday', 'Friday', 'Sunday'],
    room: 'Zen Mind & Body Studio',
    capacity: 25,
    spotsLeft: 9,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    description: 'Deep tissue myofascial release, dynamic stretching, and mindful breathwork in a warm infrared-heated sanctuary.'
  },
  {
    id: 'cls_crossfit_05',
    title: 'CrossFit WOD & Tactical Endurance',
    category: 'CrossFit',
    intensity: 'Extreme',
    duration: '60 mins',
    trainer: 'Marcus Vance',
    timeSlot: '06:00 AM - 07:00 AM',
    scheduleDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    room: 'The Pit / Rig Zone',
    capacity: 18,
    spotsLeft: 2,
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    description: 'Workout of the Day involving Olympic lifts, gymnastics rings, rope climbs, and tactical endurance circuits.'
  }
];

const users = [
  {
    id: 'usr_demo_1',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    password: 'password123',
    phone: '(555) 234-5678',
    membershipPlan: 'Pro Athlete',
    role: 'user',
    status: 'ACTIVE_MEMBER',
    joinedDate: '2026-01-15',
    qrCode: 'AFG-QR-984102-ALEX',
    emergencyContact: 'Sarah Morgan (555-987-6543)',
    fitnessGoal: 'Hypertrophy & Conditioning',
    totalCheckIns: 42,
    rewardPoints: 1250,
    workoutStreakDays: 5
  },
  {
    id: 'usr_admin_1',
    fullName: 'Admin Officer',
    email: 'admin@americanfitness.com',
    password: 'admin123',
    phone: '(555) 999-0000',
    membershipPlan: 'Staff Admin',
    role: 'admin',
    status: 'ACTIVE_MEMBER',
    joinedDate: '2026-01-01',
    qrCode: 'AFG-QR-ADMIN-001',
    emergencyContact: 'HQ Security',
    fitnessGoal: 'Facility Management',
    totalCheckIns: 100,
    rewardPoints: 5000,
    workoutStreakDays: 30
  }
];

// In-Memory Storage for Submissions & Bookings
const contactLeads = [];
const trialPassRequests = [];
const classBookings = [
  {
    id: 'bk_101',
    userId: 'usr_demo_1',
    userEmail: 'alex.morgan@example.com',
    classId: 'cls_hiit_01',
    className: 'Metabolic HIIT Inferno',
    trainer: 'Marcus Vance',
    timeSlot: '07:00 AM - 07:45 AM',
    date: '2026-07-24',
    day: 'Friday',
    room: 'Studio A (Performance Zone)',
    status: 'CONFIRMED',
    bookedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'bk_102',
    userId: 'usr_demo_1',
    userEmail: 'alex.morgan@example.com',
    classId: 'cls_boxing_03',
    className: 'Championship Boxing Conditioning',
    trainer: 'Elena Rostova',
    timeSlot: '05:30 PM - 06:20 PM',
    date: '2026-07-27',
    day: 'Monday',
    room: 'Combat Boxing Ring',
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString()
  }
];

module.exports = {
  membershipPlans,
  facilities,
  blogPosts,
  classes,
  users,
  contactLeads,
  trialPassRequests,
  classBookings
};
