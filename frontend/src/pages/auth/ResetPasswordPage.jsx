import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <LogoFull size={40} />
      </div>

      <Card style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
            Reset your password
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Enter your new password below
          </p>
        </div>

        {error && <ErrorMessage title="Reset failed" message={error} />}

        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={20} />
              <span>Your password has been updated.</span>
            </div>

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary" fullWidth icon={ArrowLeft}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PasswordInput
              label="New password"
              id="reset-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength
              required
            />

            <PasswordInput
              label="Confirm password"
              id="reset-confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
              Reset password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
