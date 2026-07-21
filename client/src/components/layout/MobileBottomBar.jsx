import React from 'react';
import { Home, Sparkles, Phone, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MobileBottomBar({ activePage, setActivePage }) {
  const { user } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'login', label: user ? 'Profile' : 'Profile', icon: User }
  ];

  return (
    <div className="mobile-bottom-bar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id || (item.id === 'login' && activePage === 'register');

        return (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: isActive ? '#0284C7' : 'var(--text-muted)',
              flex: 1,
              padding: '0.45rem 0',
              cursor: 'pointer',
              position: 'relative',
              transition: 'var(--transition-fast)'
            }}
          >
            <Icon size={21} color={isActive ? '#0284C7' : 'var(--text-muted)'} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 600,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1
              }}
            >
              {item.label}
            </span>

            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '28px',
                  height: '3px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
                  borderRadius: '0 0 3px 3px'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
