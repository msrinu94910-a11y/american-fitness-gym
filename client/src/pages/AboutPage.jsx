import React from 'react';
import { ShieldCheck, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutPage({ setActivePage }) {
  const { openDayPass } = useApp();

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">About American Fitness Project</span>
          <h2 className="section-title">BUILT FOR <span className="gradient-text">EXCELLENCE & STRENGTH</span></h2>
          <p className="section-subtitle">
            Founded with a vision to revolutionize the fitness experience by combining elite strength equipment, high-energy community, and organic nutrition.
          </p>
        </div>

        {/* Story & Visual Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '3rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>ESTABLISHED 2018</span>
            <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1.25rem', lineHeight: '1.2', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              MORE THAN A GYM. <br />A HIGH-PERFORMANCE COMMUNITY.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              American Fitness Project was engineered from the ground up for individuals who demand more from their daily workout. Whether your goal is body recomposition, powerlifting competition, or functional longevity, our 20,000 sq. ft. facility provides the ultimate sanctuary.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              We believe in zero compromise: zero broken machines, zero crowded waits, and 100% focus on human performance and mental resilience.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="#0284C7" size={20} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Rogue & Eleiko Gear</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="#0284C7" size={20} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>24/7 Keycard Entry</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="#0D9488" size={20} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Organic Fuel Bar</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="#0284C7" size={20} />
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>In-House Nutritionist</span>
              </div>
            </div>

            <div>
              <button onClick={openDayPass} className="btn btn-primary">
                Claim Free 7-Day Pass <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
              alt="Gym Floor"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-card)' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-glow)',
                maxWidth: '220px'
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0D9488', fontFamily: 'var(--font-heading)' }}>99.8%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Member Satisfaction Rating</div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>OUR CORE PILLARS</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              {
                icon: Target,
                title: 'Relentless Purpose',
                desc: 'Every weight rack, studio, and workout split is designed with clear biomechanical intention.',
                color: '#0284C7'
              },
              {
                icon: ShieldCheck,
                title: 'Pristine Hygiene',
                desc: 'Continuous medical-grade sanitation every 2 hours ensuring a clean, safe training environment.',
                color: '#0D9488'
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: '2rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(2,132,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Icon size={24} color={pillar.color} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{pillar.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
