import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [debugOtp, setDebugOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setStep(2);
      toast.success('OTP sent to your email!');
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(otp.trim(), newPassword, email);
      toast.success('Your password has been updated successfully!');
      setStep(3); // Success step
    } catch (err) {
      setError(err.message || 'Invalid or expired 6-digit OTP code.');
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
            {step === 2 ? <ShieldCheck size={24} /> : <KeyRound size={24} />}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
            {step === 1 ? 'Forgot your password?' : step === 2 ? 'Enter 6-Digit OTP' : 'Password Updated!'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {step === 1
              ? "Enter your email and we'll send a 6-digit OTP code to verify your account."
              : step === 2
              ? `Enter the 6-digit OTP code sent to ${email}`
              : 'Your password has been reset successfully. You can now log in.'}
          </p>
        </div>

        {error && <ErrorMessage title="Verification error" message={error} />}

        {/* Development Helper Box */}
        {debugOtp && step === 2 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-subtle)',
              border: '1px stroke var(--color-brand-light)',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--color-brand-dark)',
              textAlign: 'center',
            }}
          >
            <strong>DEV SIMULATION OTP:</strong>{' '}
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '4px', color: 'var(--color-brand)' }}>
              {debugOtp}
            </span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              Send OTP Code
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

        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="6-Digit OTP Code"
              type="text"
              id="otp-code"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '8px',
                textAlign: 'center',
              }}
            />

            <PasswordInput
              label="New Password"
              id="otp-new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showStrength
              required
            />

            <PasswordInput
              label="Confirm New Password"
              id="otp-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : null}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
              Verify OTP & Reset Password
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: '13px', cursor: 'pointer', fontWeight: 700 }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
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
              <span>Your password has been updated successfully.</span>
            </div>

            <Button variant="primary" fullWidth icon={ArrowLeft} onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
