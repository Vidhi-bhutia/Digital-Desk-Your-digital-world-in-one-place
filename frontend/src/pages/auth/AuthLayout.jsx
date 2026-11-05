import React from 'react';
import { LogoFull } from '../../components/common/Logo';

export const AuthLayout = ({ children, className = '' }) => (
  <main className={`auth-scene ${className}`}>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="auth-card-brand"><LogoFull size={54} showTagline={false} /></div>
        {children}
        <p className="auth-privacy-note">A thoughtful space for your digital life.</p>
      </div>
    </section>
  </main>
);

export default AuthLayout;
