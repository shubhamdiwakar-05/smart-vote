import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { supabase } from '../../lib/supabaseClient';
import { Trophy, Medal, BarChart3, Users } from 'lucide-react';

const statusStyle = {
  Completed: 'text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  Ongoing: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
  Upcoming: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
};

function ResultBar({ candidate, totalVotes, rank }) {
  const percent = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
  const isWinner = rank === 1;

  return (
    <div className={`p-4 rounded-xl border transition-shadow hover:shadow-sm ${
      isWinner
        ? 'border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-background dark:from-amber-900/10'
        : 'border-border bg-card'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isWinner ? 'bg-amber-400 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {rank === 1 ? <Trophy className="h-4 w-4" /> : rank}
        </div>
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
          {candidate.photo_url ? (
            <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg">
              {candidate.symbol || '👤'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${isWinner ? 'text-amber-700 dark:text-amber-400' : ''}`}>{candidate.name}</p>
          <p className="text-xs text-muted-foreground">{candidate.party || '—'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-extrabold ${isWinner ? 'text-amber-600 dark:text-amber-400' : ''}`}>
            {candidate.votes.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{percent}%</p>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.1 * rank }}
          className={`h-full rounded-full ${isWinner ? 'bg-amber-400' : 'bg-primary/60'}`}
        />
      </div>
    </div>
  );
}

export default function AdminResultsPage() {
  const [electionsWithResults, setElectionsWithResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const fetchAllResults = async () => {
      const { data: elections } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (!elections || elections.length === 0) {
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        elections.map(async (election) => {
          const { data: candidates } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id);

          if (!candidates || candidates.length === 0) {
            return { ...election, candidates: [], totalVotes: 0 };
          }

          const { data: voteResults } = await supabase.rpc('get_election_results', {
            p_election_id: election.id,
          });

          let totalVotes = 0;
          const enriched = candidates
            .map((c) => {
              const match = voteResults?.find((r) => r.candidate_id === c.id);
              const votes = match ? parseInt(match.total_votes, 10) : 0;
              totalVotes += votes;
              return { ...c, votes };
            })
            .sort((a, b) => b.votes - a.votes)
            .map((c, i) => ({ ...c, rank: i + 1 }));

          return { ...election, candidates: enriched, totalVotes };
        })
      );

      setElectionsWithResults(results);
      setActiveTab(results[0]?.id || null);
      setLoading(false);
    };

    fetchAllResults();
  }, []);

  const activeElection = electionsWithResults.find((e) => e.id === activeTab);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-gradient-to-r from-amber-500/10 via-background to-background p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Admin · Results</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Election Results</h1>
        <p className="text-muted-foreground mt-1 text-sm">Full vote tally across all elections.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : electionsWithResults.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center text-muted-foreground">
            <Trophy className="h-14 w-14 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No elections yet</p>
            <p className="text-sm mt-1">Create elections and add candidates first.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Election Tabs */}
          <div className="flex gap-2 flex-wrap">
            {electionsWithResults.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveTab(e.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all max-w-[200px] truncate ${
                  activeTab === e.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {e.title}
              </button>
            ))}
          </div>

          {activeElection && (
            <div className="space-y-4">
              {/* Election Meta */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[activeElection.status] || statusStyle.Upcoming}`}>
                  {activeElection.status}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {activeElection.totalVotes.toLocaleString()} total votes
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> {activeElection.candidates.length} candidates
                </span>
              </div>

              {/* Winner Card */}
              {activeElection.totalVotes > 0 && activeElection.candidates.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 via-background to-background dark:from-amber-900/10">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-amber-300 dark:border-amber-700 shadow-lg">
                        {activeElection.candidates[0].photo_url ? (
                          <img src={activeElection.candidates[0].photo_url} alt={activeElection.candidates[0].name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl">
                            {activeElection.candidates[0].symbol || '👑'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        {activeElection.status === 'Completed' ? '🏆 Winner' : '📊 Currently Leading'}
                      </p>
                      <h2 className="text-2xl font-extrabold mt-0.5">{activeElection.candidates[0].name}</h2>
                      <p className="text-muted-foreground text-sm">{activeElection.candidates[0].party}</p>
                    </div>
                    <div className="sm:ml-auto text-center sm:text-right">
                      <p className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                        {activeElection.candidates[0].votes.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        votes · {activeElection.totalVotes > 0 ? Math.round((activeElection.candidates[0].votes / activeElection.totalVotes) * 100) : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Results */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Standings</h3>
                {activeElection.candidates.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No candidates registered for this election.
                    </CardContent>
                  </Card>
                ) : (
                  activeElection.candidates.map((candidate) => (
                    <ResultBar
                      key={candidate.id}
                      candidate={candidate}
                      totalVotes={activeElection.totalVotes}
                      rank={candidate.rank}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
