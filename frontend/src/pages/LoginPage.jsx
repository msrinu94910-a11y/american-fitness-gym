import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { loginUser, registerUser } from '../services/api';
import { Dumbbell, Lock, Mail, ArrowRight, User, Sparkles } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { user, loginSession, showToast } = useApp();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  // Account & Domain Selection state
  const [accountRole, setAccountRole] = useState('user'); // 'user' or 'admin'
  const [selectedDomain, setSelectedDomain] = useState('Downtown Metro Flagship');

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Pro Athlete');

  // Instant Automatic Navigation Guard: Redirect when authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.email?.includes('admin')) {
        setActivePage('admin-scanner');
      } else {
        setActivePage('dashboard');
      }
    }
  }, [user, setActivePage]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter your email address and password.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword,
        role: accountRole,
        domain: selectedDomain
      });
      if (res.success) {
        loginSession(res.user, res.token);
        showToast(res.message, 'success');
        if (res.user?.role === 'admin' || accountRole === 'admin') {
          setActivePage('admin-scanner');
        } else {
          setActivePage('dashboard');
        }
      } else {
        showToast(res.message || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      showToast('Please fill in all required registration fields.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        membershipPlan: selectedPlan,
        role: accountRole,
        domain: selectedDomain
      });
      if (res.success) {
        loginSession(res.user, res.token);
        showToast(res.message, 'success');
        if (res.user?.role === 'admin' || accountRole === 'admin') {
          setActivePage('admin-scanner');
        } else {
          setActivePage('dashboard');
        }
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut login helper
  const handleDemoLogin = () => {
    setLoginEmail('alex.morgan@example.com');
    setLoginPassword('password123');
  };

  // If user is already logged in, redirect or display quick jump button
  if (user) {
    return (
      <div style={{ paddingTop: '5rem', paddingBottom: '6rem', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid #0284C7' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <User size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              LOGGED IN AS {user.fullName ? user.fullName.toUpperCase() : 'MEMBER'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
              Your session is active with {user.membershipPlan || 'Pro Athlete'} access.
            </p>
            <button
              onClick={() => setActivePage((user.role === 'admin' || user.email?.includes('admin')) ? 'admin-scanner' : 'dashboard')}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '1rem',
                fontWeight: 800,
                background: (user.role === 'admin' || user.email?.includes('admin')) ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : undefined
              }}
            >
              {(user.role === 'admin' || user.email?.includes('admin')) ? 'Open Admin Scanner Dashboard' : 'Open Member Portal Dashboard'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '6rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '520px' }}>

        {/* Unified Sign In Card */}
        {mode === 'login' && (
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderTop: '4px solid #0284C7' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--gradient-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: 'var(--shadow-glow)' }}>
              <Lock size={30} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.4rem', fontWeight: 900 }}>
              PORTAL SIGN IN
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Sign in to access your 24/7 Digital QR Keycard Pass, Class Reservations, or Admin Scanner Portal.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} color="var(--text-muted)" style={iconStyle} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Demo Quick Fill Shortcuts */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('alex.morgan@example.com');
                    setLoginPassword('password123');
                    setAccountRole('user');
                  }}
                  style={{ flex: 1, minWidth: '160px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', color: '#0284C7', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  ⚡ Fill User Member (Alex)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@americanfitness.com');
                    setLoginPassword('admin123');
                    setAccountRole('admin');
                  }}
                  style={{ flex: 1, minWidth: '160px', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', color: '#d97706', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  🛡️ Fill Admin Officer (Scanner)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  marginTop: '0.5rem',
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                {loading ? 'Authenticating Access...' : 'SIGN IN TO PORTAL'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Don't have an account yet?{' '}
              <button
                onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register Account Now
              </button>
            </div>
          </div>
        )}

        {/* Register Mode */}
        {mode === 'register' && (
          <div className="glass-card" style={{ padding: '2.25rem 1.75rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <User size={28} color="#0D9488" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              CREATE ATHLETE PROFILE
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Register your account to activate instant 24/7 digital keycard access.
            </p>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              {/* Role Selection Option */}
              <div>
                <label style={labelStyle}>Select Account Access Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setAccountRole('user')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: accountRole === 'user' ? '2px solid #0284C7' : '1px solid var(--border-glass)',
                      background: accountRole === 'user' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
                      color: accountRole === 'user' ? '#0284C7' : 'var(--text-muted)',
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
                    onClick={() => setAccountRole('admin')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: accountRole === 'admin' ? '2px solid #d97706' : '1px solid var(--border-glass)',
                      background: accountRole === 'admin' ? 'rgba(217, 119, 6, 0.12)' : 'var(--bg-card)',
                      color: accountRole === 'admin' ? '#d97706' : 'var(--text-muted)',
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

              {/* Facility Domain Selection Option */}
              <div>
                <label style={labelStyle}>Facility Domain Branch *</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
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
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '1rem' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '1rem' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '1rem' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '1rem' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Membership Tier Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '1rem', appearance: 'none' }}
                >
                  <option value="Basic Gym Access">Basic Gym Access ($29/mo)</option>
                  <option value="Pro Athlete">Pro Athlete ($59/mo - Most Popular)</option>
                  <option value="VIP Elite">VIP Elite ($99/mo - All Inclusive)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.98rem', marginTop: '0.5rem' }}>
                {loading ? 'Creating Account...' : accountRole === 'admin' ? <><Sparkles size={16} /> Complete Admin Registration & Open Scanner</> : <><Sparkles size={16} /> Complete Member Registration & Open Dashboard</>}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' };
const iconStyle = { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' };
const inputStyle = {
  width: '100%',
  height: '44px',
  paddingLeft: '2.75rem',
  paddingRight: '1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-glass)',
  background: 'var(--bg-card)',
  fontSize: '0.9rem',
  color: 'var(--text-main)',
  outline: 'none'
};
