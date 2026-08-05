import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCode,
  Monitor,
  ChefHat,
  BarChart3,
  CreditCard,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Star,
} from 'lucide-react';
import PublicNavbar from '@/components/organisms/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import heroMockup from '@/assets/mockups/dashboard_hero_mockup_1777098936548.png';
import orderMockup from '@/assets/mockups/dashboard_order_mockup_1777098962205.png';
import menuMockup from '@/assets/mockups/dashboard_menu_mockup_1777098976482.png';

const features = [
  { icon: QrCode, title: 'QR Table Ordering', desc: 'Contactless menu browsing and ordering from any table.' },
  { icon: Monitor, title: 'POS Billing', desc: 'Fast in-store billing with split payments and receipts.' },
  { icon: ChefHat, title: 'Kitchen Display', desc: 'Real-time KDS with order priority and sound alerts.' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Sales, GST, inventory, and profit & loss reports.' },
  { icon: CreditCard, title: 'Payments', desc: 'UPI, cards, cash, and wallet — all in one place.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Granular permissions for every staff role.' },
];

const plans = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    desc: 'For single-outlet restaurants',
    features: ['QR Ordering', 'POS Billing', 'Kitchen Display', 'Up to 5 staff', 'Basic reports'],
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹2,499',
    period: '/month',
    desc: 'For growing restaurant chains',
    features: ['Everything in Starter', 'Multi-branch', 'Inventory', 'Analytics', 'Unlimited staff', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large franchises & hotels',
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'White-label option'],
    popular: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4">Trusted by 500+ restaurants</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The modern{' '}
                <span className="text-primary">restaurant platform</span>{' '}
                built for growth
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                POS, QR ordering, kitchen display, inventory, and analytics — everything your restaurant needs in one professional SaaS platform.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Start free trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign in to dashboard</Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                  <span className="ml-1 font-medium text-foreground">4.9/5</span>
                </div>
                <span>·</span>
                <span>No credit card required</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-elevated)]">
                <img src={heroMockup} alt="NammaQR Dashboard" className="rounded-xl w-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to run your restaurant</h2>
            <p className="mt-4 text-muted-foreground">From order to kitchen to billing — streamline every step.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-[var(--shadow-elevated)] transition-shadow border-border/60">
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
          {[
            { title: 'Take control of every order', desc: 'Track dine-in, delivery, and takeaway orders in one unified dashboard with real-time status updates.', img: orderMockup, reverse: false },
            { title: 'Manage your menu effortlessly', desc: 'Categories, variants, addons, combos, and pricing — all with a clean, intuitive interface.', img: menuMockup, reverse: true },
          ].map((block) => (
            <div key={block.title} className={`grid items-center gap-12 lg:grid-cols-2 ${block.reverse ? 'lg:[direction:rtl]' : ''}`}>
              <div className={block.reverse ? 'lg:[direction:ltr]' : ''}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 mb-4">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">{block.title}</h3>
                <p className="mt-4 text-muted-foreground text-lg">{block.desc}</p>
              </div>
              <div className={`rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card)] ${block.reverse ? 'lg:[direction:ltr]' : ''}`}>
                <img src={block.img} alt={block.title} className="rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Scale as you grow.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-[var(--shadow-elevated)] ring-1 ring-primary/20' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                    <Link to="/register">{plan.name === 'Enterprise' ? 'Contact sales' : 'Get started'}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-secondary text-secondary-foreground border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <CardContent className="relative p-10 sm:p-14 text-center">
              <h2 className="text-3xl font-bold">Ready to transform your restaurant?</h2>
              <p className="mt-4 text-secondary-foreground/70 max-w-lg mx-auto">
                Join hundreds of restaurants using NammaQR to deliver better experiences.
              </p>
              <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90" asChild>
                <Link to="/register">
                  Start your free trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <QrCode className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">NammaQR</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 NammaQR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
