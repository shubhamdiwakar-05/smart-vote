import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { Vote, CheckSquare, Calendar, Sparkles, ArrowRight, X, Activity, Bell, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import UserTour from '../components/UserTour';

// Welcome Popup Component
const WelcomePopup = ({ isOpen, onClose, t, user }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden border border-border"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-40 bg-gradient-to-r from-saffron via-white to-india-green relative flex items-center justify-center">
            <div className="text-6xl absolute z-0 animate-bounce">🎊</div>
          </div>
          <div className="p-8 text-center relative z-10 -mt-10 bg-card rounded-t-[3rem] border-t border-border">
            <h2 className="text-3xl font-extrabold mb-4">
              Welcome, {user?.name?.split(' ')[0] || 'Voter'} 👋
            </h2>
            <p className="text-xl font-bold mb-2">{t('dashboard.welcome_popup_title')}</p>
            <p className="text-primary font-bold text-lg mb-4 whitespace-pre-line leading-relaxed">
              {t('dashboard.welcome_popup_subtitle').split('. ').join('.\n')}
            </p>
            <p className="text-muted-foreground mb-6 font-medium">{t('dashboard.welcome_popup_desc')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={onClose} className="rounded-full shadow-lg bg-primary hover:bg-primary/90">
                {t('dashboard.welcome_popup_btn1')}
              </Button>
              <Button size="lg" variant="outline" onClick={onClose} className="rounded-full">
                {t('dashboard.welcome_popup_btn2')}
              </Button>
            </div>
            <button onClick={onClose} className="mt-6 text-xs text-muted-foreground hover:underline">
              {t('dashboard.welcome_popup_dismiss')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if the user is a first-time user (tour not completed)
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      setRunTour(true);
    }

    // Only show once per session
    if (!sessionStorage.getItem('welcomeShown')) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        if (clerkUser) {
          const name = clerkUser.firstName || clerkUser.fullName?.split(' ')[0] || 'Voter';
          toast.success(`Hello, ${name}! / नमस्ते, ${name}!`, {
            description: "Welcome back to SmartVote Dashboard",
            duration: 6000,
          });
        }
        sessionStorage.setItem('welcomeShown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [clerkUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (clerkUser) {
        const { data } = await supabase.from('profiles').select('*').eq('id', clerkUser.id).maybeSingle();
        setProfile(data);
      }
    };
    fetchProfile();
  }, [clerkUser]);

  const user = clerkUser ? { 
    id: clerkUser.id, 
    name: profile?.name || clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || 'Voter', 
    email: clerkUser.primaryEmailAddress?.emailAddress,
    voter_id: profile?.voter_id,
    city: profile?.city,
    district: profile?.district,
    state: profile?.state
  } : null;

  const [stats, setStats] = useState({
    activeElections: 0,
    yourVotes: 0,
    upcomingVotes: 0,
    status: user ? 'Active' : 'Guest',
    completedElections: 0,
  });
  const [activeElectionsList, setActiveElectionsList] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: activeData, count: activeCount } = await supabase
        .from('elections')
        .select('*', { count: 'exact' })
        .eq('status', 'Ongoing');
      
      if (activeData) {
        setActiveElectionsList(activeData);
      }

      const { count: upcomingCount } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Upcoming');

      const { count: completedCount } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Completed');

      let votesCount = 0;
      if (user) {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('voter_id', user.id);
        votesCount = count || 0;
      }

      setStats((prev) => ({
        ...prev,
        activeElections: activeCount || 0,
        upcomingVotes: upcomingCount || 0,
        completedElections: completedCount || 0,
        yourVotes: votesCount,
      }));
    };

    fetchStats();
  }, [user]);

  const tiles = [
    { title: t('dashboard.stats_active'), value: stats.activeElections, color: 'text-primary', bg: 'bg-primary/10', icon: Vote },
    { title: t('dashboard.stats_votes'), value: stats.yourVotes, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: CheckSquare },
    { title: t('dashboard.stats_upcoming'), value: stats.upcomingVotes, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', icon: Calendar },
    { title: t('dashboard.stats_completed'), value: stats.completedElections, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20', icon: Sparkles },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 relative">
      <UserTour run={runTour} onComplete={() => localStorage.setItem('tourCompleted', 'true')} />
      <WelcomePopup isOpen={showPopup} onClose={() => setShowPopup(false)} t={t} user={user} />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-8 min-w-0">
          {/* Dashboard Hero Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-border shadow-xl">
            <div className="absolute inset-0 z-0">
              <img src="/dashboard-hero.png" alt="Dashboard Banner" className="w-full h-full object-cover opacity-30 dark:opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                {t('dashboard.welcome')}
              </p>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Hello, {user?.name?.split(' ')[0] || 'Voter'}! 👋<br />
                <span className="text-2xl md:text-4xl text-primary/80 mt-2 block">नमस्ते, {user?.name?.split(' ')[0] || 'मतदाता'}!</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-lg font-medium">
                {t('dashboard.ready')}
              </p>
              <Button onClick={() => navigate('/elections')} size="lg" className="rounded-full shadow-lg gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg">
                {t('dashboard.view_elections')} <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div key={tile.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="h-full">
                  <Card className="h-full border-border hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl ${tile.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {Icon && <Icon className={`h-6 w-6 ${tile.color}`} />}
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{tile.title}</span>
                      <strong className={`text-4xl font-extrabold ${tile.color}`}>{tile.value}</strong>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Election Cards */}
              <div className="tour-active-elections">
                <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                  <Vote className="h-6 w-6 text-primary" /> Active Elections
                </h3>
                {activeElectionsList.length > 0 ? (
                  activeElectionsList.map(election => (
                    <Card key={election.id} className="hover:shadow-md transition-shadow border-primary/20 overflow-hidden mb-4">
                      <div className="h-2 w-full bg-saffron" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold mb-2">Live Now</span>
                            <h4 className="text-xl font-bold">{election.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Voting ends: {new Date(election.end_time || election.end_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                          <Button onClick={() => navigate('/elections')} className="rounded-full shadow-sm">Vote Now</Button>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 mb-1 mt-4">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <p className="text-xs text-right text-muted-foreground">Live Turnout</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="hover:shadow-md transition-shadow border-border overflow-hidden">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No active elections at the moment.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Voter Info */}
              {user && (
                <Card className="border-border bg-card overflow-hidden tour-voter-info">
                  <div className="h-2 w-full bg-chakra-blue" />
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('dashboard.voter_info')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Voter ID</p>
                        <p className="font-bold text-lg">{user.voter_id || '—'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('dashboard.location')}</p>
                        <p className="font-bold text-lg">{user.city ? `${user.city}, ${user.district}` : '—'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('dashboard.state')}</p>
                        <p className="font-bold text-lg">{user.state || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-saffron" /> {t('dashboard.notifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">New Election Announced</p>
                      <p className="text-xs text-muted-foreground">General elections will start next week.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-2 w-2 mt-2 rounded-full bg-muted shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profile Verified</p>
                      <p className="text-xs text-muted-foreground">Your voter ID has been verified.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voting Tips */}
              <Card>
                <CardHeader className="pb-3 border-b border-border bg-muted/20">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-india-green" /> {t('dashboard.voting_tips')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary">✓</span> {t('dashboard.tip1')}</li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> {t('dashboard.tip2')}</li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> {t('dashboard.tip3')}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
