import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import './loginAuth.scss';

/* ─── Floating food particle data ─────────────────────────── */
const FOOD_PARTICLES = [
  { emoji: '🍕', size: 38, x: 8, y: 12, duration: 14, delay: 0 },
  { emoji: '🍔', size: 32, x: 80, y: 22, duration: 18, delay: 2 },
  { emoji: '🌮', size: 28, x: 20, y: 70, duration: 16, delay: 4 },
  { emoji: '🍜', size: 34, x: 70, y: 60, duration: 20, delay: 1 },
  { emoji: '🍣', size: 30, x: 45, y: 85, duration: 15, delay: 6 },
  { emoji: '🥗', size: 26, x: 60, y: 8, duration: 17, delay: 3 },
  { emoji: '🍰', size: 30, x: 88, y: 78, duration: 13, delay: 5 },
  { emoji: '🍷', size: 24, x: 5, y: 45, duration: 19, delay: 7 },
  { emoji: '🥩', size: 32, x: 92, y: 40, duration: 22, delay: 8 },
  { emoji: '🧆', size: 22, x: 35, y: 30, duration: 11, delay: 9 },
  { emoji: '🍦', size: 26, x: 75, y: 90, duration: 24, delay: 2.5 },
  { emoji: '🥐', size: 28, x: 15, y: 90, duration: 16, delay: 10 },
];

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {

    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <>
      <div className="craving-root">
        {/* Floating food particles */}
        {FOOD_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="food-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        <div className="craving-split">
          {/* ── Brand panel ─────────────────────────────────── */}
          <div className="brand-panel">
            <div className="plate-ring" />

            <div className="brand-top">
              <div className="brand-wordmark">
                <div className="wordmark-dot" />
                QR Order
              </div>
            </div>

            <div className="brand-hero">
              <span className="bowl-hero">🍽️</span>
              <div className="steam">
                <span className="steam-line" />
                <span className="steam-line" />
                <span className="steam-line" />
              </div>
              <h2>
                <em>Taste</em> meets<br />Technology.
              </h2>
              <p>
                Upload your menu once. Let your guests scan, explore and order — right at the table.
              </p>
            </div>

            <div className="brand-bottom">
              <div className="qr-badge">
                <span className="qr-icon">📲</span>
                QR · Dine-in · Contactless
              </div>
            </div>
          </div>

          {/* ── Form panel ──────────────────────────────────── */}
          <div className="form-panel">
            <p className="form-eyebrow">QR Order · Admin</p>
            <h1 className="form-title">Welcome back,<br />Chef. 👋</h1>
            <p className="form-sub">Sign in to manage branches, menu & orders.</p>

            {error && <div className="error-toast">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label className="field-label">Username</label>
                <div className="field-input">
                  <User size={17} />
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-input">
                  <Lock size={17} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-craving"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <Link to="/register" className="btn-auth-secondary">
              Register your restaurant
            </Link>

            <p className="form-footer-txt">
              © 2026 QR Order · Admin
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
