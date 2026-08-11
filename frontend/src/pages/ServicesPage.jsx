import React from 'react';
import { 
  Dumbbell, Flame, Target, Sparkles, HeartPulse, Clock, ArrowRight, Check,
  ShieldCheck, Users, Zap, Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  Dumbbell, Flame, Target, Sparkles, HeartPulse, Clock, Zap, ShieldCheck, Award
};

export default function ServicesPage({ setActivePage }) {
  const { cmsData } = useApp();
  const services = cmsData?.services || [];

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">High-Performance Offerings</span>
          <h2 className="section-title">OUR PREMIER <span className="gradient-text">FITNESS SERVICES</span></h2>
          <p className="section-subtitle">
            From 1-on-1 personal coaching to organic fuel bar smoothies and 24/7 mobile app keycard access, discover everything engineered for your success.
          </p>
        </div>

        {/* Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {services.map((s) => {
            const Icon = (typeof s.icon === 'function' ? s.icon : iconMap[s.iconName]) || Sparkles;
            const perksList = Array.isArray(s.perks) ? s.perks : [];
            return (
              <div key={s.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffffff' }}>{s.badge}</span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={s.color || '#0284C7'} />
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
                      {perksList.map((perk, pIdx) => (
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
            READY TO ELEVATE YOUR FITNESS JOURNEY?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 1.75rem auto' }}>
            Claim your instant membership access or explore our plans to start training today.
          </p>
          <button onClick={() => setActivePage('memberships')} className="btn btn-gold" style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem', height: '48px' }}>
            Explore Membership Plans <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
