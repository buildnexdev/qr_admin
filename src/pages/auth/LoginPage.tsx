import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser, clearError } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { NammaQrLogo } from '@/components/brand/NammaQrLogo';

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const BRAND = {
  green: '#0A5D3B',
  greenHover: '#086B44',
  greenLight: '#7CFFB2',
  greenSoft: 'rgba(10, 93, 59, 0.35)',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
};

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const phoneReg = register('phone');
  const passwordReg = register('password');

  const onSubmit = async (data: LoginForm) => {
    dispatch(clearError());

    const result = await dispatch(
      loginUser({ username: data.phone, password: data.password })
    );

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const user = result.payload;
      if (user.role === 0) {
        navigate('/super-admin');
      } else if (user.branchid === 0) {
        navigate('/admin/company');
      } else {
        navigate('/admin');
      }
    } else {
      toast.error((result.payload as string) ?? 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#07110d]">
      {/* Animated background image (Ken Burns) */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/restaurant-splash.png)' }}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 18, ease: 'easeOut' }}
      />

      {/* Dark green overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#04140e]/95 via-[#0A5D3B]/55 to-[#030806]/96" />

      {/* Soft animated glow orbs — hidden on tiny screens for perf */}
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/4 hidden h-72 w-72 rounded-full bg-[#0A5D3B]/30 blur-3xl sm:block"
        animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-1/4 hidden h-80 w-80 rounded-full bg-[#7CFFB2]/10 blur-3xl sm:block"
        animate={{ x: [0, -30, 0], y: [0, 40, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layout: split on lg+, stacked on mobile */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Brand panel — desktop */}
        <motion.aside
          className="relative hidden flex-1 flex-col justify-between p-10 xl:p-14 lg:flex"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <NammaQrLogo size={48} showWordmark wordmarkClassName="text-2xl" />

          <div className="max-w-lg space-y-6">
            <motion.h1
              className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
            >
              Run your restaurant
              <br />
              <span className="text-[#7CFFB2]">from one place</span>
            </motion.h1>
            <motion.p
              className="text-base text-white/65 xl:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              POS billing, QR table ordering, kitchen display, and reports — built for modern F&amp;B
              teams.
            </motion.p>

            <motion.ul
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {['Secure login', 'Multi-branch', 'Real-time KOT'].map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#7CFFB2]" />
                  {label}
                </li>
              ))}
            </motion.ul>
          </div>

          <p className="text-xs text-white/40">© 2026 NammaQR. All rights reserved.</p>
        </motion.aside>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
          <motion.div
            className="w-full max-w-[400px] sm:max-w-[420px]"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Mobile brand */}
            <motion.div
              variants={item}
              className="mb-8 flex flex-col items-center text-center lg:hidden"
            >
              <NammaQrLogo size={48} showWordmark wordmarkClassName="text-xl sm:text-2xl" />
              <p className="mt-2.5 text-xs text-white/55 sm:text-sm">
                Restaurant POS · QR Ordering · Billing
              </p>
            </motion.div>

            {/* Glass card */}
            <motion.div
              variants={item}
              className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0c1612]/80 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-8"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.55)' }}
            >
              {/* Top shine line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7CFFB2]/40 to-transparent" />

              <motion.div variants={item} className="mb-6 text-center sm:mb-7">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Sign in
                </h2>
                <p className="mt-1.5 text-xs text-white/55 sm:text-sm">
                  Enter your phone number and password
                </p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* Phone */}
                <motion.div variants={item} className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-white/90">
                    Phone number
                  </label>
                  <motion.div
                    className="relative"
                    animate={{
                      scale: phoneFocused ? 1.01 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Phone
                      className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                        phoneFocused ? 'text-[#7CFFB2]' : 'text-white/40'
                      }`}
                    />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="nq-field h-11 w-full rounded-xl border bg-black/35 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 sm:h-12"
                      style={{
                        borderColor: phoneFocused ? BRAND.green : 'rgba(255,255,255,0.12)',
                        boxShadow: phoneFocused
                          ? `0 0 0 3px ${BRAND.greenSoft}`
                          : 'none',
                      }}
                      {...phoneReg}
                      onFocus={(e) => {
                        setPhoneFocused(true);
                        phoneReg.onFocus?.(e);
                      }}
                      onBlur={(e) => {
                        setPhoneFocused(false);
                        phoneReg.onBlur?.(e);
                      }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div variants={item} className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <motion.div
                    className="relative"
                    animate={{ scale: passFocused ? 1.01 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Lock
                      className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                        passFocused ? 'text-[#7CFFB2]' : 'text-white/40'
                      }`}
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className="nq-field h-11 w-full rounded-xl border bg-black/35 pl-10 pr-11 text-sm text-white outline-none placeholder:text-white/30 sm:h-12"
                      style={{
                        borderColor: passFocused ? BRAND.green : 'rgba(255,255,255,0.12)',
                        boxShadow: passFocused
                          ? `0 0 0 3px ${BRAND.greenSoft}`
                          : 'none',
                      }}
                      {...passwordReg}
                      onFocus={(e) => {
                        setPassFocused(true);
                        passwordReg.onFocus?.(e);
                      }}
                      onBlur={(e) => {
                        setPassFocused(false);
                        passwordReg.onBlur?.(e);
                      }}
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/45 hover:bg-white/10 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.button>
                  </motion.div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={item} className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#7CFFB2] underline-offset-4 transition hover:underline"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div variants={item}>
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: status === 'loading' ? 1 : 1.015 }}
                    whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                    className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg disabled:opacity-60 sm:h-12"
                    style={{
                      backgroundColor: BRAND.green,
                      boxShadow: '0 10px 28px -8px rgba(10, 93, 59, 0.65)',
                    }}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-6 text-center text-[11px] text-white/40 lg:hidden"
            >
              © 2026 NammaQR. All rights reserved.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
