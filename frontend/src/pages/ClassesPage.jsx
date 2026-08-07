import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Flame, Clock, User, ChevronRight, Users } from 'lucide-react';
import { fetchClasses } from '../services/api';
import { useApp } from '../context/AppContext';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { openClassModal, userBookings } = useApp();

  const categories = ['All', 'HIIT', 'Strength', 'Boxing', 'Yoga', 'CrossFit'];
  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadClasses = () => {
    setLoading(true);
    fetchClasses(selectedCategory, selectedDay, searchQuery).then((res) => {
      if (res.success) {
        setClasses(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadClasses();
  }, [selectedCategory, selectedDay, searchQuery, userBookings]);

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Group Fitness Schedule</span>
          <h2 className="section-title">CLASSES & <span className="gradient-text">WORKOUT SCHEDULE</span></h2>
          <p className="section-subtitle">
            Filter by workout discipline, day of the week, or search your favorite coach to reserve your spot.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search classes by title, coach, or workout focus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Discipline Category:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#0284C7' : 'var(--border-glass)',
                    background: selectedCategory === cat ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Day Filter Pills */}
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Schedule Day:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '0.35rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: selectedDay === day ? 'var(--accent-gold)' : 'var(--border-glass)',
                    background: selectedDay === day ? 'rgba(255,184,0,0.12)' : 'var(--bg-card)',
                    color: selectedDay === day ? 'var(--accent-gold)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading live class schedule...</div>
        ) : classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            No workout classes match your filter criteria. Try clearing search or selecting a different category.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
            {classes.map((c) => {
              const isUserBooked = userBookings.some(b => b.classId === c.id && b.status === 'CONFIRMED');

              return (
                <div key={c.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-red">{c.category}</span>
                      <span className="badge badge-gold">{c.intensity} Intensity</span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0.75rem', right: '1rem', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <Users size={14} color="#0284C7" /> {c.spotsLeft} / {c.capacity} spots left
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{c.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', flex: 1, lineHeight: '1.6' }}>
                      {c.description}
                    </p>

                    <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Head Coach:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{c.trainer}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Time Slot:</span>
                        <span style={{ color: '#0284C7', fontWeight: 700 }}>{c.timeSlot}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Active Days:</span>
                        <span>{c.scheduleDays.join(', ')}</span>
                      </div>
                    </div>

                    {isUserBooked ? (
                      <div style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid #0D9488', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#0D9488', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        ✓ Seat Reserved for this Class
                      </div>
                    ) : (
                      <button onClick={() => openClassModal(c)} className="btn btn-primary" style={{ width: '100%' }}>
                        Reserve Seat in Class
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
