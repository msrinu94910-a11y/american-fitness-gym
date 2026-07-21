import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { fetchTrainers } from '../services/api';
import { useApp } from '../context/AppContext';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [loading, setLoading] = useState(true);
  const { openTrainerModal } = useApp();

  const specialties = ['All', 'HIIT', 'Hypertrophy', 'Boxing', 'Powerlifting', 'Yoga', 'Mobility'];

  useEffect(() => {
    setLoading(true);
    fetchTrainers(selectedSpecialty).then((res) => {
      if (res.success) setTrainers(res.data);
      setLoading(false);
    });
  }, [selectedSpecialty]);

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">World-Class Athletics</span>
          <h2 className="section-title">CERTIFIED <span className="gold-gradient-text">ELITE COACHES</span></h2>
          <p className="section-subtitle">
            Our certified personal trainers combine exercise science with real-world athletic experience to guide your body transformation.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: selectedSpecialty === spec ? 'var(--accent-gold)' : 'var(--border-glass)',
                  background: selectedSpecialty === spec ? 'var(--gradient-gold)' : 'rgba(255,255,255,0.04)',
                  color: selectedSpecialty === spec ? '#000000' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading coach roster...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {trainers.map((t) => (
              <div key={t.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                  <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                    <span className="badge badge-gold">★ {t.rating} ({t.reviewsCount} reviews)</span>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{t.name}</h3>
                  <div style={{ color: 'var(--accent-red)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>{t.role}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', flex: 1, lineHeight: '1.5' }}>
                    {t.bio}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {t.specialties.map((s, i) => (
                      <span key={i} className="badge badge-red" style={{ fontSize: '0.7rem' }}>{s}</span>
                    ))}
                  </div>

                  <button onClick={() => openTrainerModal(t)} className="btn btn-gold" style={{ width: '100%' }}>
                    Book 1-on-1 Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
