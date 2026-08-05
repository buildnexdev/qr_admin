import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone, KeyRound, QrCode, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser, clearError } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().optional(),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'otp'>('phone');
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const onSubmit = async (data: LoginForm) => {
    dispatch(clearError());

    if (loginMethod === 'otp') {
      if (!otpSent) {
        setOtpSent(true);
        toast.success('OTP sent successfully (demo mode)');
        return;
      }
      toast.info('OTP login will be available when backend is configured');
      return;
    }

    const result = await dispatch(
      loginUser({ username: data.identifier, password: data.password })
    );

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const user = result.payload;
      if (user.role === 0) {
        navigate('/super-admin');
      } else if (user.branchid === 0 || user.role === 0) {
        navigate('/admin/company');
      } else {
        navigate('/admin');
      }
    } else {
      toast.error((result.payload as string) ?? 'Login failed');
    }
  };

  const handleSendOtp = () => {
    const id = getValues('identifier');
    if (!id) {
      toast.error('Enter your phone number first');
      return;
    }
    setOtpSent(true);
    toast.success('OTP sent to your phone');
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-secondary p-12 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">NammaQR</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Restaurant POS,<br />QR Ordering & Billing
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Manage orders, kitchen, inventory, and billing from one powerful SaaS platform.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { label: 'Restaurants', value: '500+' },
              { label: 'Orders/day', value: '50K+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/40">© 2026 NammaQR. All rights reserved.</p>
      </motion.div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">NammaQR</span>
          </div>

          <Card className="border-0 shadow-[var(--shadow-elevated)]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Access your restaurant dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginMethod} onValueChange={(v) => { setLoginMethod(v as typeof loginMethod); setOtpSent(false); }}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="phone" className="gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </TabsTrigger>
                  <TabsTrigger value="email" className="gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="otp" className="gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    OTP
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <TabsContent value="phone" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        {...register('identifier')}
                      />
                      {errors.identifier && <p className="text-xs text-danger">{errors.identifier.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-phone">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-phone"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="owner@restaurant.com"
                        {...register('identifier')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-email">Password</Label>
                      <Input
                        id="password-email"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        {...register('password')}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="otp" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-phone">Phone Number</Label>
                      <Input
                        id="otp-phone"
                        placeholder="+91 98765 43210"
                        {...register('identifier')}
                      />
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp-code">Enter OTP</Label>
                        <Input id="otp-code" placeholder="6-digit OTP" maxLength={6} />
                      </div>
                    )}
                    {!otpSent && (
                      <Button type="button" variant="outline" className="w-full" onClick={handleSendOtp}>
                        Send OTP
                      </Button>
                    )}
                  </TabsContent>

                  {loginMethod !== 'otp' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch id="remember" {...register('remember')} />
                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-danger text-center">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : loginMethod === 'otp' && otpSent ? (
                      'Verify OTP'
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </Tabs>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register your restaurant
                </Link>
              </p>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                2FA ready · Secure login · Restaurant branding supported
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
