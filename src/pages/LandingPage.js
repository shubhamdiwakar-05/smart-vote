import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Fingerprint, MousePointerClick, CheckCircle, ShieldCheck, User, FileText, X, Calendar, PlayCircle, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [candRes, elecRes] = await Promise.all([
        supabase.from('candidates').select(`*, elections ( title )`).limit(6).order('created_at', { ascending: false }),
        supabase.from('elections').select('*').order('start_date', { ascending: true })
      ]);
        
      if (!candRes.error && candRes.data) setCandidates(candRes.data);
      if (!elecRes.error && elecRes.data) setElections(elecRes.data);
    };
    fetchData();
  }, []);

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
    },
    {
      id: 2,
      title: 'Verify Your Identity',
      desc: 'Complete Aadhaar/Voter ID verification for secure access.',
      icon: Fingerprint,
    },
    {
      id: 3,
      title: 'Choose Your Election',
      desc: 'Select the active election you wish to participate in.',
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: 'Cast Your Vote',
      desc: 'Choose your preferred candidate and submit your vote.',
      icon: MousePointerClick,
    },
    {
      id: 5,
      title: 'Success!',
      desc: 'Your vote is securely recorded. Thank you for participating.',
      icon: CheckCircle,
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

      {/* ELECTIONS OVERVIEW SECTION */}
      {elections.length > 0 && (
        <section className="py-20 bg-background relative z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Elections Overview</h2>
              <p className="text-lg text-muted-foreground">Stay updated on ongoing, upcoming, and completed elections across the nation.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {elections.map((elec) => {
                const isOngoing = elec.status === 'Ongoing';
                const isUpcoming = elec.status === 'Upcoming';
                const isCompleted = elec.status === 'Completed';
                
                return (
                  <Card key={elec.id} className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 ${isOngoing ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <CardContent className="p-0">
                      <div className={`p-4 text-white flex items-center justify-between ${isOngoing ? 'bg-primary' : isUpcoming ? 'bg-saffron' : 'bg-muted-foreground'}`}>
                        <span className="font-bold tracking-wide uppercase text-sm flex items-center gap-2">
                          {isOngoing && <PlayCircle className="h-4 w-4" />}
                          {isUpcoming && <Calendar className="h-4 w-4" />}
                          {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                          {elec.status}
                        </span>
                        {isOngoing && <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-2 line-clamp-2">{elec.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{elec.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              {new Date(elec.start_date).toLocaleDateString()} - {new Date(elec.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          {elec.state && elec.district && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span>{elec.district}, {elec.state}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* HOW TO VOTE SECTION (COMPACT) */}
      <section id="how-to-vote" className="py-24 bg-card relative z-20 border-y border-border/50">
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

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Unified Image Side */}
            <div className="w-full lg:w-1/2 group relative hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-saffron via-primary to-india-green rounded-3xl blur opacity-25 transition duration-1000" />
              <img 
                src="/step-login.png" 
                alt="Voting Process" 
                className="relative w-full rounded-2xl shadow-xl bg-background"
                onError={(e) => { e.target.src = '/landing-hero.png' }}
              />
            </div>
            
            {/* Steps Side - All 5 steps visible neatly */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-xl shrink-0 mt-1">
                      {step.id}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CANDIDATES SHOWCASE SECTION */}
          {candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mt-32 mb-16"
            >
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Meet the Candidates</h2>
                <p className="text-xl text-muted-foreground">Get to know the leaders, read their manifestos, and make an informed choice.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-saffron/20 to-india-green/20 flex items-center justify-center shrink-0 border border-border/50">
                          {candidate.photo_url ? (
                            <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl">{candidate.symbol || '👤'}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl line-clamp-1">{candidate.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {candidate.party && <span className="text-sm font-semibold text-muted-foreground">{candidate.party}</span>}
                            {candidate.age && <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Age {candidate.age}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {candidate.elections?.title && (
                        <div className="mb-4 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {candidate.elections.title}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                        {candidate.bio || "No biography provided."}
                      </p>

                      <Button 
                        variant="outline" 
                        className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <FileText className="h-4 w-4" />
                        Read Manifesto
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Manifesto Modal */}
          <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4 text-2xl">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-saffron/20 to-india-green/20 flex items-center justify-center shrink-0 border border-border/50">
                    {selectedCandidate?.photo_url ? (
                      <img src={selectedCandidate.photo_url} alt={selectedCandidate.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">{selectedCandidate?.symbol || '👤'}</span>
                    )}
                  </div>
                  <div>
                    {selectedCandidate?.name}
                    <div className="text-sm text-muted-foreground font-normal mt-1 flex gap-2 items-center">
                      {selectedCandidate?.party && <span>{selectedCandidate.party}</span>}
                      {selectedCandidate?.age && <span>• Age {selectedCandidate.age}</span>}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedCandidate?.elections?.title}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Biography
                  </h4>
                  <div className="text-muted-foreground bg-muted/30 p-4 rounded-xl leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedCandidate?.bio || "No biography provided."}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-saffron" />
                    Manifesto & Key Points
                  </h4>
                  <div className="text-foreground bg-primary/5 border border-primary/10 p-5 rounded-xl leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedCandidate?.manifesto || "No manifesto provided."}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
