import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Dumbbell, ShieldCheck, Trophy, Users, Clock, ArrowRight, Star, 
  Zap, CheckCircle2, HeartPulse, Sparkles, Award, Coffee, Lock, Target,
  ChevronDown, ChevronUp, Calendar, Activity, Compass, Check, Play, Pause
} from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function HomePage({ setActivePage }) {
  const { cmsData } = useApp();
  const hp = cmsData?.homepage || {};
  const [activeFaq, setActiveFaq] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroTiltRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroTiltRef.current) return;
    const rect = heroTiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 22;
    const y = (e.clientY - rect.top - rect.height / 2) / 22;
    heroTiltRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.02, 1.02, 1.02)`;
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

  const trainers = [
    {
      name: 'Alex Vance',
      role: 'Head Strength & Conditioning Director',
      credentials: 'B.S. Exercise Science, CSCS, USA Weightlifting Level 2',
      image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
      spec: 'Powerlifting & Biomechanics',
      bio: 'Over 12 years experience coaching national powerlifters and collegiate athletes. Alex specializes in bar-path velocity optimization and injury-prevention squat cues.'
    },
    {
      name: 'Elena Rostova',
      role: 'Head Boxing & HIIT Specialist',
      credentials: 'USA Boxing Certified Coach, NASM CPT, FMS Level 2',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=400&q=80',
      spec: 'Boxing & High-Intensity Conditioning',
      bio: 'Former competitive boxer and master HIIT instructor. Elena specializes in explosive power development, speed footwork drills, and metabolic fat-burn protocols.'
    },
    {
      name: 'Dr. Marcus Cole',
      role: 'Physical Therapy & Rehabilitation Director',
      credentials: 'Doctor of Physical Therapy (DPT), CSCS, FRCms',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      spec: 'Post-Rehab & Biomechanics',
      bio: 'Specializing in orthopedic musculoskeletal therapy, Dr. Marcus oversees our strength rehabilitation protocols and joint mobility routines.'
    }
  ];

  const homeFaqs = [
    {
      q: 'How does the encrypted 24/7 digital keycard access work?',
      a: 'Upon joining, members receive instant digital keycard credentials inside the American Fitness mobile app (as well as an optional physical RFID keycard). Simply tap your phone at our turnstile scanners for secure 24/7/365 facility access, even during off-peak holidays.'
    },
    {
      q: 'What specific equipment is installed on the 20,000 sq. ft. weight floor?',
      a: 'Our main weight arena features 12 Rogue Monster power racks, competition Eleiko barbell sets, custom rubber dumbbells ranging from 5 lbs up to 150 lbs, Woodway slat-belt treadmills, Concept2 rowers/SkiErgs, and Arsenal Strength pin-selected machines.'
    },
    {
      q: 'How do the Organic Fuel Bar and nutrition perks work?',
      a: 'Pro Athlete and VIP Elite members receive discounts and complimentary credits at our on-site Organic Fuel Bar. Enjoy fresh grass-fed whey smoothies, pre-workout energy shots, organic cold brews, and macro-balanced gourmet meal prep containers.'
    },
    {
      q: 'Can I claim a free 1-Day Trial Pass before purchasing a membership?',
      a: 'Yes! Click "Claim Free 1-Day Pass" on our website or mobile app to generate an instant single-day keycard access code and experience our 20,000 sq. ft. facility firsthand.'
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {/* 1. Hero Section with Cinematic Anti-Gravity Entrance Animation */}
      <section className="hero-section-mobile" style={{ position: 'relative', padding: '2.5rem 0 3rem 0', background: 'radial-gradient(circle at 70% 30%, rgba(2,132,199,0.06) 0%, transparent 70%), #ffffff', overflow: 'hidden' }}>
        {/* Anti-Gravity Ambient Glow Orbs */}
        <div className="antigravity-hero-bg ag-entrance ag-delay-0" />
        <div className="antigravity-hero-bg-2 ag-entrance ag-delay-0" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            
            {/* Left Content with Sequential Anti-Gravity Entrance */}
            <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="section-tag ag-entrance ag-delay-1" style={{ marginBottom: '0.85rem' }}>
                  <Flame size={14} /> {hp.welcomeTag || 'Welcome to American Fitness Project'}
                </div>
                
                <h1 className="ag-entrance ag-delay-2" style={{ fontSize: 'clamp(1.75rem, 5.5vw, 3.8rem)', marginBottom: '1rem', lineHeight: '1.18', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', wordBreak: 'break-word' }}>
                  {hp.headlineMain || 'TRANSFORM YOUR BODY.'} <br />
                  <span className="gradient-text">{hp.headlineSub || 'UNLEASH YOUR POTENTIAL.'}</span>
                </h1>

                <p className="ag-entrance ag-delay-3" style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.92rem, 2.4vw, 1.08rem)', marginBottom: '1.5rem', lineHeight: '1.65', maxWidth: '590px' }}>
                  {hp.description || 'Welcome to American Fitness Project—a 20,000 sq. ft. flagship training facility.'}
                </p>

                {/* Side-by-Side Action Buttons with Anti-Gravity Rise */}
                <div className="hero-btn-row ag-entrance ag-delay-4">
                  <button onClick={() => setActivePage('memberships')} className="btn btn-primary pulse-button">
                    {hp.ctaText || 'Explore Membership Plans'} <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Animated Infinite Scrolling Feature Highlights Marquee */}
              <div className="ag-entrance ag-delay-5" style={{ marginTop: '1.5rem', padding: '1rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284C7', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '0.25rem' }}>
                  <Sparkles size={14} color="#0284C7" /> FACILITY HIGHLIGHTS & AMENITIES
                </div>
                
                <div className="marquee-container">
                  <div className="marquee-track">
                    {(hp.amenities && hp.amenities.length ? [...hp.amenities, ...hp.amenities] : [
                      { color: '#0284C7', title: '20,000 Sq. Ft. Olympic Arena', text: '12 Rogue Rigs & Eleiko Plates' },
                      { color: '#0D9488', title: 'Organic Fuel & Smoothie Bar', text: 'Organic Whey & Gourmet Meals' },
                      { color: '#0891b2', title: '24/7 Mobile Keycard Access', text: 'Open 365 Days a Year' },
                      { color: '#d97706', title: '4.9 / 5.0 Member Rating', text: 'Over 500+ Verified Reviews' },
                      { color: '#059669', title: '1-on-1 Master Coaching', text: 'Custom Biomechanics & Plans' }
                    ]).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid var(--border-glass)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-full)', boxShadow: '0 2px 8px rgba(15,23,42,0.03)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        <CheckCircle2 color={item.color || '#0284C7'} size={16} style={{ flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)' }}><strong>{item.title}:</strong> {item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet Checkmarks */}
              <div className="hero-checkmarks-mobile ag-entrance ag-delay-5" style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 color="#0284C7" size={17} /> 24/7 Encrypted Mobile Keycard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 color="#0D9488" size={17} /> Eleiko Competition Plates & Rigs
                </div>
              </div>
            </div>

            {/* Hero Image Card with 3D Tilt Parallax & Zero-Gravity Float */}
            <div
              ref={heroTiltRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="hero-image-card scroll-reveal reveal-right ag-entrance ag-delay-6 ag-tilt-card"
              style={{ position: 'relative', width: '100%', display: 'flex', height: '100%' }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(15, 23, 42, 0.14)',
                  border: '1px solid var(--border-glass)',
                  width: '100%',
                  height: '100%',
                  minHeight: '100%',
                  display: 'flex'
                }}
              >
                <img
                  src={hp.heroImage || '/hero-gym-arena.png'}
                  alt="American Fitness Gym Arena"
                  style={{ width: '100%', height: '100%', minHeight: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block', flex: 1 }}
                />

                {/* Floating Rating Badge with Weightless Float */}
                <div
                  className="floating-element ag-floating-element"
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    right: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(12px)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={15} color="#d97706" fill="#d97706" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>4.9 / 5.0 Rating</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Over 500+ Member Reviews</div>
                  </div>
                </div>

                {/* Floating 24/7 Access Badge with Reverse Weightless Float */}
                <div
                  className="floating-element ag-floating-element-alt"
                  style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(12px)',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>24/7 VIP Access</div>
                    <div style={{ fontSize: '0.68rem', color: '#0D9488', fontWeight: 700 }}>Open 365 Days a Year</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Stat Counters Row with Anti-Gravity Rise Entrance */}
          <div
            className="glass-card hero-stats-container scroll-reveal reveal-scale ag-entrance ag-delay-7"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              padding: '1.5rem 1rem',
              marginTop: '2.5rem'
            }}
          >
            {[
              { label: 'Active Members', value: '2,500+', icon: Users, color: '#0284C7' },
              { label: 'Sq. Ft. Facility', value: '20,000', icon: Trophy, color: '#0D9488' },
              { label: 'Modern Rigs', value: '100+', icon: Zap, color: 'var(--accent-green)' },
              { label: '24/7 Access', value: '365 Days', icon: Clock, color: 'var(--accent-cyan)' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <Icon size={20} color={stat.color} style={{ marginBottom: '0.2rem' }} />
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'clamp(1.35rem, 3.8vw, 1.8rem)', color: 'var(--text-main)' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. Redesigned Why Choose Us (Equal Height Cards with Header Icon + Title) */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Elite Infrastructure</span>
            <h2 className="section-title">WHY CHOOSE <span className="gradient-text">AMERICAN FITNESS GYM</span></h2>
            <p className="section-subtitle">Engineered specifically for powerlifters, endurance athletes, bodybuilders, and fitness enthusiasts seeking an uncompromised training environment.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
            {[
              {
                icon: Dumbbell,
                color: '#0284C7',
                title: 'Rogue Olympic Weight Floor',
                desc: '12 dedicated powerlifting platforms with Rogue Westside racks, Eleiko calibrated steel plates, and custom urethane dumbbells ranging from 5 lbs to 150 lbs.'
              },
              {
                icon: Trophy,
                color: '#0D9488',
                title: '1-on-1 Master Coaching',
                desc: 'Work directly with certified strength biomechanics specialists to optimize your lifting form, progressive overload, and personalized nutrition plans.'
              },
              {
                icon: Clock,
                color: '#0891b2',
                title: '24/7 Encrypted App Access',
                desc: 'Never let restricted gym hours slow your progress. Enjoy instant 1-tap mobile keycard entry through encrypted turnstiles 365 days a year.'
              },
              {
                icon: Coffee,
                color: '#d97706',
                title: 'Fuel Bar Smoothies & Espresso',
                desc: 'Recharge post-workout with organic whey protein shakes, BCAA refreshers, organic cold brew coffee, and macro-balanced meal prep containers.'
              },
              {
                icon: Lock,
                color: '#059669',
                title: 'Luxury Private Lockers & Spa',
                desc: 'Pristine locker room facilities equipped with digital combination keyless lockers, high-pressure rainfall showers, and complimentary plush towel service.'
              },
              {
                icon: Target,
                color: '#0284C7',
                title: 'InBody 770 Body Composition',
                desc: 'Track exact muscle mass gains and body fat loss with clinical-grade InBody 770 bioimpedance analysis and 1-on-1 certified coaching guidance.'
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className={`glass-card glass-card-glow scroll-reveal stagger-${(i % 6) + 1}`}
                  style={{
                    padding: '1.35rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: '#ffffff',
                    boxShadow: '0 4px 15px rgba(15,23,42,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(2,132,199,0.12) 0%, rgba(13,148,136,0.12) 100%)', border: '1px solid rgba(2,132,199,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={22} color={pillar.color} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', margin: 0, lineHeight: 1.25 }}>
                      {pillar.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.55', margin: 0, flex: 1 }}>
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Facility Highlights Teaser */}
      <section style={{ padding: '3.5rem 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-tag">World-Class Equipment</span>
            <h2 className="section-title">PREMIER <span className="gradient-text">TRAINING FACILITY</span></h2>
            <p className="section-subtitle">Inspect our Olympic weightlifting platforms, Woodway cardio deck, and organic fuel bar.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {(cmsData?.services || []).slice(0, 3).map((f, i) => (
              <div key={i} className={`glass-card glass-card-glow scroll-reveal stagger-${i + 1}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                  <img src={f.image} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: '#ffffff' }}>{f.badge}</span>
                </div>
                <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{f.description || f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Certified Master Coaches */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Expert Leadership</span>
            <h2 className="section-title">CERTIFIED <span className="gradient-text">MASTER COACHES</span></h2>
            <p className="section-subtitle">Work directly with elite exercise specialists dedicated to optimizing your strength and biomechanics.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {trainers.map((t, idx) => (
              <div key={idx} className={`glass-card scroll-reveal stagger-${idx + 1}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '230px', overflow: 'hidden' }}>
                  <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{t.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: '#0284C7', fontWeight: 700, marginBottom: '0.5rem' }}>{t.role}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}><strong>Certifications:</strong> {t.credentials}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>{t.bio}</p>
                  <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>{t.spec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Member Transformations */}
      <section style={{ padding: '3.5rem 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Verified Results</span>
            <h2 className="section-title">REAL MEMBERS. <span className="gradient-text">REAL TRANSFORMATIONS.</span></h2>
            <p className="section-subtitle">Read firsthand experiences from members who transformed their health and physique at American Fitness Gym.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {[
              {
                name: 'Daniel Carter',
                result: 'Lost 35 lbs & Built 12 lbs Lean Muscle (6 Months)',
                quote: 'The 24/7 keycard access allowed me to execute my powerlifting workouts before my 7 AM work shifts. The Rogue rigs and Eleiko plates are top tier.',
                stars: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Samantha Reed',
                result: 'Increased Deadlift by 110 lbs (1 Year)',
                quote: 'The coaching team corrected my barbell squat path within my first month. Plus having unlimited access to the cedarwood sauna and cold plunge made recovery a breeze.',
                stars: 5,
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Marcus Brody',
                result: 'Reduced Body Fat from 24% to 11% (8 Months)',
                quote: 'Consistent access to the Woodway cardio deck and InBody 770 tracking helped me break a 3-year plateau. Hands down the best gym facility in the region.',
                stars: 5,
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
              }
            ].map((story, i) => (
              <div key={i} className={`glass-card scroll-reveal stagger-${i + 1}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
                  {[...Array(story.stars)].map((_, s) => <Star key={s} size={15} fill="var(--accent-gold)" />)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '1.1rem', lineHeight: '1.6', flex: 1 }}>"{story.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                  <img src={story.image} alt={story.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{story.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>{story.result}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC MEMBERSHIP PLANS PREVIEW (Live CMS Data) */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Flexible Membership Options</span>
            <h2 className="section-title">FEATURED <span className="gradient-text">MEMBERSHIP PLANS</span></h2>
            <p className="section-subtitle">Real-time dynamic pricing managed directly by gym administration. Choose your preferred plan to begin training.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.75rem' }}>
            {(cmsData?.memberships || []).map((plan) => (
              <div
                key={plan.id}
                className="glass-card glass-card-glow scroll-reveal"
                style={{
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-lg)',
                  border: plan.popular ? '2px solid #0284C7' : '1px solid var(--border-glass)',
                  background: '#ffffff',
                  position: 'relative'
                }}
              >
                {plan.popular && (
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#0284C7', color: '#ffffff', fontWeight: 800 }}>
                    MOST POPULAR
                  </span>
                )}
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{plan.badge}</span>
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.4rem' }}>{plan.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.75rem 0' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                    ${plan.monthlyPrice}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>{plan.description}</p>

                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(plan.features || []).map((feat, fIdx) => (
                      <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                        <Check size={16} color="#0284C7" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setActivePage('memberships')}
                  className={plan.popular ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
                >
                  {plan.ctaText || 'Select Plan'} <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Home Page FAQ Accordion */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div className="section-header scroll-reveal">
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-title">EVERYTHING YOU <span className="gradient-text">NEED TO KNOW</span></h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {homeFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`glass-card scroll-reveal stagger-${(idx % 4) + 1}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    padding: '1.15rem 1.35rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: isOpen ? '1.5px solid #0284C7' : '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="#0284C7" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.65', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section style={{ padding: '4rem 0', background: 'var(--gradient-primary)', textAlign: 'center' }}>
        <div className="container scroll-reveal reveal-scale">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#fff', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>READY TO BEGIN YOUR FITNESS JOURNEY?</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(0.95rem, 2.4vw, 1.15rem)', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
            Join American Fitness Gym today and gain immediate 24/7 access to our Rogue weight floor, Woodway cardio deck, 1-on-1 master coaching, and organic fuel smoothie bar.
          </p>
          <button onClick={() => setActivePage('memberships')} className="btn btn-gold" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', height: '46px' }}>
            View Membership Plans <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Scroll Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="floating-scroll-top"
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            right: '2rem',
            zIndex: 99,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-normal)'
          }}
          title="Scroll Back to Top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
