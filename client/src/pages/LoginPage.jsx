import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginUser } from '../services/api';

export default function LoginPage({ setActivePage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginSession, showToast } = useApp();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        loginSession(res.user, res.token);
        showToast(res.message, 'success');
        setActivePage('home');
      } else {
        showToast(res.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '6rem', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        
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
              MEMBER <span className="gradient-text">LOGIN</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Sign in to access your 24/7 digital keycard pass and membership settings.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={iconStyle} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0284C7' }} />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Password reset link sent to registered email address.', 'info');
                }}
                style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '48px', fontSize: '1.05rem' }}>
              {loading ? 'Signing In...' : <><LogIn size={20} /> Sign In to Dashboard</>}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Don't have an athletic membership yet?{' '}
            <button
              onClick={() => setActivePage('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284C7',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Register Account Now
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
