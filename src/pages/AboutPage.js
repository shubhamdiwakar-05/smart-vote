import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Eye, Heart } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Shield,
      title: t('about.val_miss_title'),
      description: t('about.val_miss_desc'),
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Eye,
      title: t('about.val_vis_title'),
      description: t('about.val_vis_desc'),
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Heart,
      title: t('about.val_why_title'),
      description: t('about.val_why_desc'),
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/20',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t('about.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-4">{t('about.mission_title')}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t('about.mission_desc')}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-2xl bg-card border border-border p-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t('about.security_title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.security_desc')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1.24M+', label: 'Registered Voters' },
              { value: '126', label: 'Elections Hosted' },
              { value: '99.8%', label: 'Uptime Reliability' },
              { value: '0', label: 'Security Breaches' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
