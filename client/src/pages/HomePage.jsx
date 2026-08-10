import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Dumbbell, ShieldCheck, Trophy, Users, Clock, ArrowRight, Star, 
  Zap, CheckCircle2, HeartPulse, Sparkles, Award, Lock, Target,
  ChevronDown, ChevronUp, Calendar, Activity, Compass, Check, Play,
  QrCode, ArrowUpRight, ChevronRight, PhoneCall, RefreshCw
} from 'lucide-react';

export default function HomePage({ setActivePage }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [activeFaq, setActiveFaq] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroTiltRef = useRef(null);

  // 3D Mouse Tilt Effect for Hero Card
  const handleMouseMove = (e) => {
    if (!heroTiltRef.current) return;
    const rect = heroTiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    heroTiltRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleMouseLeave = () => {
    if (!heroTiltRef.current) return;
    heroTiltRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Facility Features
  const features = [
    {
      icon: Dumbbell,
      title: 'Olympic Powerlifting Arena',
      desc: '12 Rogue Monster power racks, competition Eleiko barbell sets, custom rubber dumbbells up to 150 lbs, and deadlift platforms.',
      badge: 'PRO EQUIPMENT'
    },
    {
      icon: Flame,
      title: 'Group HIIT & Boxing Studio',
      desc: 'High-intensity cardiovascular conditioning, spin arena, heavy boxing bags, and metabolic fat-burn group workouts.',
      badge: 'HIGH ENERGY'
    },
    {
      icon: HeartPulse,
      title: 'Cryotherapy & Hydro Recovery',
      desc: 'Infrared saunas, cold plunge recovery pools, and HydroMassage therapy beds for rapid muscle repair and zero soreness.',
      badge: 'LUXURY RECOVERY'
    },
    {
      icon: QrCode,
      title: '24/7 Smart Digital QR Keycard',
      desc: 'Instant gate entry using your smartphone QR code with automated attendance logging and zero waiting at turnstiles.',
      badge: '24/7 ACCESS'
    },
    {
      icon: Target,
      title: 'Custom AI Nutrition & Macros',
      desc: 'Personalized meal plans, macro breakdown algorithms, supplement guidance, and raw protein smoothie lounge.',
      badge: 'SMART NUTRITION'
    },
    {
      icon: Trophy,
      title: '1-on-1 Master Coaching',
      desc: 'CSCS certified elite personal trainers specializing in biomechanics, muscle hypertrophy, and peak athletic performance.',
      badge: 'ELITE COACHES'
    }
  ];

  // Membership Tiers
  const pricingPlans = [
    {
      name: 'Day Pass',
      priceMonthly: '$15',
      priceAnnual: '$12',
      period: 'per day',
      desc: 'Full 24-hour access pass for travelers and day visitors.',
      features: [
        'Single Day 24-Hour Access',
        'Full Weight Floor & Cardio Floor',
        'Access to Group HIIT Classes',
        'Locker Room & Sauna Access',
        'Digital QR Keycard Pass'
      ],
      popular: false,
      ctaText: 'Get Single Day Pass',
      page: 'register'
    },
    {
      name: 'Pro Athlete VIP',
      priceMonthly: '$49',
      priceAnnual: '$39',
      period: 'per month',
      desc: 'Our most popular membership for dedicated fitness enthusiasts.',
      features: [
        '24/7/365 Unlimited Gate Access',
        'Digital QR Keycard in Mobile App',
        'Unlimited Group Classes (HIIT, Boxing, Yoga)',
        '1 Free Guest Pass Per Month',
        'Recovery Suite & Sauna Access',
        '1-on-1 Fitness Assessment'
      ],
      popular: true,
      ctaText: 'Start 7-Day Free Trial',
      page: 'register'
    },
    {
      name: 'Executive Elite',
      priceMonthly: '$89',
      priceAnnual: '$69',
      period: 'per month',
      desc: 'Ultimate VIP all-access package with personal coaching included.',
      features: [
        'Everything in Pro Athlete VIP',
        '4 Monthly 1-on-1 PT Sessions',
        'Unlimited Cryotherapy & HydroMassage',
        'Priority Class Reservation',
        'Custom Macro & Nutrition Plan',
        'Complimentary VIP Locker Service'
      ],
      popular: false,
      ctaText: 'Join Executive VIP',
      page: 'register'
    }
  ];

  // Schedule Classes
  const scheduleData = {
    Mon: [
      { time: '06:00 AM', name: 'Metabolic HIIT Blast', trainer: 'Elena Rostova', category: 'HIIT', spots: 4 },
      { time: '09:00 AM', name: 'Olympic Powerlifting Cues', trainer: 'Alex Vance', category: 'Strength', spots: 2 },
      { time: '05:30 PM', name: 'Heavy Bag Boxing & Cardio', trainer: 'Elena Rostova', category: 'Boxing', spots: 6 },
      { time: '07:00 PM', name: 'Mobility & Recovery Flow', trainer: 'Dr. Marcus Cole', category: 'Recovery', spots: 8 }
    ],
    Tue: [
      { time: '07:00 AM', name: 'Vinyasa Power Yoga', trainer: 'Sophia Lin', category: 'Yoga', spots: 5 },
      { time: '10:00 AM', name: 'Hypertrophy Upper Body', trainer: 'Alex Vance', category: 'Strength', spots: 3 },
      { time: '06:00 PM', name: 'CrossFit WOD Challenge', trainer: 'Marcus Cole', category: 'CrossFit', spots: 2 }
    ],
    Wed: [
      { time: '06:00 AM', name: 'Metabolic HIIT Blast', trainer: 'Elena Rostova', category: 'HIIT', spots: 3 },
      { time: '12:00 PM', name: 'Core & Endurance Express', trainer: 'Sophia Lin', category: 'Core', spots: 7 },
      { time: '06:30 PM', name: 'Heavy Bag Boxing & Cardio', trainer: 'Elena Rostova', category: 'Boxing', spots: 4 }
    ],
    Thu: [
      { time: '07:30 AM', name: 'Deadlift & Squat Mechanics', trainer: 'Alex Vance', category: 'Strength', spots: 1 },
      { time: '05:00 PM', name: 'Functional Fitness Circuit', trainer: 'Dr. Marcus Cole', category: 'Circuit', spots: 5 }
    ],
    Fri: [
      { time: '06:00 AM', name: 'Friday Night Shred HIIT', trainer: 'Elena Rostova', category: 'HIIT', spots: 6 },
      { time: '05:30 PM', name: 'Powerlifting Max Velocity', trainer: 'Alex Vance', category: 'Strength', spots: 4 }
    ],
    Sat: [
      { time: '08:00 AM', name: 'Weekend Warrior Bootcamp', trainer: 'Elena Rostova', category: 'Bootcamp', spots: 8 },
      { time: '10:30 AM', name: 'Full Body Mobility Flow', trainer: 'Dr. Marcus Cole', category: 'Recovery', spots: 10 }
    ],
    Sun: [
      { time: '09:00 AM', name: 'Sunday Recovery Cryo & Stretch', trainer: 'Dr. Marcus Cole', category: 'Recovery', spots: 12 }
    ]
  };

  // Master Trainers
  const trainers = [
    {
      name: 'Alex Vance',
      role: 'Head Strength & Conditioning Director',
      credentials: 'B.S. Exercise Science, CSCS, USAW Level 2',
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
      spec: 'Powerlifting & Biomechanics',
      bio: 'Over 12 years coaching national powerlifters and collegiate athletes. Specializes in bar-path velocity optimization.'
    },
    {
      name: 'Elena Rostova',
      role: 'Head Boxing & HIIT Specialist',
      credentials: 'USA Boxing Certified Coach, NASM CPT, FMS Level 2',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=400&q=80',
      spec: 'Boxing & High-Intensity Conditioning',
      bio: 'Former competitive boxer and master HIIT instructor. Specializes in explosive power and metabolic fat burn.'
    },
    {
      name: 'Dr. Marcus Cole',
      role: 'Physical Therapy & Rehabilitation Director',
      credentials: 'Doctor of Physical Therapy (DPT), CSCS, FRCms',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      spec: 'Post-Rehab & Joint Biomechanics',
      bio: 'Specializing in orthopedic musculoskeletal therapy, Dr. Marcus oversees strength rehab protocols and joint mobility routines.'
    }
  ];

  // Success Stories
  const successStories = [
    {
      name: 'Marcus Thorne',
      duration: '6 Months Program',
      stats: 'Lost 34 lbs Fat • Gained 12 lbs Muscle',
      review: 'American Fitness completely transformed my lifestyle. The 24/7 keycard access means I can train at 5 AM before work with zero hassle.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 5
    },
    {
      name: 'Sarah Jenkins',
      duration: '4 Months Program',
      stats: 'Squat +85 lbs • Deadlift +110 lbs',
      review: 'The Rogue Monster power racks and coaching from Alex Vance helped me break all my personal strength records safety and consistently.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      rating: 5
    },
    {
      name: 'David Kalu',
      duration: '8 Months Program',
      stats: 'Lost 45 lbs • Body Fat 22% ➔ 11%',
      review: 'The HIIT classes with Elena Rostova are world class! The digital QR code pass on my phone makes entering the gym seamless.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 5
    }
  ];

  // FAQ Items
  const homeFaqs = [
    {
      q: 'How does the encrypted 24/7 digital keycard access work?',
      a: 'Upon joining, members receive instant digital keycard credentials inside the American Fitness mobile app. Simply tap your phone QR code at our turnstile scanners for secure 24/7/365 facility access, even during off-peak holidays.'
    },
    {
      q: 'What specific equipment is installed on the 20,000 sq. ft. weight floor?',
      a: 'Our main weight arena features 12 Rogue Monster power racks, competition Eleiko barbell sets, custom rubber dumbbells ranging from 5 lbs up to 150 lbs, Woodway slat-belt treadmills, Concept2 rowers/SkiErgs, and Arsenal Strength pin-selected machines.'
    },
    {
      q: 'Are group fitness classes included in my membership?',
      a: 'Yes! Both Pro Athlete VIP and Executive Elite plans include 100% unlimited access to all daily group classes (Metabolic HIIT, Heavy Bag Boxing, Power Yoga, Spin, and CrossFit WODs).'
    },
    {
      q: 'Can I request a 7-day free trial pass before committing?',
      a: 'Absolutely! Click the "Claim 7-Day Free VIP Pass" button anywhere on our site to activate your 7-day scannable trial pass immediately.'
    }
  ];

  return (
    <div className="home-page" style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Ambient Orbs */}
      <div className="antigravity-hero-bg" />
      <div className="antigravity-hero-bg-2" />

      {/* SECTION 1: HERO BANNER */}
      <section className="section-padding hero-section" style={{ paddingTop: '5rem', paddingBottom: '4rem', position: 'relative' }}>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            
            {/* Hero Left Content */}
            <div className="scroll-reveal ag-entrance ag-delay-1">
              <div 
                className="floating-element"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '0.45rem 1.1rem', 
                  background: 'rgba(245, 158, 11, 0.12)', 
                  border: '1px solid rgba(245, 158, 11, 0.4)', 
                  borderRadius: 'var(--radius-full)', 
                  color: '#fbbf24', 
                  fontSize: '0.82rem', 
                  fontWeight: 800, 
                  letterSpacing: '0.06em', 
                  marginBottom: '1.25rem',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
                }}
              >
                <span className="pulse-beacon" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                <span>24/7 ULTRA-MODERN FITNESS ARENA • NOW OPEN</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, fontFamily: 'var(--font-heading)', margin: '0 0 1.25rem 0', color: '#ffffff' }}>
                BUILD YOUR LEGACY. <br />
                <span style={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #38bdf8 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}>
                  ELEVATE PEAK PERFORMANCE.
                </span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.65, maxWidth: '580px', marginBottom: '2rem' }}>
                Experience 20,000+ sq ft of Olympic powerlifting platforms, AI biomechanics coaching, luxury cryotherapy suites, and instant 24/7 scannable digital keycard access.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => setActivePage('register')}
                  className="btn btn-primary pulse-button"
                  style={{ 
                    padding: '0.95rem 1.8rem', 
                    fontSize: '1rem', 
                    fontWeight: 900, 
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(217, 119, 6, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <Flame size={20} /> Claim 7-Day Free VIP Pass
                </button>

                <button 
                  onClick={() => setActivePage('admin-scanner')}
                  className="btn glass-card"
                  style={{ 
                    padding: '0.95rem 1.5rem', 
                    fontSize: '0.95rem', 
                    fontWeight: 800, 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    border: '1px solid rgba(245, 158, 11, 0.4)', 
                    color: '#fbbf24', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <QrCode size={20} /> 📷 Open QR Scanner
                </button>
              </div>

              {/* Live Guarantee Badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={18} color="#10b981" /> No Contract Required
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Zap size={18} color="#f59e0b" /> Instant App Access
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Award size={18} color="#38bdf8" /> 100% Certified Trainers
                </div>
              </div>

            </div>

            {/* Hero Right Interactive 3D Card */}
            <div 
              className="scroll-reveal ag-entrance ag-delay-2 ag-tilt-card"
              ref={heroTiltRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ position: 'relative' }}
            >
              <div className="glass-card" style={{ 
                padding: '2.5rem', 
                background: 'radial-gradient(circle at 75% 25%, #1e293b 0%, #0f172a 100%)', 
                borderRadius: 'var(--radius-lg)', 
                border: '2px solid rgba(245, 158, 11, 0.4)', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(245, 158, 11, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f59e0b', textTransform: 'uppercase' }}>
                    AMERICAN FITNESS ARENA
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    VIP DIGITAL ACCESS
                  </span>
                </div>

                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" 
                  alt="American Fitness Main Arena"
                  style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                />

                {/* Hero Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>15,000+</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Active VIP Members</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>20,000 Sq Ft</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Olympic Weight Floor</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>50+ Master</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Certified Trainers</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-heading)' }}>24/7/365</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>Digital QR Gate Access</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: FACILITY FEATURES & AMENITIES */}
      <section className="section-padding" style={{ background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="text-center scroll-reveal" style={{ maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              WORLD-CLASS AMENITIES
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              DESIGNED FOR UNCOMPROMISING ATHLETES
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem' }}>
              Everything you need to sculpt your ideal physique, break personal records, and recover faster.
            </p>
          </div>

          <div className="grid grid-3" style={{ gap: '1.5rem' }}>
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx}
                  className="glass-card scroll-reveal" 
                  style={{ 
                    padding: '2rem', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={24} color="#f59e0b" />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: '#cbd5e1', letterSpacing: '0.06em' }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE MEMBERSHIP PRICING */}
      <section className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center scroll-reveal" style={{ maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              TRANSPARENT PRICING
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              CHOOSE YOUR VIP FITNESS TIER
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '1.75rem' }}>
              No hidden fees, no annual lock-in contracts. Cancel or upgrade anytime with 1-click.
            </p>

            {/* Billing Cycle Toggle */}
            <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.5)', padding: '0.3rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                onClick={() => setBillingCycle('monthly')}
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: 'var(--radius-full)', 
                  border: 'none', 
                  background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
                  color: billingCycle === 'monthly' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                Monthly Billing
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: 'var(--radius-full)', 
                  border: 'none', 
                  background: billingCycle === 'annual' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
                  color: billingCycle === 'annual' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                Annual Billing <span style={{ color: '#10b981', fontWeight: 800 }}>(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'stretch' }}>
            {pricingPlans.map((plan, idx) => {
              const displayPrice = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div 
                  key={idx}
                  className="glass-card scroll-reveal"
                  style={{
                    padding: '2.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: plan.popular ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
                    background: plan.popular ? 'linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)' : 'rgba(15, 23, 42, 0.6)',
                    boxShadow: plan.popular ? '0 15px 40px rgba(245, 158, 11, 0.25)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    position: 'relative'
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, padding: '0.25rem 0.9rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.08em', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
                      {plan.name}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.84rem', minHeight: '40px', marginBottom: '1.25rem' }}>
                      {plan.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.75rem' }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                        {displayPrice}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{plan.period}</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                          <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setActivePage(plan.page)}
                    className="btn"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      background: plan.popular ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      boxShadow: plan.popular ? '0 6px 20px rgba(217,119,6,0.35)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE CLASS SCHEDULE MATRIX */}
      <section className="section-padding" style={{ background: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="text-center scroll-reveal" style={{ maxWidth: '650px', margin: '0 auto 2rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              DAILY GROUP CLASSES
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              WEEKLY LIVE TRAINING SCHEDULE
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem' }}>
              Select any day of the week to view live classes and reserve your spot instantly.
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {Object.keys(scheduleData).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedDay === day ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedDay === day ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'rgba(15,23,42,0.6)',
                  color: selectedDay === day ? '#ffffff' : '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Cards Grid */}
          <div className="grid grid-2" style={{ gap: '1.25rem' }}>
            {scheduleData[selectedDay].map((cls, cIdx) => (
              <div 
                key={cIdx}
                className="glass-card scroll-reveal"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.65rem 0.9rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center' }}>
                    <Clock size={16} style={{ marginBottom: '0.15rem' }} />
                    <div>{cls.time}</div>
                  </div>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginBottom: '0.2rem' }}>
                      {cls.category}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.1rem 0' }}>
                      {cls.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                      Trainer: <strong style={{ color: '#cbd5e1' }}>{cls.trainer}</strong> • <span style={{ color: '#10b981', fontWeight: 700 }}>{cls.spots} Spots Left</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActivePage('classes')}
                  className="btn"
                  style={{
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  Book Class
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: MASTER TRAINERS */}
      <section className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center scroll-reveal" style={{ maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EXPERT COACHES
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              MEET OUR PERFORMANCE DIRECTORS
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem' }}>
              CSCS certified master trainers dedicated to personalizing your training and maximizing your results.
            </p>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            {trainers.map((tr, tIdx) => (
              <div 
                key={tIdx}
                className="glass-card scroll-reveal"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <img 
                  src={tr.image} 
                  alt={tr.name} 
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {tr.role}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0 0.5rem 0' }}>
                    {tr.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {tr.credentials}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
                    {tr.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CLIENT TRANSFORMATIONS & REVIEWS */}
      <section className="section-padding" style={{ background: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="text-center scroll-reveal" style={{ maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              REAL RESULTS
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              MEMBER SUCCESS STORIES
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem' }}>
              Read verified feedback from athletes who transformed their bodies and lives at American Fitness.
            </p>
          </div>

          <div className="grid grid-3" style={{ gap: '2rem' }}>
            {successStories.map((story, sIdx) => (
              <div 
                key={sIdx}
                className="glass-card scroll-reveal"
                style={{
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img 
                      src={story.image} 
                      alt={story.name} 
                      style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {story.name}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
                        {story.duration}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.85rem' }}>
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                    ))}
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    "{story.review}"
                  </p>
                </div>

                <div style={{ padding: '0.5rem 0.85rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', color: '#a7f3d0', fontSize: '0.78rem', fontWeight: 800, textAlign: 'center' }}>
                  ⚡ {story.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center scroll-reveal" style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', marginTop: '0.35rem', color: '#ffffff' }}>
              GOT QUESTIONS? WE HAVE ANSWERS.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {homeFaqs.map((faq, fIdx) => (
              <div 
                key={fIdx}
                className="glass-card scroll-reveal"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: activeFaq === fIdx ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  transition: 'var(--transition-fast)'
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 800,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  {activeFaq === fIdx ? <ChevronUp size={20} color="#f59e0b" /> : <ChevronDown size={20} color="#94a3b8" />}
                </button>

                {activeFaq === fIdx && (
                  <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: FULL-WIDTH CTA FOOTER BANNER */}
      <section className="section-padding" style={{ paddingBottom: '5rem' }}>
        <div className="container">
          <div className="glass-card scroll-reveal" style={{
            padding: '3.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid #f59e0b',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                <Sparkles size={16} /> READY TO UNLOCK YOUR POTENTIAL?
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '1rem' }}>
                START YOUR 7-DAY FREE TRIAL TODAY
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '2rem' }}>
                Get instant scannable digital keycard pass credentials on your phone. Zero waiting, zero commitment.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActivePage('register')}
                  className="btn btn-primary pulse-button"
                  style={{
                    padding: '1rem 2.2rem',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(217,119,6,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Claim 7-Day Free Trial Pass <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.5rem',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 6px 20px rgba(217,119,6,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99
          }}
        >
          <ChevronUp size={24} />
        </button>
      )}

    </div>
  );
}
