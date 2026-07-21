import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Flame } from 'lucide-react';
import { submitContactForm } from '../services/api';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast, openDayPass } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitContactForm(formData);
      if (res.success) {
        setSubmitted(true);
        showToast('Message sent! Our support staff will contact you shortly.', 'success');
      } else {
        showToast(res.message || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Error connecting to gym server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Get In Touch</span>
          <h2 className="section-title">CONTACT & <span className="gradient-text">LOCATION INFO</span></h2>
          <p className="section-subtitle">
            Have a question about membership rates, personal training, or group class schedules? Drop us a line or visit our facility.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          
          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Send Us A Message</h3>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Membership Rates">Membership Rates & Transfers</option>
                    <option value="Personal Training">Personal Training Consultation</option>
                    <option value="Group Classes">Group Class Schedule</option>
                    <option value="Corporate Wellness">Corporate Wellness Program</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }}>
                  {loading ? 'Sending Message...' : 'Submit Contact Message'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={54} color="var(--accent-green)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Message Received!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Thank you for reaching out to American Fitness Gym. Our team will review your inquiry and respond within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary">
                  Send Another Message
                </button>
              </div>
            )}
          </div>

          {/* Details & Location Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Flagship Location & Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <MapPin size={22} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>Address:</strong>
                    742 Fitness Boulevard, Metro Athletic District, NY 10001
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Phone size={22} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>Phone Support:</strong>
                    +1 (800) 555-GYM1 / (212) 555-9080
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Mail size={22} color="var(--accent-red)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>Email Support:</strong>
                    info@americanfitness.com
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Clock size={22} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--accent-gold)', display: 'block' }}>Operating Hours:</strong>
                    24 Hours / 7 Days A Week (Staffed 6am - 10pm Daily)
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Interactive Map */}
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'radial-gradient(circle, #19202c 0%, #121720 100%)' }}>
              <MapPin size={36} color="var(--accent-red)" style={{ marginBottom: '0.5rem' }} />
              <h5 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Metro Athletic District Branch</h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Validated Parking Available for Members</p>
              <button onClick={openDayPass} className="btn btn-gold" style={{ width: '100%', fontSize: '0.9rem' }}>
                <Flame size={16} /> Get Free Day Pass & Directions
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' };
const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};
