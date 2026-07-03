import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Fingerprint, MousePointerClick, CheckCircle, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const steps = [
    {
      id: 1,
      title: 'Register or Login',
      desc: 'Create an account or securely log in using your credentials.',
      icon: LogIn,
      image: '/step-login.png'
    },
    {
      id: 2,
      title: 'Verify Your Identity',
      desc: 'Complete Aadhaar/Voter ID verification for secure access.',
      icon: Fingerprint,
      image: '/step-verify.png'
    },
    {
      id: 3,
      title: 'Choose Your Election',
      desc: 'Select the active election you wish to participate in.',
      icon: ShieldCheck,
      image: '/step-choose.png'
    },
    {
      id: 4,
      title: 'Cast Your Vote',
      desc: 'Choose your preferred candidate and submit your vote.',
      icon: MousePointerClick,
      image: '/step-cast.png'
    },
    {
      id: 5,
      title: 'Success!',
      desc: 'Your vote is securely recorded. Thank you for participating.',
      icon: CheckCircle,
      image: '/step-success.png'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans text-foreground pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-br from-background via-accent to-background">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={stagger} 
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-dark text-sm font-semibold mb-6 border border-saffron/20">
                <span className="flex h-2 w-2 rounded-full bg-saffron animate-pulse" />
                {t('hero.badge')}
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-primary to-india-green">{t('hero.title2')}</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {t('hero.desc')}
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {t('hero.btn_start')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => document.getElementById('how-to-vote').scrollIntoView({ behavior: 'smooth' })} 
                  className="rounded-full px-8 py-6 text-lg font-bold border-2 hover:bg-accent hover:-translate-y-1 transition-all duration-300"
                >
                  {t('hero.btn_learn')}
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Right Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="relative hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-saffron/20 via-primary/20 to-india-green/20 rounded-full blur-3xl animate-pulse" />
              <img 
                src="/landing-hero.png" 
                alt="Digital Voting Illustration" 
                className="relative z-10 w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW TO VOTE SECTION */}
      <section id="how-to-vote" className="py-24 bg-card relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">How to Vote</h2>
            <p className="text-xl text-muted-foreground">A simple, secure, and transparent 5-step process.</p>
          </motion.div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 !== 0;
              
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-16`}
                >
                  {/* Image side */}
                  <div className="w-full lg:w-1/2 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-saffron via-primary to-india-green rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="relative w-full rounded-2xl shadow-xl transform group-hover:-translate-y-2 transition-all duration-300 bg-background"
                    />
                  </div>
                  
                  {/* Text side */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary font-bold text-2xl shrink-0">
                        {step.id}
                      </div>
                      <h3 className="text-3xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed pl-0 lg:pl-[4.5rem]">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="rounded-full px-12 py-8 text-xl font-bold shadow-2xl bg-gradient-to-r from-saffron via-primary to-india-green text-white hover:scale-105 transition-transform duration-300"
            >
              Start Your Journey Today
            </Button>
          </motion.div>
          
        </div>
      </section>

    </div>
  );
}
