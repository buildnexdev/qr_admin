import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import type { RootState, AppDispatch } from '../store';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <>
      {/* ── Google Fonts ──────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Reset & base ─────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── CSS Variables ────────────────────────────────────── */
        :root {
          --bg:        #0e0b08;
          --surface:   #19140e;
          --card:      #1f1810;
          --amber:     #f59e0b;
          --amber-lt:  #fbbf24;
          --ember:     #ea580c;
          --cream:     #fef3c7;
          --muted:     #a8956e;
          --border:    rgba(245,158,11,0.15);
          --glow:      rgba(245,158,11,0.25);
          --radius:    18px;
        }

        /* ── Page shell ───────────────────────────────────────── */
        .craving-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Radial ambient glow ──────────────────────────────── */
        .craving-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 25% 50%, rgba(234,88,12,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 75% 50%, rgba(245,158,11,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Floating food particles ──────────────────────────── */
        .food-particle {
          position: absolute;
          user-select: none;
          pointer-events: none;
          animation: floatBob linear infinite;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
          opacity: 0.55;
          will-change: transform;
        }
        @keyframes floatBob {
          0%   { transform: translateY(0px)   rotate(0deg);  }
          25%  { transform: translateY(-18px) rotate(6deg);  }
          50%  { transform: translateY(-8px)  rotate(-4deg); }
          75%  { transform: translateY(-22px) rotate(3deg);  }
          100% { transform: translateY(0px)   rotate(0deg);  }
        }

        /* ── Split layout ─────────────────────────────────────── */
        .craving-split {
          position: relative;
          z-index: 10;
          display: flex;
          width: min(960px, 95vw);
          min-height: 560px;
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow:
            0 0 0 1px var(--border),
            0 40px 100px rgba(0,0,0,0.7),
            0 0 80px rgba(245,158,11,0.08) inset;
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: cardReveal 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }
        @keyframes cardReveal {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Brand / visual left panel ────────────────────────── */
        .brand-panel {
          flex: 1.1;
          background:
            linear-gradient(160deg, #1a1008 0%, #0e0b08 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 40px;
          position: relative;
          overflow: hidden;
          border-right: 1px solid var(--border);
        }

        /* Decorative plate ring */
        .plate-ring {
          position: absolute;
          right: -90px;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 60px solid rgba(245,158,11,0.04);
          box-shadow:
            0 0 0 20px rgba(245,158,11,0.03),
            0 0 0 40px rgba(245,158,11,0.02);
        }

        /* Steam lines */
        .steam { position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); }
        .steam-line {
          display: inline-block;
          width: 3px;
          height: 40px;
          background: linear-gradient(to top, var(--amber), transparent);
          border-radius: 99px;
          margin: 0 6px;
          animation: steamRise 2.4s ease-in-out infinite;
          opacity: 0;
        }
        .steam-line:nth-child(2) { animation-delay: 0.5s; height: 55px; }
        .steam-line:nth-child(3) { animation-delay: 1s;   height: 35px; }
        @keyframes steamRise {
          0%   { opacity: 0;   transform: translateY(0)    scaleX(1);   }
          30%  { opacity: 0.6; }
          100% { opacity: 0;   transform: translateY(-50px) scaleX(1.6); }
        }

        /* Bowl icon */
        .bowl-hero {
          font-size: 72px;
          text-align: center;
          display: block;
          filter: drop-shadow(0 8px 24px rgba(245,158,11,0.4));
          animation: bowlPulse 3s ease-in-out infinite;
        }
        @keyframes bowlPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }

        .brand-top { position: relative; z-index: 2; }
        .brand-wordmark {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.12em;
          color: var(--amber);
          text-transform: uppercase;
        }
        .wordmark-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--ember);
          animation: dotPing 2s ease-in-out infinite;
        }
        @keyframes dotPing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.7); }
          50%       { box-shadow: 0 0 0 8px rgba(234,88,12,0);  }
        }

        .brand-hero { position: relative; z-index: 2; text-align: center; padding: 16px 0; }
        .brand-hero h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 38px);
          font-weight: 700;
          color: var(--cream);
          line-height: 1.2;
          margin-bottom: 14px;
        }
        .brand-hero h2 em {
          font-style: italic;
          color: var(--amber-lt);
        }
        .brand-hero p {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 220px;
          margin: 0 auto;
        }

        .brand-bottom { position: relative; z-index: 2; }
        .qr-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(245,158,11,0.1);
          border: 1px solid var(--border);
          border-radius: 40px;
          padding: 8px 16px;
          font-size: 12px;
          color: var(--amber);
          letter-spacing: 0.06em;
          font-weight: 500;
        }
        .qr-icon { font-size: 18px; }

        /* ── Form right panel ─────────────────────────────────── */
        .form-panel {
          flex: 1;
          background: var(--card);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 44px;
        }

        .form-eyebrow {
          font-size: 11px;
          letter-spacing: 0.18em;
          color: var(--amber);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 10px;
          opacity: 0;
          animation: fadeSlideUp 0.5s ease 0.5s forwards;
        }
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 700;
          color: var(--cream);
          line-height: 1.15;
          margin-bottom: 6px;
          opacity: 0;
          animation: fadeSlideUp 0.5s ease 0.6s forwards;
        }
        .form-sub {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeSlideUp 0.5s ease 0.7s forwards;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Error */
        .error-toast {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 22px;
          animation: fadeSlideUp 0.3s ease forwards;
        }

        /* Input group */
        .field-group {
          margin-bottom: 18px;
          opacity: 0;
          animation: fadeSlideUp 0.5s ease forwards;
        }
        .field-group:nth-child(1) { animation-delay: 0.75s; }
        .field-group:nth-child(2) { animation-delay: 0.85s; }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .field-input {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #000;
          border: 1px solid rgba(245,158,11,0.12);
          border-radius: 12px;
          padding: 0 16px;
          height: 50px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus-within {
          border-color: rgba(245,158,11,0.45);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .field-input svg { color: var(--muted); flex-shrink: 0; transition: color 0.2s; }
        .field-input:focus-within svg { color: var(--amber); }
        .field-input input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
        }
        .field-input input:-webkit-autofill,
        .field-input input:-webkit-autofill:hover, 
        .field-input input:-webkit-autofill:focus, 
        .field-input input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #000 inset !important;
          -webkit-text-fill-color: #fff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .field-input input::placeholder { color: rgba(168,149,110,0.4); }

        /* Submit button */
        .btn-craving {
          width: 100%;
          height: 52px;
          margin-top: 10px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--ember) 0%, var(--amber) 100%);
          color: #1a0a00;
          box-shadow: 0 4px 24px rgba(245,158,11,0.3);
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          opacity: 0;
          animation: fadeSlideUp 0.5s ease 0.95s forwards;
        }
        .btn-craving::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--amber) 0%, var(--amber-lt) 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-craving:hover:not(:disabled)::before { opacity: 1; }
        .btn-craving:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(245,158,11,0.45);
        }
        .btn-craving:active:not(:disabled) { transform: translateY(0); }
        .btn-craving:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-craving > * { position: relative; z-index: 1; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .form-footer-txt {
          margin-top: 28px;
          text-align: center;
          font-size: 12px;
          color: rgba(168,149,110,0.45);
          opacity: 0;
          animation: fadeSlideUp 0.5s ease 1.05s forwards;
        }

        /* ── Responsive ───────────────────────────────────────── */
        @media (max-width: 680px) {
          .brand-panel { display: none; }
          .craving-split { width: 95vw; }
          .form-panel { padding: 40px 28px; }
        }
      `}</style>

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
                Craving
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
            <p className="form-eyebrow">Restaurant Portal</p>
            <h1 className="form-title">Welcome back,<br />Chef. 👋</h1>
            <p className="form-sub">Sign in to manage your menu & orders.</p>

            {error && <div className="error-toast">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="field-group">
                <label className="field-label">Username</label>
                <div className="field-input">
                  <User size={17} />
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

            <p className="form-footer-txt">
              © 2026 Craving System · All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
