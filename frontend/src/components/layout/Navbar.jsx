import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { LogOut, LayoutDashboard, QrCode } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logoutSession } = useApp();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0.75rem 0',
        transition: 'var(--transition-normal)'
      }}
    >
      <div className="container top-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        
        {/* Brand Logo (Clickable -> Home) */}
        <div
          onClick={() => setActivePage('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <BrandLogo size={42} showText={true} />
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#0284C7' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0.35rem 0',
                  transition: 'var(--transition-fast)'
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      background: 'var(--gradient-primary)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }} className="desktop-actions">
          {/* Admin Scanner Gateway Button (Visible for Admin Staff) */}
          {(user?.role === 'admin' || user?.email?.includes('admin')) && (
            <button
              onClick={() => setActivePage('admin-scanner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                background: activePage === 'admin-scanner' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'rgba(2, 132, 199, 0.12)',
                color: activePage === 'admin-scanner' ? '#ffffff' : '#0284c7',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Admin Control Center"
            >
              <QrCode size={15} />
              <span>Admin Center</span>
            </button>
          )}

          {/* Trainer Portal Gateway Button (Visible for Trainer Staff) */}
          {(user?.role === 'trainer' || user?.email?.includes('trainer')) && (
            <button
              onClick={() => setActivePage('trainer-dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                background: activePage === 'trainer-dashboard' ? 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)' : 'rgba(2, 132, 199, 0.12)',
                color: activePage === 'trainer-dashboard' ? '#ffffff' : '#0284c7',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Trainer Portal Dashboard"
            >
              <LayoutDashboard size={15} />
              <span>Trainer Portal</span>
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  if (user.role === 'admin' || user.email?.includes('admin')) {
                    setActivePage('admin-scanner');
                  } else if (user.role === 'trainer' || user.email?.includes('trainer')) {
                    setActivePage('trainer-dashboard');
                  } else {
                    setActivePage('dashboard');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LayoutDashboard size={15} />
                <span>
                  {user.role === 'admin' 
                    ? 'Admin Officer Portal' 
                    : user.role === 'trainer' 
                      ? 'Trainer Portal' 
                      : `Portal (${user.fullName ? user.fullName.split(' ')[0] : 'Member'})`}
                </span>
              </button>

              <button
                onClick={logoutSession}
                className="btn btn-secondary"
                style={{ padding: '0 0.85rem', height: '36px', fontSize: '0.82rem' }}
                title="Sign Out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setActivePage('login')}
                className="btn btn-primary"
                style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.88rem' }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
