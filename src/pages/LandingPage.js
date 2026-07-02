import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Zap, BarChart2, Users, ArrowRight, CheckCircle } from 'lucide-react';

const stats = [
  { label: 'Active Voters', value: '1.24M' },
  { label: 'Elections Hosted', value: '126' },
  { label: 'Total Votes Cast', value: '4.9M' },
  { label: 'Success Rate', value: '99.8%' },
];

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your vote is protected with enterprise-grade encryption and verified authentication.',
  },
  {
    icon: BarChart2,
    title: 'Live Results',
    description: 'See election results update in real-time the moment votes are counted.',
  },
  {
    icon: Users,
    title: 'Easy to Use',
    description: 'A clean, accessible interface ensures every citizen can participate with ease.',
  },
  {
    icon: Zap,
    title: 'Fast & Simple',
    description: 'Cast your official vote in just three quick, guided steps.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-semibold text-saffron">
                {t('hero.badge')}
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-chakra-blue dark:text-blue-400">
                {t('hero.title1')}
                <br />
                {t('hero.title2')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t('hero.desc')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="rounded-full px-8 gap-2 group transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]" onClick={() => navigate('/register')}>
                  {t('hero.btn_start')} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 transition-all hover:scale-105 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => navigate('/about')}>
                  {t('hero.btn_learn')}
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[t('hero.perk1'), t('hero.perk2'), t('hero.perk3')].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, y: -8, rotateY: 2 }}
              style={{ perspective: 1000 }}
              className="relative cursor-pointer"
            >
              <div className="relative rounded-2xl border border-border bg-card shadow-2xl p-8 overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-0" />
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Live Dashboard</p>
                  <h2 className="text-2xl font-bold mb-6">Current Elections</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl bg-primary/10 p-4 text-center">
                      <p className="text-3xl font-extrabold text-primary">8</p>
                      <p className="text-xs text-muted-foreground mt-1">Active Now</p>
                    </div>
                    <div className="rounded-xl bg-muted p-4 text-center">
                      <p className="text-3xl font-extrabold">3</p>
                      <p className="text-xs text-muted-foreground mt-1">Happening Today</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['General Election 2026', 'Municipal Ward 12', 'State Assembly'].map((name, i) => (
                      <div key={name} className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
                        <span className="text-sm font-medium">{name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {i === 0 ? 'Live' : 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((item) => (
              <motion.div key={item.label} variants={itemVariants} className="text-center group">
                <p className="text-4xl font-extrabold text-primary transition-transform group-hover:scale-110 inline-block">{item.value}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.label === 'Active Voters' ? t('stats.voters') : 
                   item.label === 'Elections Hosted' ? t('stats.elections') : 
                   item.label === 'Total Votes Cast' ? t('stats.votes') : 
                   t('stats.success')}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Why SmartVote?</p>
            <h2 className="text-4xl font-bold tracking-tight">Simple, Safe, and Fair Voting</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Built with modern security standards so every citizen can participate with confidence.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="p-6 flex flex-col gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                      </div>
                      <h3 className="text-base font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to Cast Your Vote?</h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
            Join over 1.24 million verified voters. Register in minutes and participate in your next election.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 gap-2 font-bold"
              onClick={() => navigate('/register')}
            >
              Create Voter Account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
