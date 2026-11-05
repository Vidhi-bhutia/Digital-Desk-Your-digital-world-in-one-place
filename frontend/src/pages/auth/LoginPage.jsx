import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'EMAIL_UNVERIFIED') {
        navigate(`/verify-email?email=${encodeURIComponent(err.details?.email || email)}`);
        return;
      }
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout className="auth-login">
      <header className="auth-heading">
        <h2>Welcome Back!</h2>
        <p>Log in to continue to your personal digital workspace.</p>
      </header>
      {error && <div className="auth-feedback"><ErrorMessage title="Unable to log in" message={error} /></div>}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input label="Email Address" type="email" id="login-email" name="email" placeholder="you@example.com" icon={Mail} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        <div>
          <PasswordInput label="Password" id="login-password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          <div className="auth-forgot"><Link className="auth-link" to="/forgot-password">Forgot password?</Link></div>
        </div>
        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} icon={ArrowRight}>Log in</Button>
      </form>
      <div className="auth-switch">New to Digital Desk? <Link className="auth-link" to="/register">Create an account</Link></div>
    </AuthLayout>
  );
};

export default LoginPage;
