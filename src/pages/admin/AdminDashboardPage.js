import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabaseClient';
import {
  Vote,
  Users,
  BarChart3,
  CheckSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

const statusColor = {
  Upcoming: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  Ongoing: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  Completed: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalElections: 0,
    ongoingElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
    totalVoters: 0,
  });
  const [recentElections, setRecentElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { count: totalElections },
          { count: ongoingElections },
          { count: upcomingElections },
          { count: completedElections },
          { count: totalCandidates },
          { count: totalVotes },
          { count: totalVoters },
          { data: elections },
        ] = await Promise.all([
          supabase.from('elections').select('*', { count: 'exact', head: true }),
          supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'Ongoing'),
          supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'Upcoming'),
          supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
          supabase.from('candidates').select('*', { count: 'exact', head: true }),
          supabase.from('votes').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('elections').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          totalElections: totalElections || 0,
          ongoingElections: ongoingElections || 0,
          upcomingElections: upcomingElections || 0,
          completedElections: completedElections || 0,
          totalCandidates: totalCandidates || 0,
          totalVotes: totalVotes || 0,
          totalVoters: totalVoters || 0,
        });
        setRecentElections(elections || []);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statTiles = [
    { label: 'Total Elections', value: stats.totalElections, icon: Vote, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Active Now', value: stats.ongoingElections, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Upcoming', value: stats.upcomingElections, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Completed', value: stats.completedElections, icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
    { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Votes Cast', value: stats.totalVotes, icon: CheckSquare, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Registered Voters', value: stats.totalVoters, icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    {
      label: 'Voter Turnout',
      value: stats.totalVoters > 0 ? `${Math.round((stats.totalVotes / stats.totalVoters) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  const quickActions = [
    { label: 'Create Election', icon: '🗳️', path: '/admin/elections', color: 'bg-violet-500 hover:bg-violet-600 text-white' },
    { label: 'Add Candidate', icon: '👤', path: '/admin/candidates', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: 'View Voters', icon: '🏛️', path: '/admin/voters', color: 'bg-cyan-500 hover:bg-cyan-600 text-white' },
    { label: 'See Results', icon: '🏆', path: '/admin/results', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
  ];

  return (
    <AdminLayout>
      {/* Header Banner */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-gradient-to-r from-red-500/10 via-orange-500/5 to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500">Admin Control Panel</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage elections, candidates, and monitor the voting system.</p>
          </div>
          <Button
            onClick={() => navigate('/admin/elections')}
            className="rounded-full shadow-md gap-2 shrink-0 bg-red-500 hover:bg-red-600 text-white"
          >
            Create Election <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">System Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div key={tile.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                    <div className={`h-10 w-10 rounded-xl ${tile.bg} flex items-center justify-center mb-1`}>
                      <Icon className={`h-5 w-5 ${tile.color}`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground leading-tight">{tile.label}</span>
                    {loading ? (
                      <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      <strong className={`text-2xl font-extrabold ${tile.color}`}>{tile.value}</strong>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} h-24 flex flex-col items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md`}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Elections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Elections</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/elections')} className="gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))
          ) : recentElections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Vote className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No elections yet</p>
                <p className="text-sm mt-1">Create your first election to get started.</p>
              </CardContent>
            </Card>
          ) : (
            recentElections.map((election) => (
              <Card key={election.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{election.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{election.district || 'Nationwide'} · {election.type || 'General'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor[election.status] || statusColor.Upcoming}`}>
                    {election.status || 'Upcoming'}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
