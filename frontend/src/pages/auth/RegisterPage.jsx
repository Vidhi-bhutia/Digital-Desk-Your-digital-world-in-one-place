import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      toast.success(`Account created successfully! Welcome to Digital Desk, ${res.user.name}.`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Column: Brand Panel */}
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
            bottom: '-100px',
            left: '-100px',
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
            <Sparkles size={14} /> Join Digital Desk Today
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
            Set up your clean digital command center. Built with privacy, speed, and beautiful light/dark design tokens from day one.
          </p>

          <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Unified workspace foundation', 'Dark forest green design system', 'Secure HTTP-only authentication'].map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle2 size={18} color="var(--color-brand-light)" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
          © {new Date().getFullYear()} Digital Desk. All rights reserved.
        </div>
      </div>

      {/* Right Column: Register Form */}
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
              Create your Digital Desk
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Start organizing your digital life today
            </p>
          </div>

          {error && <ErrorMessage title="Registration error" message={error} />}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Full Name"
              type="text"
              id="register-name"
              name="name"
              placeholder="Alex Morgan"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              id="register-email"
              name="email"
              placeholder="alex@digitaldesk.app"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              id="register-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength
              required
            />

            <PasswordInput
              label="Confirm Password"
              id="register-confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              icon={UserPlus}
              style={{ marginTop: '8px' }}
            >
              Create account
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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ fontWeight: 700, color: 'var(--color-brand)', textDecoration: 'none' }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
