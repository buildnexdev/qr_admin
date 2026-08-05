import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, MapPin, FileText, Loader2, QrCode, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';
import { API_BASE_URL } from '@/routes/const';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const registerSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^\d{10}$/, 'Enter exactly 10 digits'),
  city: z.string().optional(),
  message: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      const { data: res } = await axios.post<{ message?: string; emailSent?: boolean }>(
        `${API_BASE_URL}api/register`,
        {
          restaurantName: data.restaurantName.trim(),
          contactName: data.contactName.trim(),
          email: data.email.trim(),
          phone: data.phone.replace(/\D/g, ''),
          message: [data.city?.trim() ? `City / area: ${data.city.trim()}` : '', data.message?.trim()]
            .filter(Boolean)
            .join('\n\n'),
        }
      );
      toast.success(res?.emailSent ? 'Request sent!' : 'Registration saved', {
        description: res?.message ?? 'We will contact you soon.',
      });
      reset();
    } catch (err) {
      toast.error('Could not submit', { description: getApiErrorMessage(err, 'Failed to submit registration') });
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: 'restaurantName' as const, label: 'Restaurant / business name', icon: Building2, placeholder: 'e.g. Spice Garden', required: true },
    { name: 'contactName' as const, label: 'Your full name', icon: User, placeholder: 'Primary contact person', required: true },
    { name: 'email' as const, label: 'Email address', icon: Mail, placeholder: 'owner@restaurant.com', type: 'email', required: true },
    { name: 'phone' as const, label: 'Phone number', icon: Phone, placeholder: '10-digit mobile number', required: true },
    { name: 'city' as const, label: 'City / area', icon: MapPin, placeholder: 'e.g. Bangalore', required: false },
  ];

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-secondary p-12 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-accent/15" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <QrCode className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">NammaQR</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-bold leading-tight">Join the platform today</h1>
          <p className="text-white/70 text-lg">
            Tell us about your restaurant. Our team will reach out with onboarding steps within 24 hours.
          </p>
          <div className="flex items-center gap-2 pt-4">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-white/60">Request → Review → Onboard</span>
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/40">© 2026 NammaQR</p>
      </motion.div>

      <div className="flex flex-1 items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg py-8"
        >
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>

          <Card className="border-0 shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle className="text-2xl">Register your restaurant</CardTitle>
              <CardDescription>Fill in your details and we&apos;ll get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label} {field.required && '*'}
                      </Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={field.name}
                          type={'type' in field ? field.type : 'text'}
                          placeholder={field.placeholder}
                          className="pl-9"
                          {...register(field.name)}
                        />
                      </div>
                      {errors[field.name] && (
                        <p className="text-xs text-danger">{errors[field.name]?.message}</p>
                      )}
                    </div>
                  );
                })}

                <div className="space-y-2">
                  <Label htmlFor="message">Additional message</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      id="message"
                      placeholder="Tell us about your restaurant size, outlets, etc."
                      className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 pl-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register('message')}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit registration'
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
