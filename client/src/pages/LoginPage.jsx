import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Lock, Mail, ArrowRight, User, ShieldCheck, CheckCircle2, QrCode, LogOut, Sparkles } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { user, login, register, logout, addToast } = useApp();
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addToast('Please enter your email and password.', 'warning');
      return;
    }
    login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      addToast('Please fill in all required registration fields.', 'warning');
      return;
    }
    register(regName, regEmail, regPassword, regPhone, selectedPlan);
  };

  // If user is already logged in -> Show Member Profile Dashboard
  if (user) {
    return (
      <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem', background: '#ffffff', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: '4px solid #0284C7' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(2,132,199,0.12) 0%, rgba(13,148,136,0.12) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <User size={36} color="#0284C7" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              WELCOME BACK, {user.name || 'MEMBER'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Active Member Profile & Digital Keycard Credentials
            </p>

            {/* Digital Keycard Card */}
            <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', color: '#ffffff', marginBottom: '1.5rem', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                    AMERICAN FITNESS PROJECT
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '0.2rem' }}>
                    {user.name || 'Member'}
                  </div>
                </div>
                <div style={{ padding: '0.3rem 0.65rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                  24/7 VIP ACCESS
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>MEMBER ID</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>AFP-{user.id ? user.id.slice(0, 8).toUpperCase() : '984102'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', color: '#0f172a', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 800 }}>
                  <QrCode size={16} color="#0284C7" /> Tap Turnstile
                </div>
              </div>
            </div>

            {/* Profile Info Details */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-glass)', textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Membership Plan:</span>
                <span style={{ fontWeight: 700, color: '#0284C7' }}>Pro Athlete Access</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>24/7 Access Status:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={15} /> Active
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ width: '100%', height: '44px', fontSize: '0.92rem' }}
            >
              <LogOut size={16} /> Sign Out of Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If NOT logged in -> Show Toggle Hub for [ Sign In ] & [ Register Account ]
  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '5rem', background: '#ffffff', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        
        {/* Profile Mode Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-glass)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: mode === 'login' ? 'var(--gradient-primary)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Lock size={15} /> Member Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: mode === 'register' ? 'var(--gradient-primary)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles size={15} /> Register Account
          </button>
        </div>

        {/* 1. Sign In Form */}
        {mode === 'login' && (
          <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Dumbbell size={28} color="#0284C7" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              MEMBER SIGN IN
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
              Sign in to access your 24/7 digital keycard pass and profile settings.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
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
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
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
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Sign In to Profile <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have a membership account yet?{' '}
              <button
                onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register Account Now
              </button>
            </div>
          </div>
        )}

        {/* 2. Register Account Form */}
        {mode === 'register' && (
          <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <User size={28} color="#0D9488" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              CREATE ATHLETIC PROFILE
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
              Register your account to activate instant 24/7 digital keycard access.
            </p>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Complete Registration <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
