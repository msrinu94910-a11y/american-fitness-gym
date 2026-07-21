import React from 'react';
import { 
  Dumbbell, Flame, Target, Sparkles, HeartPulse, Clock, ArrowRight, Check,
  ShieldCheck, Users, Zap, Award
} from 'lucide-react';

export default function ServicesPage({ setActivePage }) {
  const services = [
    {
      id: 'personal-training',
      title: '1-on-1 Personal Training & Biomechanics',
      badge: 'MOST POPULAR',
      icon: Dumbbell,
      color: '#0284C7',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      description: 'Customized 1-on-1 strength and biomechanics coaching tailored to your specific physical goals.',
      perks: [
        'Custom 12-week periodized strength programming',
        'Bar-path velocity and joint alignment analysis',
        'InBody 770 monthly body composition scans',
        'Direct 24/7 coach messaging and form checks'
      ]
    },
    {
      id: 'recovery-spa',
      title: 'Sauna & Cold Plunge Recovery Spa',
      badge: 'THERAPEUTIC',
      icon: Flame,
      color: '#0D9488',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Accelerate muscle repair, decrease inflammation, and soothe central nervous system fatigue with contrast therapy.',
      perks: [
        '190°F Finnish dry cedarwood sauna',
        'Eucalyptus-infused steam room access',
        'Dual 50°F cold plunge filtration tubs',
        'Normatec dynamic air compression lounge'
      ]
    },
    {
      id: 'body-scan',
      title: 'InBody 770 Clinical Body Scans',
      badge: 'CLINICAL GRADE',
      icon: Target,
      color: '#0891b2',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      description: 'Get precise scientific feedback on muscle mass, body fat percentage, visceral fat, and segmental lean balance.',
      perks: [
        'Multi-frequency bioimpedance technology',
        'Detailed 15-page segmental breakdown report',
        'Basal metabolic rate (BMR) calculation',
        'Monthly progress comparison overlay'
      ]
    },
    {
      id: 'nutrition',
      title: 'Custom Macro Nutrition Blueprints',
      badge: 'NUTRITION',
      icon: Sparkles,
      color: '#d97706',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      description: 'Customized macro nutrient targets calculated for your training volume, body weight, and body composition goals.',
      perks: [
        'Personalized daily protein, carb, and fat targets',
        'Weekly grocery list and meal preparation guide',
        'Supplement protocol recommendations',
        'Weekly accountability check-in video calls'
      ]
    },
    {
      id: 'hyrox-group',
      title: 'HYROX & Functional Group Classes',
      badge: 'HIGH INTENSITY',
      icon: HeartPulse,
      color: '#059669',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      description: 'High-octane hybrid endurance classes combining SkiErgs, heavy sled pushes, rowing, wall balls, and kettlebells.',
      perks: [
        'Coached by certified CrossFit L3 & Hyrox trainers',
        'Heart-rate telemetry display screens in class',
        'Scalable workouts for all fitness levels',
        'Supportive competitive team community'
      ]
    },
    {
      id: 'keycard-access',
      title: '24/7 Digital Mobile App Keycard Access',
      badge: '24/7 ACCESS',
      icon: Clock,
      color: '#0284C7',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      description: 'Enjoy 24-hour round-the-clock access to our 20,000 sq. ft. weight floor 365 days a year.',
      perks: [
        'Encrypted 1-tap mobile turnstile scanner',
        'High-definition security surveillance system',
        'Never closes on holidays or weekends',
        'Includes complimentary guest pass credits'
      ]
    }
  ];

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">High-Performance Offerings</span>
          <h2 className="section-title">OUR PREMIER <span className="gradient-text">FITNESS SERVICES</span></h2>
          <p className="section-subtitle">
            From 1-on-1 personal coaching to 190°F Finnish saunas and 24/7 mobile app keycard access, discover everything engineered for your success.
          </p>
        </div>

        {/* Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffffff' }}>{s.badge}</span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={s.color} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: '1.25' }}>{s.title}</h3>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                    {s.description}
                  </p>

                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      KEY SERVICE HIGHLIGHTS:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      {s.perks.map((perk, pIdx) => (
                        <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                          <Check size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setActivePage('contact')}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '44px', fontSize: '0.92rem' }}
                  >
                    Inquire About This Service <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div
          style={{
            padding: '3rem 2rem',
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: '#ffffff'
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#ffffff', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            READY TO EXPERIENCE OUR SERVICES FIRSTHAND?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 1.75rem auto' }}>
            Book a complimentary 1-on-1 facility tour and sit down with a master coach to craft your personalized fitness plan.
          </p>
          <button onClick={() => setActivePage('contact')} className="btn btn-gold" style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem', height: '48px' }}>
            Book Facility Tour & Consult <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
