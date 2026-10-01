import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [debugUrl, setDebugUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      setResponseMessage(res.message || 'If an account exists for this email, reset instructions have been sent.');
      if (res.debugResetUrl) {
        setDebugUrl(res.debugResetUrl);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
            Forgot your password?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Enter your email and we'll send instructions to reset your password.
          </p>
        </div>

        {error && <ErrorMessage title="Error" message={error} />}

        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '14px',
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{responseMessage}</div>
            </div>

            {/* Development helper link when SMTP is not configured */}
            {debugUrl && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px stroke var(--color-border)',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-brand)', marginBottom: '4px' }}>
                  Development Direct Reset Link:
                </div>
                <Link
                  to={debugUrl.replace('http://localhost:5173', '')}
                  style={{ color: 'var(--color-text)', wordBreak: 'break-all', fontWeight: 600 }}
                >
                  Click here to simulate opening password reset link
                </Link>
              </div>
            )}

            <Link to="/login" style={{ textDecoration: 'none', marginTop: '8px' }}>
              <Button variant="outline" fullWidth icon={ArrowLeft}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Email Address"
              type="email"
              id="forgot-email"
              name="email"
              placeholder="alex@digitaldesk.app"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
              Send reset link
            </Button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
