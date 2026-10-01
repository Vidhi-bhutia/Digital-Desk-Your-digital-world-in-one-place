import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Column: Brand Showcase Panel */}
      <div
        className="auth-brand-side"
        style={{
          flex: 1,
          backgroundColor: 'var(--color-brand-dark)',
          color: '#FFFFFF',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle geometric background overlay */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 81, 50, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Logo */}
        <div>
          <LogoFull size={40} showTagline={false} />
        </div>

        {/* Middle Hero Content */}
        <div style={{ maxWidth: '480px', margin: '40px 0' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--color-brand-light)',
              marginBottom: '20px',
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} /> Personal Digital Command Center
          </span>

          <h1
            style={{
              fontSize: '42px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginBottom: '20px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Your digital world, <br />
            <span style={{ color: 'var(--color-brand-light)' }}>in one place.</span>
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
            Streamline your daily workflow with unified email, code repositories, calendar schedules, tasks, and real-time insights—all inside a calm, privacy-focused dashboard.
          </p>

          <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
              <ShieldCheck size={20} color="var(--color-brand-light)" />
              <span>Secure HTTP-only session cookie protection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
              <Zap size={20} color="var(--color-brand-light)" />
              <span>Modular Phase 1 foundation ready for expandability</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
          © {new Date().getFullYear()} Digital Desk. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div
        className="auth-form-side"
        style={{
          flex: 1,
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Log in to access your Digital Desk
            </p>
          </div>

          {error && <ErrorMessage title="Authentication failed" message={error} />}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Email Address"
              type="email"
              id="login-email"
              name="email"
              placeholder="alex@digitaldesk.app"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <PasswordInput
                label="Password"
                id="login-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-brand)', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              icon={ArrowRight}
            >
              Log in
            </Button>
          </form>

          <div
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
            }}
          >
            New to Digital Desk?{' '}
            <Link
              to="/register"
              style={{ fontWeight: 700, color: 'var(--color-brand)', textDecoration: 'none' }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
