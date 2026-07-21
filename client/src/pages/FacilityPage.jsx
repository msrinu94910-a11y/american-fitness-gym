import React, { useState, useEffect } from 'react';
import { ShieldCheck, Dumbbell, Flame, Heart, ArrowRight, Check } from 'lucide-react';
import { fetchFacilities } from '../services/api';

const DEFAULT_FACILITIES = [
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

export default function FacilityPage({ setActivePage }) {
  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchFacilities(activeCategory)
      .then((res) => {
        if (res && res.success && res.data && res.data.length > 0) {
          setFacilities(res.data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_FACILITIES seamlessly
      });
  }, [activeCategory]);

  const filteredFacilities = activeCategory === 'All'
    ? facilities
    : facilities.filter(f => f.category.toLowerCase() === activeCategory.toLowerCase());

  const categories = ['All', 'Weights', 'Cardio', 'Recovery', 'Nutrition'];

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem', background: '#ffffff' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">20,000 Sq. Ft. Facility</span>
          <h2 className="section-title">EQUIPMENT & <span className="gradient-text">AMENITIES TOUR</span></h2>
          <p className="section-subtitle">
            Inspect our world-class training zones, competition powerlifting racks, Woodway treadmills, and Finnish sauna spa.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? '#0284C7' : '#f1f5f9',
                  border: '1px solid var(--border-glass)',
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {filteredFacilities.map((item) => (
            <div key={item.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="badge badge-red" style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffffff' }}>
                  {item.category}
                </span>
              </div>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {item.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {item.description}
                </p>
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0284C7', marginBottom: '0.5rem' }}>
                    KEY SPECIFICATIONS:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {item.specs.map((spec, sIdx) => (
                      <li key={sIdx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} color="#0D9488" /> {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Light Theme Tour CTA Banner */}
        <div
          className="glass-card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(2,132,199,0.06) 0%, rgba(13,148,136,0.06) 100%)',
            border: '1px solid rgba(2,132,199,0.2)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <h3 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
            WANT TO SEE THE FACILITY IN PERSON?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Book a guided facility tour with a staff member and explore our 20,000 sq. ft. gym floor.
          </p>
          <button onClick={() => setActivePage && setActivePage('contact')} className="btn btn-primary">
            Schedule Facility Tour <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
