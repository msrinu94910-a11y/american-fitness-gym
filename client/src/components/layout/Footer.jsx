import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BrandLogo from '../common/BrandLogo';

export default function Footer({ setActivePage }) {
  const [email, setEmail] = useState('');
  const { showToast } = useApp();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    showToast('Subscribed! Check your inbox for exclusive workout guides.', 'success');
    setEmail('');
  };

  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <BrandLogo size={42} showText={true} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Built for champions. Premium 24/7 strength facility, powerlifting dungeon, and recovery spa engineered to push your boundaries.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'about', label: 'About Our Gym' },
                { id: 'memberships', label: 'Membership Plans' },
                { id: 'blog', label: 'Fitness & Nutrition Blog' },
                { id: 'contact', label: 'Contact Us' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      setActivePage(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Hours */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Facility Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>742 Fitness Boulevard, Metro Athletic District, NY 10001</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={20} color="#0284C7" style={{ flexShrink: 0 }} />
                <span>+1 (800) 555-GYM1</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={20} color="#0284C7" style={{ flexShrink: 0 }} />
                <span>support@americanfitness.com</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Clock size={20} color="#0D9488" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Open 24 Hours / 7 Days a Week</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Join The Athlete Newsletter</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Get weekly workout split routines, nutritional recipes, and exclusive member perks directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
                <Send size={16} /> Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>© {new Date().getFullYear()} American Fitness Project LLC. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
