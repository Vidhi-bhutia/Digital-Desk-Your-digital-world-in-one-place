import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, UserPlus } from 'lucide-react';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please provide a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      toast.success('Account created. Verify your email to continue.');
      navigate(`/verify-email?email=${encodeURIComponent(res.email || email)}`);
    } catch (err) {
      const message = err.code === 'EMAIL_IN_USE' || err.code === 'DUPLICATE_KEY_ERROR'
        ? 'An account with this email already exists. Log in or use Forgot password to get back into your account.'
        : err.message || 'We could not create your account. Please try again.';
      setError(message);
    }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout className="auth-register">
      <header className="auth-heading">
        <h2>Create Your Workspace</h2>
        <p>Everything you need to organize your digital life starts here.</p>
      </header>
      {error && <div className="auth-feedback" role="alert" aria-live="assertive"><ErrorMessage title="Registration error" message={error} /></div>}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input label="Full Name" type="text" id="register-name" name="name" placeholder="Alex Morgan" icon={User} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        <Input label="Email Address" type="email" id="register-email" name="email" placeholder="you@example.com" icon={Mail} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <PasswordInput label="Password" id="register-password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} showStrength autoComplete="new-password" required />
        <PasswordInput label="Confirm Password" id="register-confirm-password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null} autoComplete="new-password" required />
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} icon={UserPlus}>Create Account</Button>
      </form>
      <div className="auth-switch">Already have an account? <Link className="auth-link" to="/login">Log in</Link></div>
    </AuthLayout>
  );
};

export default RegisterPage;
