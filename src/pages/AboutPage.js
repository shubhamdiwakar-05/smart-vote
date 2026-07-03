import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Eye, Zap, Smartphone, Globe, UserCheck, ArrowRight } from 'lucide-react';

// Counter component for animated stats
const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace(/,/g, ''));
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString()}{suffix}</>;
};

export default function AboutPage() {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, title: t('about.feat_secure'), desc: t('about.feat_secure_desc'), color: 'text-india-green bg-india-green/10' },
    { icon: Eye, title: t('about.feat_trans'), desc: t('about.feat_trans_desc'), color: 'text-chakra-blue bg-chakra-blue/10' },
    { icon: Zap, title: t('about.feat_fast'), desc: t('about.feat_fast_desc'), color: 'text-saffron bg-saffron/10' },
    { icon: Smartphone, title: t('about.feat_access'), desc: t('about.feat_access_desc'), color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20' },
    { icon: Globe, title: t('about.feat_lang'), desc: t('about.feat_lang_desc'), color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' },
    { icon: UserCheck, title: t('about.feat_verif'), desc: t('about.feat_verif_desc'), color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/20' },
  ];

  const timeline = [
    { step: 1, title: t('about.timeline_register') },
    { step: 2, title: t('about.timeline_verify') },
    { step: 3, title: t('about.timeline_cast') },
    { step: 4, title: t('about.timeline_encrypt') },
    { step: 5, title: t('about.timeline_count') },
    { step: 6, title: t('about.timeline_publish') },
  ];

  const quotes = [
    t('about.quote1'),
    t('about.quote2'),
    t('about.quote3'),
    "आपका वोट, आपकी आवाज़।",
    "हर वोट महत्वपूर्ण है।",
    "लोकतंत्र की असली ताकत जनता का वोट है।"
  ];
  
  const [currentQuote, setCurrentQuote] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col lg:flex-row items-center gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
              {t('about.title')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
              {t('about.subtitle')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img src="/about-hero.png" alt="Indian Citizens Voting" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 bg-muted/40 border-y border-border/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1,240,000', suffix: '+', label: 'Registered Voters' },
              { value: '126', label: 'Active Elections' },
              { value: '890,000', suffix: '+', label: 'Votes Cast' },
              { value: '99.9', suffix: '%', label: 'Election Success Rate' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-4xl font-extrabold text-chakra-blue dark:text-blue-400">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Why Choose SmartVote?</h2>
            <div className="h-1 w-20 bg-saffron mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 overflow-hidden group">
                    <CardContent className="p-8 flex flex-col gap-4">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card p-10 rounded-3xl shadow-lg border border-india-green/20">
              <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-3 text-india-green">
                <Shield className="h-8 w-8" /> {t('about.mission_title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{t('about.mission_desc')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card p-10 rounded-3xl shadow-lg border border-chakra-blue/20">
              <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-3 text-chakra-blue dark:text-blue-400">
                <Eye className="h-8 w-8" /> {t('about.val_miss_title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{t('about.val_miss_desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
            <div className="h-1 w-20 bg-india-green mx-auto rounded-full" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0" />
            {timeline.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative z-10 flex flex-col items-center mb-8 md:mb-0 bg-background px-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4 shadow-lg ring-4 ring-background">
                  {item.step}
                </div>
                <h4 className="font-semibold text-center text-sm uppercase tracking-wider">{item.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes Carousel */}
      <section className="py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div key={currentQuote} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="min-h-[120px] flex items-center justify-center">
            <blockquote className="text-3xl md:text-5xl font-extrabold tracking-tight italic">
              "{quotes[currentQuote]}"
            </blockquote>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
