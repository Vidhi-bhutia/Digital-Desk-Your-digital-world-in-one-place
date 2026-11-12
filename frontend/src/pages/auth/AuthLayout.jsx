import React from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';

export const AuthLayout = ({ children, className = '' }) => (
  <main className={`auth-scene ${className}`}>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="auth-card-brand"><LogoFull size={54} showTagline={false} /></div>
        {children}
        <p className="auth-privacy-note">A thoughtful space for your digital life.</p>
        <nav aria-label="Legal" style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', marginTop: 12, fontSize: 12 }}>
          <Link to="/privacy-policy" style={{ color: 'var(--color-text-muted)' }}>Privacy Policy</Link>
          <Link to="/terms-of-service" style={{ color: 'var(--color-text-muted)' }}>Terms of Service</Link>
        </nav>
      </div>
    </section>
  </main>
);

export default AuthLayout;
