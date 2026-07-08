import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { Vote, CheckSquare, Calendar, Sparkles, ArrowRight, X, Activity, Bell, Info, FileText, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

// Welcome Popup Component
const WelcomePopup = ({ isOpen, onClose, t, user }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-48 bg-gradient-to-br from-primary via-primary/80 to-blue-600 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.div 
              initial={{ scale: 0, rotate: -45 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-7xl absolute z-0 drop-shadow-xl"
            >
              🎉
            </motion.div>
          </div>
          <div className="p-8 text-center relative z-10 -mt-8 bg-card rounded-t-[2rem] border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">
              Welcome, {user?.name?.split(' ')[0] || 'Voter'}!
            </h2>
            <p className="text-lg font-semibold text-primary mb-4">{t('dashboard.welcome_popup_title')}</p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('dashboard.welcome_popup_desc')} We're excited to have you on board.
            </p>
            <div className="flex flex-col gap-3 justify-center">
              <Button size="lg" onClick={onClose} className="w-full rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-md">
                {t('dashboard.welcome_popup_btn1')}
              </Button>
              <Button size="lg" variant="ghost" onClick={onClose} className="w-full rounded-full text-muted-foreground hover:text-foreground">
                {t('dashboard.welcome_popup_dismiss', 'Dismiss')}
              </Button>
            </div>
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

  useEffect(() => {

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
  const [upcomingElectionsList, setUpcomingElectionsList] = useState([]);
  const [completedElectionsList, setCompletedElectionsList] = useState([]);
  const [candidatesList, setCandidatesList] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: allElections } = await supabase
        .from('elections')
        .select('*');
      
      let computedOngoing = [];
      let computedUpcoming = [];
      let computedCompleted = [];

      if (allElections) {
        const nowMs = Date.now();
        allElections.forEach(election => {
          let computedStatus = election.status || '';
          if (election.start_time && election.end_time) {
            const startMs = new Date(election.start_time).getTime();
            const endMs = new Date(election.end_time).getTime();
            if (nowMs >= endMs) computedStatus = 'Completed';
            else if (nowMs >= startMs) computedStatus = 'Ongoing';
            else computedStatus = 'Upcoming';
          }
          
          const normalizedStatus = computedStatus.toLowerCase();
          
          if (normalizedStatus === 'ongoing' || normalizedStatus === 'active') computedOngoing.push(election);
          else if (normalizedStatus === 'upcoming') computedUpcoming.push(election);
          else if (normalizedStatus === 'completed') computedCompleted.push(election);
        });
      }

      const unfilteredOngoing = [...computedOngoing];

      setActiveElectionsList(computedOngoing);
      setUpcomingElectionsList(computedUpcoming);
      setCompletedElectionsList(computedCompleted);

      // Fetch candidates for these elections (unfiltered so manifestos are always visible)
      const eligibleElectionIds = [...unfilteredOngoing, ...computedUpcoming].map(e => e.id);
      
      let eligibleCandidates = [];
      if (eligibleElectionIds.length > 0) {
        const { data: cands } = await supabase
          .from('candidates')
          .select('*, elections(title)')
          .in('election_id', eligibleElectionIds);
        if (cands) eligibleCandidates = cands;
      }
      setCandidatesList(eligibleCandidates);

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
        activeElections: computedOngoing.length,
        upcomingVotes: computedUpcoming.length,
        completedElections: computedCompleted.length,
        yourVotes: votesCount,
      }));
    };

    fetchStats();

    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.city, user?.district, user?.state]);

  const tiles = [
    { title: t('dashboard.stats_active'), value: stats.activeElections, color: 'text-primary', bg: 'bg-primary/10', icon: Vote },
    { title: t('dashboard.stats_votes'), value: stats.yourVotes, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20', icon: CheckSquare },
    { title: t('dashboard.stats_upcoming'), value: stats.upcomingVotes, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', icon: Calendar },
    { title: t('dashboard.stats_completed'), value: stats.completedElections, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20', icon: Sparkles },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 relative">
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
                    <Card 
                      key={election.id} 
                      className="hover:shadow-md transition-shadow border-primary/20 overflow-hidden mb-4 cursor-pointer"
                      onClick={() => navigate('/vote')}
                    >
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
                          <Button onClick={() => navigate('/vote')} className="rounded-full shadow-sm">Vote Now</Button>
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

              {/* Completed Election Cards */}
              <div className="tour-completed-elections mt-8">
                <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                  <CheckSquare className="h-6 w-6 text-gray-500" /> Completed Elections
                </h3>
                {completedElectionsList.length > 0 ? (
                  completedElectionsList.map(election => (
                    <Card key={election.id} className="hover:shadow-md transition-shadow border-gray-200/50 overflow-hidden mb-4">
                      <div className="h-2 w-full bg-gray-400" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold mb-2">Completed</span>
                            <h4 className="text-xl font-bold">{election.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ended: {new Date(election.end_time || election.end_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                          <Button variant="outline" className="rounded-full shadow-sm" onClick={() => navigate('/results')}>View Results</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="hover:shadow-md transition-shadow border-border overflow-hidden">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No completed elections at this time.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Upcoming Election Cards */}
              <div className="tour-upcoming-elections mt-8">
                <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" /> Upcoming Elections
                </h3>
                {upcomingElectionsList.length > 0 ? (
                  upcomingElectionsList.map(election => (
                    <Card key={election.id} className="hover:shadow-md transition-shadow border-blue-200/50 overflow-hidden mb-4">
                      <div className="h-2 w-full bg-blue-500" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold mb-2">Upcoming</span>
                            <h4 className="text-xl font-bold">{election.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Voting starts: {new Date(election.start_time || election.start_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                          <Button variant="outline" className="rounded-full shadow-sm cursor-default" disabled>Opens Soon</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="hover:shadow-md transition-shadow border-border overflow-hidden">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No upcoming elections scheduled at this time.
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

              {/* Candidates Manifesto Section */}
              {candidatesList.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" /> Election Manifestos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidatesList.map((candidate) => (
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
                </div>
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
                    <UserIcon className="h-5 w-5 text-primary" />
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
        </section>
      </div>
    </div>
  );
}
