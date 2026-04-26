import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, User, Mail, Phone, MapPin, FileText, Loader2, ArrowLeft, QrCode } from 'lucide-react';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import '../Login/loginAuth.scss';

const API_BASE_URL = 'http://localhost:5000/api';

/** Matches backend `registerController` email check */
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | undefined {
  const t = value.trim();
  if (!t) return 'Email is required';
  if (!EMAIL_RX.test(t)) return 'Enter a valid email address';
  return undefined;
}

function phoneDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function validatePhone(value: string): string | undefined {
  const t = value.trim();
  if (!t) return 'Phone is required';
  const digits = phoneDigitsOnly(t);
  if (digits.length !== 10) return 'Enter exactly 10 digits (mobile number)';
  return undefined;
}

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

const Register: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});
  const [form, setForm] = useState({
    restaurantName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });

  const update = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setFieldErrors((e) => ({ ...e, email: undefined }));
    if (name === 'phone') setFieldErrors((e) => ({ ...e, phone: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    setFieldErrors({ email: emailErr, phone: phoneErr });
    if (emailErr || phoneErr) {
      triggerToast('Check your details', 'error', [emailErr, phoneErr].filter(Boolean).join(' · '));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post<{ message?: string; emailSent?: boolean }>(
        `${API_BASE_URL}/register`,
        {
          restaurantName: form.restaurantName.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim(),
          phone: phoneDigitsOnly(form.phone),
          message: [form.city.trim() ? `City / area: ${form.city.trim()}` : '', form.message.trim()]
            .filter(Boolean)
            .join('\n\n'),
        }
      );
      const subtitle =
        data?.message ||
        (data?.emailSent ? 'We will contact you at your email soon.' : 'Your details were saved.');
      triggerToast(data?.emailSent ? 'Request sent' : 'Registration saved', data?.emailSent ? 'success' : 'warning', subtitle);
      setFieldErrors({});
      setForm({
        restaurantName: '',
        contactName: '',
        email: '',
        phone: '',
        city: '',
        message: '',
      });
    } catch (err) {
      triggerToast('Could not send', 'error', getApiErrorMessage(err, 'Failed to submit registration'));
    }
    setSubmitting(false);
  };

  return (
    <div className="craving-root">
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
        <div className="brand-panel">
          <div className="brand-panel-glow" />
          <div className="brand-panel-mesh" />

          <div className="brand-top">
            <div className="nammaqr-wordmark">
              <QrCode size={24} className="logo-icon" />
              <span>NammaQr</span>
            </div>
          </div>

          <div className="brand-hero-cinematic">
            <div className="hero-floating-card">
              <FileText size={48} className="hero-icon" />
              <div className="card-shine" />
            </div>
            
            <h2 className="cinematic-title">
              Join the <span>Platform</span> today.
            </h2>
            <p className="cinematic-sub">
              Tell us about your restaurant and who to contact. We will email you next steps.
            </p>
          </div>

          <div className="brand-bottom">
            <div className="premium-capsule">
              <span className="dot" />
              <span>Request · Review · Onboard</span>
            </div>
          </div>
        </div>

        <div className="form-panel form-panel--scroll">
          <p className="form-eyebrow">QR Order · Admin</p>
          <h1 className="form-title">Register your restaurant</h1>
          <p className="form-sub">Restaurant details and your contact info are sent to our team by email.</p>

          <form className="auth-form-no-stagger" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Restaurant / business name *</label>
              <div className="field-input">
                <Building2 size={17} />
                <input
                  type="text"
                  placeholder="e.g. Namma Kitchen"
                  value={form.restaurantName}
                  onChange={(e) => update('restaurantName', e.target.value)}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Your full name *</label>
              <div className="field-input">
                <User size={17} />
                <input
                  type="text"
                  placeholder="Primary contact person"
                  value={form.contactName}
                  onChange={(e) => update('contactName', e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Email *</label>
              <div className={`field-input${fieldErrors.email ? ' field-input--invalid' : ''}`}>
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="you@restaurant.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  onBlur={(e) => setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))}
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </div>
              {fieldErrors.email ? <p className="field-inline-error">{fieldErrors.email}</p> : null}
            </div>

            <div className="field-group">
              <label className="field-label">Phone *</label>
              <div className={`field-input${fieldErrors.phone ? ' field-input--invalid' : ''}`}>
                <Phone size={17} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  onBlur={(e) => setFieldErrors((prev) => ({ ...prev, phone: validatePhone(e.target.value) }))}
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                />
              </div>
              {fieldErrors.phone ? <p className="field-inline-error">{fieldErrors.phone}</p> : null}
            </div>

            <div className="field-group">
              <label className="field-label">City / area</label>
              <div className="field-input">
                <MapPin size={17} />
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Anything else?</label>
              <div className="field-input field-input-textarea">
                <FileText size={17} style={{ marginTop: 4 }} />
                <textarea
                  placeholder="Branches, seats, timeline, questions…"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <button type="submit" className="btn-craving" disabled={submitting}>
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Submit registration</span>
                </>
              )}
            </button>
          </form>

          <Link to="/login" className="btn-auth-secondary">
            <ArrowLeft size={17} style={{ marginRight: 8 }} />
            Back to sign in
          </Link>

          <p className="form-footer-txt">
            © 2026 QR Order · Admin ·{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
