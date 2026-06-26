import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { Vote, CheckSquare, Calendar, Sparkles, ArrowRight } from 'lucide-react';

const iconMap = { 'Active Elections': Vote, 'Your Votes': CheckSquare, 'Upcoming Votes': Calendar, 'Your Status': Sparkles };

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState(null);

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
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeElections: 0,
    yourVotes: 0,
    upcomingVotes: 0,
    status: user ? 'Active' : 'Guest',
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: activeCount } = await supabase
        .from('elections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Ongoing');

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
        yourVotes: votesCount,
      }));
    };

    fetchStats();
  }, [user]);

  const tiles = [
    { title: 'Active Elections', value: stats.activeElections, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Your Votes', value: stats.yourVotes, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { title: 'Upcoming Votes', value: stats.upcomingVotes, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Your Status', value: stats.status, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  ];

  const quickActions = [
    { label: 'Cast Your Vote', icon: '📋', path: '/vote', variant: 'default' },
    { label: 'View Results', icon: '📊', path: '/results', variant: 'secondary' },
    { label: 'My Profile', icon: '👤', path: '/profile', variant: 'secondary' },
    { label: 'All Elections', icon: '🗂️', path: '/elections', variant: 'secondary' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-8 min-w-0">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Welcome back</p>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Hello, {user?.name?.split(' ')[0] || 'Voter'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Ready to participate in the democratic process?</p>
            </div>
            <Button onClick={() => navigate('/elections')} size="lg" className="rounded-full shadow-md gap-2 shrink-0">
              View Elections <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map((tile, i) => {
              const Icon = iconMap[tile.title];
              return (
                <motion.div key={tile.title} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <Card className="h-full border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                      <div className={`h-10 w-10 rounded-xl ${tile.bg} flex items-center justify-center mb-1`}>
                        {Icon && <Icon className={`h-5 w-5 ${tile.color}`} />}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{tile.title}</span>
                      <strong className={`text-3xl font-extrabold ${tile.color}`}>{tile.value}</strong>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="h-20 flex-col gap-2 rounded-xl text-sm font-medium border border-border"
                  onClick={() => navigate(action.path)}
                >
                  <span className="text-2xl">{action.icon}</span>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Voter Info Card */}
          {user && (
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Your Voter Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Voter ID</p>
                    <p className="font-semibold mt-0.5">{user.voter_id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold mt-0.5">{user.city ? `${user.city}, ${user.district}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">State</p>
                    <p className="font-semibold mt-0.5">{user.state || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
