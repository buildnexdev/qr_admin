import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser, clearError } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { getHomePathForRole } from '@/components/templates/RoleGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const phoneReg = register('phone');
  const passwordReg = register('password');

  const onSubmit = async (data: LoginForm) => {
    dispatch(clearError());

    const result = await dispatch(
      loginUser({ username: data.phone.trim(), password: data.password })
    );

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(getHomePathForRole(result.payload.role));
    } else {
      toast.error((result.payload as string) ?? 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFCFA]">
      {/* Animated atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,122,75,0.22), transparent)',
          }}
        />
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 28, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-28 top-[20%] h-[380px] w-[380px] rounded-full bg-[#0F7A4B]/25 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 32, 0], x: [0, -24, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -right-24 bottom-[15%] h-[320px] w-[320px] rounded-full bg-[#E8A317]/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-[35%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#1FA971]/20 blur-3xl"
        />
        {/* Floating dots */}
        {[
          { top: '12%', left: '18%', delay: 0 },
          { top: '22%', left: '78%', delay: 0.4 },
          { top: '68%', left: '12%', delay: 0.8 },
          { top: '75%', left: '85%', delay: 1.2 },
          { top: '40%', left: '8%', delay: 0.2 },
          { top: '55%', left: '92%', delay: 1 },
        ].map((dot, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#0F7A4B]/40"
            style={{ top: dot.top, left: dot.left }}
            animate={{ y: [0, -14, 0], opacity: [0.25, 0.85, 0.25] }}
            transition={{
              duration: 3.2 + i * 0.35,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: dot.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          {/* Brand entrance */}
          <div className="mb-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              className="relative mb-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.08, rotate: -4 }}
                className="rounded-2xl bg-white p-2.5 shadow-[0_8px_30px_rgba(15,122,75,0.18)] ring-1 ring-[#0F7A4B]/15"
              >
                <img
                  src="/NammaqrProjectLogo.png"
                  alt="NammaQr"
                  className="h-14 w-14 object-contain"
                />
              </motion.div>
              <motion.span
                aria-hidden
                className="absolute -inset-3 -z-10 rounded-3xl bg-[#0F7A4B]/20 blur-xl"
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease }}
              className="text-3xl font-extrabold tracking-tight text-[#121A16]"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {'NammaQr'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.045, duration: 0.35, ease }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-1.5 text-sm text-[#5C6B63]"
            >
              Smart billing · Simple business
            </motion.p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.25, duration: 0.55, ease }}
            className="rounded-2xl border border-[#D8E3DB]/80 bg-white/95 p-7 shadow-[0_24px_60px_-28px_rgba(15,122,75,0.4)] backdrop-blur-md sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-6"
            >
              <h2
                className="text-xl font-bold text-[#121A16]"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-[#5C6B63]">Sign in with your phone number</p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="phone" className="text-[#121A16]/80">
                  User phone number
                </Label>
                <motion.div
                  animate={{
                    boxShadow: phoneFocused
                      ? '0 0 0 3px rgba(15,122,75,0.18)'
                      : '0 0 0 0px rgba(15,122,75,0)',
                  }}
                  className="relative rounded-xl"
                >
                  <Phone
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                      phoneFocused ? 'text-[#0F7A4B]' : 'text-[#0F7A4B]/60'
                    }`}
                  />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="9444171368"
                    className="h-12 rounded-xl border-[#D8E3DB] bg-[#EEF3EF]/50 pl-10 text-[15px] transition-colors focus-visible:border-[#0F7A4B] focus-visible:bg-white focus-visible:ring-[#0F7A4B]/25"
                    name={phoneReg.name}
                    ref={phoneReg.ref}
                    onChange={phoneReg.onChange}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={(e) => {
                      setPhoneFocused(false);
                      phoneReg.onBlur(e);
                    }}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-[#EF4444]"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56, duration: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-[#121A16]/80">
                  Password
                </Label>
                <motion.div
                  animate={{
                    boxShadow: passwordFocused
                      ? '0 0 0 3px rgba(15,122,75,0.18)'
                      : '0 0 0 0px rgba(15,122,75,0)',
                  }}
                  className="relative rounded-xl"
                >
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                      passwordFocused ? 'text-[#0F7A4B]' : 'text-[#0F7A4B]/60'
                    }`}
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-[#D8E3DB] bg-[#EEF3EF]/50 pl-10 pr-11 text-[15px] transition-colors focus-visible:border-[#0F7A4B] focus-visible:bg-white focus-visible:ring-[#0F7A4B]/25"
                    name={passwordReg.name}
                    ref={passwordReg.ref}
                    onChange={passwordReg.onChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={(e) => {
                      setPasswordFocused(false);
                      passwordReg.onBlur(e);
                    }}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#121A16]"
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
                      className="text-xs text-[#EF4444]"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-3 py-2.5 text-center text-sm text-[#EF4444]"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.64, duration: 0.4 }}
              >
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-[#0F7A4B] text-[15px] font-semibold text-white shadow-lg shadow-[#0F7A4B]/30 disabled:opacity-70"
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
                  />
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-8 text-center text-xs text-[#5C6B63]"
          >
            © {new Date().getFullYear()} NammaQr · Powered by{' '}
            <a
              href="https://buildnexdev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0F7A4B] hover:underline"
            >
              buildnexdev.in
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
