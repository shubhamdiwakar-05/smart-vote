import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Eye, Heart } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Mission',
    description:
      'Build a secure digital voting environment that empowers citizens and strengthens democratic participation across the nation.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: Eye,
    title: 'Vision',
    description:
      'Deliver transparent, accessible elections through a premium online experience, backed by modern security standards and open governance.',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  },
  {
    icon: Heart,
    title: 'Why SmartVote',
    description:
      'From real-time results to secure authentication, SmartVote is built to be elegant, reliable, and easy to use for every voter.',
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

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">About SmartVote</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Modern Election Infrastructure
              <br />
              <span className="text-primary">Designed for Trust</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SmartVote was built to make democratic participation accessible, secure, and transparent for every citizen — regardless of location.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/20">
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
