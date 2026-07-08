import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabaseClient';
import { ScrollText, Clock, Activity, CheckCircle, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

const STATUS_CONFIG = {
  Ongoing: {
    label: 'Live',
    icon: Activity,
    class: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Upcoming: {
    label: 'Upcoming',
    icon: Clock,
    class: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  Completed: {
    label: 'Completed',
    icon: CheckCircle,
    class: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Upcoming;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.class}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${status === 'Ongoing' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function ElectionListCard({ election, candidateCount, onVote, onResults }) {
  const formatDate = (ts, fallback) => {
    if (!ts) return fallback || '—';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return fallback || ts;
    }
  };

  return (
    <Card 
      className={`border-border hover:shadow-md transition-all duration-200 h-full group ${election.status !== 'Upcoming' ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        // Only route if the click wasn't on a button directly
        if (e.target.closest('button')) return;
        if (election.status === 'Ongoing') onVote();
        else if (election.status === 'Completed') onResults();
      }}
    >
      <CardContent className="p-5 flex flex-col h-full gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={election.status} />
          {election.type && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{election.type}</span>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex-1">
          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">{election.title}</h3>
          {election.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{election.description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {election.district && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {election.district}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(election.start_time, election.start_date)} → {formatDate(election.end_time, election.end_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" /> {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {election.status === 'Ongoing' && (
            <Button size="sm" className="w-full gap-2 rounded-lg" onClick={onVote}>
              Cast Vote <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {election.status === 'Completed' && (
            <Button size="sm" variant="outline" className="w-full gap-2 rounded-lg" onClick={onResults}>
              View Results <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {election.status === 'Upcoming' && (
            <Button size="sm" variant="ghost" className="w-full rounded-lg cursor-default text-muted-foreground" disabled>
              <Clock className="h-3.5 w-3.5 mr-2" /> Opens Soon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ElectionListPage() {
  const [elections, setElections] = useState([]);
  const [candidateCounts, setCandidateCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && data) {
        const nowMs = Date.now();
        const updatedData = data.map(election => {
          let computedStatus = election.status || '';
          if (election.start_time && election.end_time) {
            const startMs = new Date(election.start_time).getTime();
            const endMs = new Date(election.end_time).getTime();
            if (nowMs >= endMs) computedStatus = 'Completed';
            else if (nowMs >= startMs) computedStatus = 'Ongoing';
            else computedStatus = 'Upcoming';
          } else {
            const normalized = computedStatus.toLowerCase();
            if (normalized === 'ongoing' || normalized === 'active') computedStatus = 'Ongoing';
            else if (normalized === 'upcoming') computedStatus = 'Upcoming';
            else if (normalized === 'completed') computedStatus = 'Completed';
          }
          return { ...election, status: computedStatus };
        });
        setElections(updatedData);
        // Fetch candidate counts per election
        const counts = {};
        await Promise.all(
          data.map(async (e) => {
            const { count } = await supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('election_id', e.id);
            counts[e.id] = count || 0;
          })
        );
        setCandidateCounts(counts);
      }
      setLoading(false);
    };
    fetchElections();
  }, []);

  const filtered = filterStatus === 'All' ? elections : elections.filter((e) => e.status === filterStatus);

  const counts = {
    All: elections.length,
    Ongoing: elections.filter((e) => e.status === 'Ongoing').length,
    Upcoming: elections.filter((e) => e.status === 'Upcoming').length,
    Completed: elections.filter((e) => e.status === 'Completed').length,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-6 min-w-0">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Election Directory</p>
            <h1 className="text-2xl font-extrabold tracking-tight">All Elections</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {counts.Ongoing} live · {counts.Upcoming} upcoming · {counts.Completed} completed
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Ongoing', 'Upcoming', 'Completed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {s}
                <span className="ml-1.5 text-xs opacity-70">{counts[s]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((election) => (
                <motion.div
                  key={election.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ElectionListCard
                    election={election}
                    candidateCount={candidateCounts[election.id] || 0}
                    onVote={() => navigate('/vote')}
                    onResults={() => navigate('/results')}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <ScrollText className="h-12 w-12 text-muted-foreground opacity-40" />
                <p className="text-lg font-semibold">No Elections Found</p>
                <p className="text-sm text-muted-foreground">
                  {filterStatus !== 'All' ? `No ${filterStatus.toLowerCase()} elections.` : 'No elections scheduled at this time.'}
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
