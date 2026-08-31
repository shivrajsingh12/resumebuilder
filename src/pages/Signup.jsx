import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const safeName = name.trim();
    const safeEmail = email.trim();

    if (safeName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!safeEmail || !safeEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await signup(safeName, safeEmail, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess('Account created successfully! Redirecting to dashboard...');
    window.setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card auth-card--signup">
          <div className="auth-brand" aria-label="Folio home">
            folio<span>.</span>
          </div>

          <div className="auth-heading">
            <p className="auth-kicker">Create account</p>
            <h1>Start your resume journey</h1>
          </div>

          <p className="auth-subtitle">Set up your account and start building with confidence.</p>

          {error && <div className="auth-message auth-message--error">{error}</div>}
          {success && <div className="auth-message auth-message--success">{success}</div>}

          <form className="auth-form" onSubmit={handleSignup} noValidate>
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Morgan"
                autoComplete="name"
                required
              />
            </label>

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className={`auth-hint ${password.length >= 6 ? 'auth-hint--success' : ''}`}>
              {password.length === 0 ? 'Use at least 6 characters.' : password.length >= 6 ? 'Password strength looks good.' : 'Password needs at least 6 characters.'}
            </div>

            <label className="auth-field">
              <span>Confirm password</span>
              <div className="auth-input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className={`auth-hint ${confirmPassword.length > 0 && password === confirmPassword ? 'auth-hint--success' : ''}`}>
              {confirmPassword.length === 0 ? 'Confirm your password.' : password === confirmPassword ? 'Passwords match.' : 'Passwords do not match.'}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;

