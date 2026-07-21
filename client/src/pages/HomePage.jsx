import React, { useState } from 'react';
import { 
  Flame, Dumbbell, ShieldCheck, Trophy, Users, Clock, ArrowRight, Star, 
  Zap, CheckCircle2, HeartPulse, Sparkles, Award, Coffee, Lock, Target,
  ChevronDown, ChevronUp, Calendar, Activity, Compass, Check
} from 'lucide-react';

export default function HomePage({ setActivePage }) {
  const [activeFaq, setActiveFaq] = useState(0);

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
      name: 'Sarah Jenkins',
      role: 'Head Functional Fitness Specialist',
      credentials: 'CrossFit Level 3, NASM Master CPT, Precision Nutrition L2',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      spec: 'Metabolic Conditioning & Agility',
      bio: 'Former collegiate track athlete with a passion for high-energy group endurance. Sarah designs custom work-to-rest interval protocols for all fitness levels.'
    },
    {
      name: 'Dr. Marcus Cole',
      role: 'Physical Therapy & Recovery Director',
      credentials: 'Doctor of Physical Therapy (DPT), CSCS, FRCms',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      spec: 'Post-Rehab & Contrast Therapy',
      bio: 'Specializing in orthopedic musculoskeletal therapy, Dr. Marcus oversees our sauna spa contrast protocols and joint mobility routines.'
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
      q: 'Are the Finnish Cedarwood Sauna and Cold Plunge included?',
      a: 'Yes! Pro Athlete and VIP Elite members receive unlimited daily access to our recovery spa, featuring a 190°F Finnish cedarwood dry sauna, eucalyptus-infused steam rooms, and dual 50°F cold plunge filtration tubs.'
    },
    {
      q: 'Can I schedule a complimentary guided tour before purchasing a plan?',
      a: 'Absolutely! Click "Schedule Tour" to select your preferred date and time slot. One of our master coaches will give you a full facility walkthrough, demonstrate our app keycard system, and answer any training questions.'
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {/* 1. Hero Section */}
      <section className="hero-section-mobile" style={{ position: 'relative', padding: '2.5rem 0 3rem 0', background: 'radial-gradient(circle at 70% 30%, rgba(2,132,199,0.06) 0%, transparent 70%), #ffffff', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            
            {/* Left Content */}
            <div style={{ textAlign: 'left', width: '100%' }}>
              <div className="section-tag" style={{ marginBottom: '0.75rem' }}>
                <Flame size={14} /> Welcome to American Fitness Project
              </div>
              
              <h1 style={{ fontSize: 'clamp(1.75rem, 5.5vw, 3.8rem)', marginBottom: '0.85rem', lineHeight: '1.15', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', wordBreak: 'break-word' }}>
                TRANSFORM YOUR BODY. <br />
                <span className="gradient-text">UNLEASH YOUR POTENTIAL.</span>
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2.4vw, 1.05rem)', marginBottom: '1.25rem', lineHeight: '1.6', maxWidth: '580px' }}>
                State-of-the-art 24/7 facility featuring 20,000 sq. ft. of Rogue Olympic powerlifting rigs, Woodway custom cardio decks, modern Arsenal Strength equipment, and therapeutic Finnish sauna recovery spas.
              </p>

              {/* Side-by-Side Action Buttons for Mobile & Desktop */}
              <div className="hero-btn-row">
                <button onClick={() => setActivePage('memberships')} className="btn btn-primary pulse-button">
                  Explore Plans <ArrowRight size={15} />
                </button>
                <button onClick={() => setActivePage('contact')} className="btn btn-secondary">
                  Schedule Tour
                </button>
              </div>

              {/* Mobile Quick Chips Bar */}
              <div className="mobile-chips-bar">
                <div className="chip-pill"><Dumbbell size={14} color="#0284C7" /> Rogue Weight Floor</div>
                <div className="chip-pill"><Flame size={14} color="#0D9488" /> Cedarwood Sauna</div>
                <div className="chip-pill"><Clock size={14} color="#0891b2" /> 24/7 App Keycard</div>
                <div className="chip-pill"><Star size={14} color="#d97706" /> 4.9/5 Rating</div>
              </div>

              {/* Desktop/Tablet Checkmarks */}
              <div className="hero-checkmarks-mobile" style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 color="#0284C7" size={17} /> 24/7 Encrypted Mobile Keycard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <CheckCircle2 color="#0D9488" size={17} /> Eleiko Competition Plates & Rigs
                </div>
              </div>
            </div>

            {/* Right Hero Image Card - Desktop Only */}
            <div className="desktop-hero-image" style={{ position: 'relative', width: '100%' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(15, 23, 42, 0.1)',
                  border: '1px solid var(--border-glass)',
                  width: '100%'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80"
                  alt="American Fitness Gym Hero"
                  style={{ width: '100%', height: 'clamp(240px, 40vh, 420px)', objectFit: 'cover', display: 'block' }}
                />

                {/* Floating Rating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    right: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
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

                {/* Floating 24/7 Access Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
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

          {/* Stat Counters Row - Desktop Only */}
          <div
            className="glass-card desktop-only-stats"
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
          <div className="section-header">
            <span className="section-tag">Elite Infrastructure</span>
            <h2 className="section-title">WHY CHOOSE <span className="gradient-text">AMERICAN FITNESS PROJECT</span></h2>
            <p className="section-subtitle">Engineered specifically for powerlifters, endurance athletes, bodybuilders, and fitness enthusiasts seeking an uncompromised training environment.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                icon: Dumbbell,
                color: '#0284C7',
                title: 'Rogue Olympic Weight Floor',
                desc: '12 dedicated powerlifting platforms with Rogue Westside racks, Eleiko calibrated steel plates, and custom urethane dumbbells ranging from 5 lbs to 150 lbs.'
              },
              {
                icon: Flame,
                color: '#0D9488',
                title: 'Cedarwood Sauna & Plunge Spa',
                desc: 'Accelerate muscular recovery with our 190°F Finnish dry cedarwood sauna, eucalyptus-infused steam room, and dual 50°F cold plunge filtration tubs.'
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
                  className="glass-card glass-card-glow"
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
          <div className="section-header">
            <span className="section-tag">World-Class Equipment</span>
            <h2 className="section-title">PREMIER <span className="gradient-text">TRAINING FACILITY</span></h2>
            <p className="section-subtitle">Inspect our Olympic weightlifting platforms, Woodway cardio deck, and therapeutic recovery spa.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: 'Olympic Weight Arena',
                desc: 'Over 15,000 sq. ft. of heavy-duty rubber flooring equipped with Rogue Monster power racks, Eleiko competition plates, specialized specialty bars (Swiss bar, trap bar, safety squat bar), and dumbbells up to 150 lbs.',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                badge: 'STRENGTH ARENA'
              },
              {
                title: 'High-Tech Cardio Deck',
                desc: 'Woodway curved slat-belt treadmills, Assault AirBikes, Concept2 Rowers and SkiErgs, and StairMaster 10G machines with integrated touchscreens for high-octane cardiovascular endurance training.',
                image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
                badge: 'CARDIO ZONE'
              },
              {
                title: 'Sauna & Recovery Spa',
                desc: '190°F Finnish cedarwood dry heat room, eucalyptus-infused steam rooms, dual 50°F cold plunge filtration tubs, and Normatec dynamic air compression recovery boots for total body rejuvenation.',
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                badge: 'RECOVERY SPA'
              }
            ].map((f, i) => (
              <div key={i} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                  <img src={f.image} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: '#ffffff' }}>{f.badge}</span>
                </div>
                <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Certified Master Coaches */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Expert Leadership</span>
            <h2 className="section-title">CERTIFIED <span className="gradient-text">MASTER COACHES</span></h2>
            <p className="section-subtitle">Work directly with elite exercise specialists dedicated to optimizing your strength and biomechanics.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {trainers.map((t, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          <div className="section-header">
            <span className="section-tag">Verified Results</span>
            <h2 className="section-title">REAL MEMBERS. <span className="gradient-text">REAL TRANSFORMATIONS.</span></h2>
            <p className="section-subtitle">Read firsthand experiences from members who transformed their health and physique at American Fitness Project.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
              <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
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

      {/* 6. Home Page FAQ Accordion */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div className="section-header">
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-title">EVERYTHING YOU <span className="gradient-text">NEED TO KNOW</span></h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {homeFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card"
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
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#fff', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>READY TO BEGIN YOUR FITNESS JOURNEY?</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(0.95rem, 2.4vw, 1.15rem)', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
            Join American Fitness Project today and gain immediate 24/7 access to our Rogue weight floor, Woodway cardio deck, and Finnish cedarwood recovery spa.
          </p>
          <button onClick={() => setActivePage('memberships')} className="btn btn-gold" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', height: '46px' }}>
            View Membership Plans <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
