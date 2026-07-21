import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useApp();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About Us' },
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
        padding: '0.85rem 0',
        transition: 'var(--transition-normal)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActivePage('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <BrandLogo height={42} />
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  background: '#f1f5f9',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              >
                <User size={16} color="#0284C7" />
                <span>{user.name || 'Member'}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0 1rem', height: '38px', fontSize: '0.85rem' }}
                title="Sign Out"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setActivePage('login')}
                className="btn btn-secondary"
                style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.88rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setActivePage('register')}
                className="btn btn-primary"
                style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.88rem' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
