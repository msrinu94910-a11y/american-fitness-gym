import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Dumbbell, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { registerUser } from '../services/api';

export default function RegisterPage({ setActivePage }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    membershipPlan: 'Pro Athlete',
    role: 'user',
    domain: 'Downtown Metro Flagship'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { loginSession, showToast } = useApp();

  const handleRegister = async (e) => {
    e.preventDefault();

    const effectivePassword = formData.password;
    const effectiveConfirm = formData.confirmPassword || formData.password;

    if (effectivePassword !== effectiveConfirm) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Please accept the Gym Safety Guidelines.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        confirmPassword: effectiveConfirm
      };

      const res = await registerUser(payload);
      if (res.success) {
        loginSession(res.user, res.token);
        setRegisteredUser(res.user);
        showToast(`Registration Successful as ${res.user.role === 'admin' ? 'Admin Officer' : 'Member'}!`, 'success');
        
        if (res.user.role === 'admin' || formData.role === 'admin') {
          setActivePage('admin-scanner');
        } else {
          setShowSuccessModal(true);
        }
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
            
            {/* Account Type Selection */}
            <div>
              <label style={labelStyle}>Select Account Access Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.role === 'user' ? '2px solid #0284C7' : '1px solid var(--border-glass)',
                    background: formData.role === 'user' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
                    color: formData.role === 'user' ? '#0284C7' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <User size={16} /> User Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.role === 'admin' ? '2px solid #d97706' : '1px solid var(--border-glass)',
                    background: formData.role === 'admin' ? 'rgba(217, 119, 6, 0.12)' : 'var(--bg-card)',
                    color: formData.role === 'admin' ? '#d97706' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Lock size={16} /> Admin Officer
                </button>
              </div>
            </div>

            {/* Facility Domain Selection */}
            <div>
              <label style={labelStyle}>Facility Domain Branch *</label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                style={{ ...inputStyle, paddingLeft: '1rem', appearance: 'none' }}
              >
                <option value="Downtown Metro Flagship">🏢 Downtown Metro Flagship (downtown.americanfitness.com)</option>
                <option value="Uptown Athletic Center">🏋️ Uptown Athletic Center (uptown.americanfitness.com)</option>
                <option value="Westside Performance Lab">⚡ Westside Performance Lab (westside.americanfitness.com)</option>
                <option value="Northside Elite Gym">🛡️ Northside Elite Gym (northside.americanfitness.com)</option>
              </select>
            </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                height: '48px',
                fontSize: '1.05rem',
                background: formData.role === 'admin' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : undefined,
                boxShadow: formData.role === 'admin' ? '0 8px 25px rgba(217, 119, 6, 0.35)' : undefined
              }}
            >
              {loading
                ? 'Creating Account...'
                : formData.role === 'admin'
                  ? <><Sparkles size={20} /> Complete Admin Registration & Open Scanner</>
                  : <><UserPlus size={20} /> Complete Membership Registration</>
              }
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

      {/* Registration Successful Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 12, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 20px 50px rgba(16, 185, 129, 0.15)',
              position: 'relative'
            }}
          >
            {/* Animated Check Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                marginBottom: '1.5rem'
              }}
            >
              <CheckCircle2 size={42} color="#ffffff" />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Sparkles size={14} /> REGISTRATION SUCCESSFUL
            </div>

            <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              WELCOME TO THE <span style={{ color: '#10B981' }}>TRIBE!</span>
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Congratulations <strong style={{ color: 'var(--text-main)' }}>{registeredUser?.fullName || formData.fullName}</strong>! Your official <strong style={{ color: '#10B981' }}>{registeredUser?.membershipPlan || formData.membershipPlan}</strong> membership has been created.
            </p>

            {/* Pass Summary Badge */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1rem', marginBottom: '1.8rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEMBER ID</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {registeredUser?.id?.toUpperCase() || 'AFG-PENDING'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEMBERSHIP TIER</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                  {registeredUser?.membershipPlan || formData.membershipPlan}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DIGITAL 24/7 PASS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> UNLOCKED & ACTIVE
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                if (registeredUser?.role === 'admin' || formData.role === 'admin') {
                  setActivePage('admin-scanner');
                } else {
                  setActivePage('dashboard');
                }
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '52px',
                fontSize: '1.05rem',
                borderRadius: '14px',
                background: (registeredUser?.role === 'admin' || formData.role === 'admin') ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {(registeredUser?.role === 'admin' || formData.role === 'admin') ? (
                <>Open Admin Scanner Dashboard <ArrowRight size={18} /></>
              ) : (
                <>Go to Member Dashboard & QR Pass <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}
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
