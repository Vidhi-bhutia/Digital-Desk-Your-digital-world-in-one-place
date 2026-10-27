import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoFull } from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: OTP + New Password Form, 3: Success
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 mins

  const inputRefs = useRef([]);
  const toast = useToast();
  const navigate = useNavigate();

  // Timer countdown effect for Step 2
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 1: Request OTP Code
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
      setTimer(600);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success('6-digit OTP code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-Digit Input Change & Auto Focus Next Box
  const handleDigitChange = (index, value) => {
    const char = value.replace(/[^0-9]/g, '');
    if (!char && value !== '') return;

    const newDigits = [...otpDigits];

    if (char.length > 1) {
      const pasted = char.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      inputRefs.current[5]?.focus();
      return;
    }

    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // STEP 2: Verify OTP Code & Set New Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
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
      await authService.resetPassword(fullOtp, newPassword, email);
      toast.success('Password updated successfully!');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <LogoFull size={42} />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            {step === 1 ? (
              <KeyRound size={26} />
            ) : step === 2 ? (
              <ShieldCheck size={26} />
            ) : (
              <CheckCircle2 size={26} />
            )}
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            {step === 1 ? 'Forgot Your Password?' : step === 2 ? 'Security Verification' : 'Password Reset Complete'}
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, maxWidth: '380px', margin: '0 auto' }}>
            {step === 1
              ? "Enter your account email to receive a 6-digit OTP verification code."
              : step === 2
              ? `Enter the 6-digit OTP code sent to ${email} and your new password.`
              : 'Your password has been updated successfully. You can now log in.'}
          </p>
        </div>

        {error && <ErrorMessage title="Error" message={error} />}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Account Email Address"
              type="email"
              id="forgot-email"
              name="email"
              placeholder="alex@digitaldesk.app"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
              Send 6-Digit OTP Code
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

        {/* STEP 2: 6-Digit OTP Code + New Password */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                  6-Digit OTP Code <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <span style={{ fontSize: '12px', fontWeight: 700, color: timer > 60 ? 'var(--color-brand)' : 'var(--color-danger)', fontFamily: 'monospace' }}>
                  Expires in: {formatTimer(timer)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '52px',
                      height: '56px',
                      borderRadius: 'var(--radius-md)',
                      border: digit ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                      backgroundColor: digit ? 'var(--color-brand-subtle)' : 'var(--color-surface)',
                      color: 'var(--color-brand-dark)',
                      fontSize: '22px',
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)',
                    }}
                  />
                ))}
              </div>
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading || timer > 540}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: timer > 540 ? 0.5 : 1,
                }}
              >
                <RefreshCw size={14} /> Resend OTP Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Banner */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              <CheckCircle2 size={24} />
              <span>Password updated successfully!</span>
            </div>

            <Button variant="primary" size="lg" fullWidth icon={ArrowLeft} onClick={() => navigate('/login')}>
              Proceed to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
