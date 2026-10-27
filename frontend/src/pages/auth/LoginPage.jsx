import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowRight, ShieldCheck, Zap, Sparkles, Github } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const handleGithubSignIn = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/auth/google`;
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

        <div>
          <LogoFull size={40} showTagline={false} />
        </div>

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
              <span>Real GitHub & Google OAuth 2.0 single sign-on</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
              <Zap size={20} color="var(--color-brand-light)" />
              <span>Personalized welcome email & 6-digit OTP security</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
          © {new Date().getFullYear()} Digital Desk. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form & OAuth Buttons */}
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
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Log in to access your Digital Desk
            </p>
          </div>

          {error && <ErrorMessage title="Authentication failed" message={error} />}

          {/* Real OAuth 2.0 Sign In Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleGithubSignIn}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Github size={18} /> Continue with GitHub
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
              or sign in with email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
              marginTop: '28px',
              paddingTop: '20px',
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
