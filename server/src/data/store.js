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
    id: 'recovery-spa',
    name: 'Therapeutic Sauna & Cryo Spa',
    category: 'Recovery',
    description: 'Finnish cedarwood sauna, eucalyptus steam room, cold plunge tubs (50°F), and hydromassage loungers for post-workout muscular recovery.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    specs: ['Finnish Sauna (190°F)', 'Cold Plunge Ice Bath', 'Normatec Compression Boots Room']
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

// Seed Registered Users
const users = [
  {
    id: 'usr_demo_1',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    password: 'password123',
    phone: '(555) 234-5678',
    membershipPlan: 'Pro Athlete',
    status: 'ACTIVE_MEMBER',
    joinedDate: '2026-01-15'
  }
];

// In-Memory Storage for Submissions
const contactLeads = [];
const trialPassRequests = [];

module.exports = {
  membershipPlans,
  facilities,
  blogPosts,
  users,
  contactLeads,
  trialPassRequests
};
