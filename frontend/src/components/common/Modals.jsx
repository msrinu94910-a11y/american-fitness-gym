import React, { useState } from 'react';
import { X, Flame, CheckCircle, Calendar, Clock, User, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { submitTrialPassRequest, fetchAdminTrainers } from '../../services/api';

export function DayPassModal() {
  const { isDayPassOpen, closeDayPass, showToast } = useApp();
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', preferredBranch: 'Downtown Flagship', preferredDate: '' });
  const [passResult, setPassResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isDayPassOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitTrialPassRequest(formData);
      if (res.success) {
        setPassResult(res.pass);
        showToast('Free 7-Day VIP Trial Pass generated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to generate trial pass', 'error');
      }
    } catch (err) {
      showToast('Error connecting to gym server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setPassResult(null);
    setFormData({ fullName: '', email: '', phone: '', preferredBranch: 'Downtown Flagship', preferredDate: '' });
    closeDayPass();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={resetAndClose} className="modal-close-btn">
          <X size={20} />
        </button>

        {!passResult ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,56,56,0.15)', color: 'var(--accent-red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Flame size={28} />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Claim Free 7-Day VIP Trial Pass</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Experience our 24/7 fitness floor, Rogue rigs, and organic fuel bar free for 7 full days.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Preferred Facility Location</label>
                <select
                  value={formData.preferredBranch}
                  onChange={(e) => setFormData({ ...formData, preferredBranch: e.target.value })}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="Downtown Flagship">Downtown Metro Flagship</option>
                  <option value="Uptown Athletic Center">Uptown Athletic Center</option>
                  <option value="Westside Performance Lab">Westside Performance Lab</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
                {loading ? 'Generating Trial Pass...' : 'Get Instant VIP Access Pass'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={56} color="var(--accent-green)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Pass Generated!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Show this VIP pass card at front desk upon arrival.</p>

            <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                {passResult.passCode}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{passResult.fullName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {passResult.preferredBranch}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '0.5rem' }}>VALID FOR 7 FREE DAYS ACCESS</div>
            </div>

            <button onClick={resetAndClose} className="btn btn-secondary" style={{ width: '100%' }}>
              Done & Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClassReservationModal({ setActivePage }) {
  const { selectedClass, closeClassModal, bookClassHandler, user } = useApp();
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [trainers, setTrainers] = React.useState([]);
  const [selectedTrainer, setSelectedTrainer] = React.useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    fetchAdminTrainers()
      .then(res => {
        if (res && res.success && res.trainers) {
          setTrainers(res.trainers);
        }
      })
      .catch(() => {});
  }, []);

  if (!selectedClass) return null;

  const handleBook = async () => {
    setSubmitting(true);
    const res = await bookClassHandler(selectedClass.id, preferredDate, selectedTrainer);
    setSubmitting(false);
    if (res.success) {
      closeClassModal();
    } else if (res.requireAuth && setActivePage) {
      closeClassModal();
      setActivePage('login');
    }
  };

  return (
    <div className="modal-overlay" onClick={closeClassModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <button onClick={closeClassModal} className="modal-close-btn">
          <X size={20} />
        </button>

        <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', marginBottom: '1.25rem' }}>
          <img src={selectedClass.image} alt={selectedClass.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)' }} />
          <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem' }}>
            <span className="badge badge-red" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>{selectedClass.category}</span>
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', fontFamily: 'var(--font-heading)', margin: 0 }}>{selectedClass.title}</h3>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
          {selectedClass.description}
        </p>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <User size={16} color="#0284C7" />
            <span>Coach: <strong>{selectedClass.trainer}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Clock size={16} color="#0284C7" />
            <span>Duration: <strong>{selectedClass.duration}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <MapPin size={16} color="#0284C7" />
            <span>Studio: <strong>{selectedClass.room}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <ShieldCheck size={16} color="#0D9488" />
            <span>Availability: <strong>{selectedClass.spotsLeft} spots left</strong></span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Select Reservation Date *
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0284c7', marginBottom: '0.4rem' }}>
              Choose Personal Trainer (Optional)
            </label>
            <select
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              style={{ ...inputStyle, background: '#ffffff', border: '1.5px solid #0284c7', color: '#0f172a', fontWeight: 700 }}
            >
              <option value="">-- Lead Coach: {selectedClass.trainer} --</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.fullName}>
                  {t.fullName} ({t.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>

        {!user && (
          <div style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#0284C7', marginBottom: '1.25rem' }}>
            💡 You will be prompted to sign in or register to complete your reservation.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={closeClassModal} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleBook} disabled={submitting} className="btn btn-primary" style={{ flex: 2 }}>
            {submitting ? 'Reserving...' : user ? 'Confirm Seat Reservation' : 'Sign In & Reserve Seat'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArticleModal() {
  const { selectedArticle, closeArticleModal } = useApp();

  if (!selectedArticle) return null;

  return (
    <div className="modal-overlay" onClick={closeArticleModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <button onClick={closeArticleModal} className="modal-close-btn">
          <X size={20} />
        </button>

        <span className="badge badge-red" style={{ marginBottom: '0.75rem' }}>{selectedArticle.category}</span>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: '1.25', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{selectedArticle.title}</h2>

        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <span>By <strong>{selectedArticle.author}</strong></span>
          <span>•</span>
          <span>{selectedArticle.date}</span>
          <span>•</span>
          <span>{selectedArticle.readTime}</span>
        </div>

        <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }} />

        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
          {selectedArticle.content}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};
