import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, Star, ShieldCheck, ArrowRight, Zap, Crown, Flame } from 'lucide-react';
import { fetchMemberships } from '../services/api';

const DEFAULT_PLANS = [
  {
    id: 'basic-plan',
    name: 'Basic Gym Access',
    tier: 'basic',
    monthlyPrice: 29,
    annualPrice: 24,
    badge: 'STARTER',
    description: 'Perfect for independent lifters seeking full 24/7 access to powerlifting rigs & cardio decks.',
    popular: false,
    icon: Zap,
    features: [
      '24/7 Access to Main Weight Floor & Rigs',
      'High-Tech Cardio Deck & Woodway Treadmills',
      'Locker Room & High-Pressure Shower Access',
      'Free Initial Fitness & Body Assessment',
      'Mobile App Keycard Access & Workout Tracking'
    ]
  },
  {
    id: 'pro-plan',
    name: 'Pro Athlete',
    tier: 'pro',
    monthlyPrice: 59,
    annualPrice: 49,
    badge: 'MOST POPULAR',
    description: 'The ultimate athletic package featuring unlimited recovery spa, steam rooms & guest passes.',
    popular: true,
    icon: Flame,
    features: [
      'Everything in Basic Plan',
      'Therapeutic Finnish Sauna & Cold Plunge Spa',
      'Eucalyptus Steam Room Access',
      '1 Free Monthly Fitness Coaching Consultation',
      '2 Guest Passes per Month',
      '10% Off Fuel Bar Protein Smoothies'
    ]
  },
  {
    id: 'vip-plan',
    name: 'VIP Elite',
    tier: 'vip',
    monthlyPrice: 99,
    annualPrice: 84,
    badge: 'VIP ELITE',
    description: 'All-inclusive luxury experience with 1-on-1 personal coaching, private locker, and meal plans.',
    popular: false,
    icon: Crown,
    features: [
      'Everything in Pro Athlete Plan',
      '2 Monthly 1-on-1 Personal Training Sessions',
      'Customized Nutrition & Macro Meal Plan',
      'Permanent Reserved VIP Locker & Towel Service',
      'Unlimited Guest Passes (1 Guest per visit)',
      '20% Off All Gym Merchandise & Supplements'
    ]
  }
];

export default function MembershipsPage({ setActivePage }) {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState(0);

  useEffect(() => {
    fetchMemberships()
      .then((res) => {
        if (res && res.success && res.data && res.data.length > 0) {
          setPlans(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'Is there any long-term contract requirement?',
      a: 'No! All American Fitness Project memberships are month-to-month. You can upgrade, downgrade, or pause your membership at any time with zero cancellation penalties.'
    },
    {
      q: 'How does 24/7 keycard facility access work?',
      a: 'Upon joining, you will receive encrypted digital keycard access via our mobile app (and a physical RFID keycard) granting entry to our turnstiles 365 days a year.'
    },
    {
      q: 'Can I bring a workout partner or guest?',
      a: 'Pro Athlete members receive 2 free guest passes per month. VIP Elite members enjoy unlimited guest privileges (1 guest per visit anytime).'
    },
    {
      q: 'What is included in the Sauna & Cold Plunge Recovery Spa?',
      a: 'Pro and VIP members have unlimited access to our 190°F Finnish cedarwood sauna, eucalyptus steam rooms, cold plunge tubs (50°F), and Normatec lounge.'
    },
    {
      q: 'Are personal training sessions included?',
      a: 'VIP Elite members receive 2 complimentary 1-on-1 personal coaching sessions every month. Basic and Pro members receive a free initial body composition assessment.'
    }
  ];

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Flexible Membership Tiers</span>
          <h2 className="section-title">CHOOSE YOUR <span className="gradient-text">FITNESS LEVEL</span></h2>
          <p className="section-subtitle">
            Transparent pricing with zero hidden initiation fees. Select annual billing to save 20% on all plans.
          </p>

          {/* Billing Switcher Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f1f5f9',
              border: '1px solid var(--border-glass)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-full)',
              marginTop: '1.5rem',
              maxWidth: '100%',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                background: !isAnnual ? '#ffffff' : 'none',
                border: !isAnnual ? '1px solid var(--border-glass)' : 'none',
                color: !isAnnual ? '#0f172a' : 'var(--text-muted)',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'var(--transition-fast)'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                background: isAnnual ? 'var(--gradient-primary)' : 'none',
                border: 'none',
                color: isAnnual ? '#ffffff' : 'var(--text-muted)',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition-fast)'
              }}
            >
              Annual <span style={{ background: '#ffffff', color: '#0284C7', padding: '0.1rem 0.45rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900 }}>SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
            alignItems: 'stretch',
            marginBottom: '5rem'
          }}
        >
          {plans.map((plan) => {
            const price = isAnnual ? (plan.annualPrice || 24) : (plan.monthlyPrice || 29);
            const isPopular = plan.popular || plan.tier === 'pro';

            return (
              <div
                key={plan.id}
                className="glass-card"
                style={{
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: isPopular ? '#ffffff' : 'var(--bg-card)',
                  border: isPopular ? '2.5px solid #0284C7' : '1px solid var(--border-glass)',
                  boxShadow: isPopular ? '0 12px 40px rgba(2, 132, 199, 0.18)' : 'var(--shadow-card)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {plan.badge && (
                  <span
                    className={isPopular ? 'badge badge-red' : 'badge badge-gold'}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
                  >
                    {plan.badge}
                  </span>
                )}

                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {plan.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5', minHeight: '40px' }}>
                  {plan.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>$</span>
                  <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', lineHeight: 1 }}>
                    {price}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>/ month</span>
                </div>

                <div style={{ marginBottom: '1.75rem', flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    INCLUDED PERKS & ACCESS:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                        <Check size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setActivePage('contact')}
                  className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', height: '46px', fontSize: '0.95rem' }}
                >
                  Join {plan.name} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparison Matrix Table with Smooth Touch Overflow */}
        <div style={{ marginBottom: '5rem', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">Feature Comparison</span>
            <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontFamily: 'var(--font-heading)' }}>COMPARE MEMBERSHIP PERKS</h3>
          </div>

          <div className="glass-card" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                  <th style={{ padding: '0.85rem', fontSize: '0.98rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Features & Amenities</th>
                  <th style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.98rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Basic Access</th>
                  <th style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.98rem', color: '#0284C7', fontFamily: 'var(--font-heading)' }}>Pro Athlete ★</th>
                  <th style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.98rem', color: '#0D9488', fontFamily: 'var(--font-heading)' }}>VIP Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: '24/7 Keycard Access', basic: true, pro: true, vip: true },
                  { feature: 'Olympic Rigs & Cardio Floor', basic: true, pro: true, vip: true },
                  { feature: 'Finnish Sauna & Cold Plunge', basic: false, pro: true, vip: true },
                  { feature: 'Eucalyptus Steam Room', basic: false, pro: true, vip: true },
                  { feature: 'Monthly Guest Passes', basic: '—', pro: '2 / mo', vip: 'Unlimited' },
                  { feature: '1-on-1 Personal Training', basic: '—', pro: '1 Assessment', vip: '2 / mo' },
                  { feature: 'Custom Nutrition Blueprint', basic: '—', pro: '—', vip: true }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', background: idx % 2 === 0 ? 'rgba(248, 250, 252, 0.5)' : 'transparent' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{row.feature}</td>
                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                      {typeof row.basic === 'boolean' ? (row.basic ? <Check size={18} color="#0284C7" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--text-dim)' }}>—</span>) : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{row.basic}</span>}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(2, 132, 199, 0.03)' }}>
                      {typeof row.pro === 'boolean' ? (row.pro ? <Check size={18} color="#0284C7" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--text-dim)' }}>—</span>) : <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284C7' }}>{row.pro}</span>}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                      {typeof row.vip === 'boolean' ? (row.vip ? <Check size={18} color="#0D9488" style={{ margin: '0 auto' }} /> : <span style={{ color: 'var(--text-dim)' }}>—</span>) : <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D9488' }}>{row.vip}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 100% Satisfaction Guarantee Card */}
        <div
          className="glass-card"
          style={{
            padding: '2rem 1.5rem',
            marginBottom: '5rem',
            background: 'linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(13,148,136,0.06) 100%)',
            border: '1px solid rgba(2,132,199,0.2)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-glow)' }}>
            <ShieldCheck size={30} color="#ffffff" />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              100% MONEY-BACK SATISFACTION GUARANTEE
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Train at American Fitness Project risk-free for 7 days. If you are not completely thrilled, we will refund 100% of your membership fee — no questions asked.
            </p>
          </div>
          <button onClick={() => setActivePage('contact')} className="btn btn-primary" style={{ flexShrink: 0, width: '100%', maxWidth: '200px' }}>
            Contact Us To Join
          </button>
        </div>

        {/* FAQ Accordion Section */}
        <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', fontFamily: 'var(--font-heading)' }}>FREQUENTLY ASKED QUESTIONS</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.92rem' }}>Have questions about your membership? Find quick answers below.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    padding: '1.1rem 1.35rem',
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
                    <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
