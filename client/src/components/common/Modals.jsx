import React, { useState } from 'react';
import { X, Flame, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { submitTrialPassRequest } from '../../services/api';

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
        showToast('Free 1-Day Trial Pass generated successfully!', 'success');
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
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Claim Free 1-Day Trial Pass</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Experience our 24/7 fitness floor and recovery sauna free for 1 full day.</p>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div style={{ background: 'var(--bg-dark)', border: '2px dashed var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                {passResult.passCode}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{passResult.fullName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {passResult.preferredBranch}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '0.5rem' }}>VALID FOR 1 FREE DAY ACCESS</div>
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
  background: 'var(--bg-dark)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};
