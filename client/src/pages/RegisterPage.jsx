import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { registerUser } from '../services/api';

export default function RegisterPage({ setActivePage }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipPlan: 'Pro Athlete'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const { loginSession, showToast } = useApp();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Please accept the Gym Safety Guidelines.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.success) {
        loginSession(res.user, res.token);
        showToast(res.message, 'success');
        setActivePage('home');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '6rem', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '580px' }}>
        
        <div className="glass-card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-card)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--gradient-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                marginBottom: '1rem'
              }}
            >
              <Dumbbell size={30} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              JOIN THE <span className="gradient-text">ATHLETE TRIBE</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Create your account to activate 24/7 keycard access and instant membership perks.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={iconStyle} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type="email"
                    required
                    placeholder="marcus@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Desired Membership Tier</label>
              <select
                value={formData.membershipPlan}
                onChange={(e) => setFormData({ ...formData, membershipPlan: e.target.value })}
                style={{ ...inputStyle, paddingLeft: '1rem', appearance: 'none' }}
              >
                <option value="Basic Gym Access">Basic Gym Access ($29/mo)</option>
                <option value="Pro Athlete">Pro Athlete ($59/mo - Most Popular)</option>
                <option value="VIP Elite">VIP Elite ($99/mo - All Inclusive)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: '#0284C7' }}
                />
                <span>I agree to American Fitness Gym Safety Guidelines</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '48px', fontSize: '1.05rem' }}>
              {loading ? 'Creating Account...' : <><UserPlus size={20} /> Complete Membership Registration</>}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Already have an active membership?{' '}
            <button
              onClick={() => setActivePage('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284C7',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Sign In Here
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' };
const iconStyle = { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' };
const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem 0.85rem 2.8rem',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.95rem'
};
