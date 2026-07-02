import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ResultCard from '../components/ResultCard';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '../components/ui/card';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Lock, BarChart3 } from 'lucide-react';

export default function ResultsPage() {
  const [electionsWithResults, setElectionsWithResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const fetchAllResults = async () => {
      // Only show Completed elections to voters (results locked until done)
      const { data: elections } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'Completed')
        .order('end_time', { ascending: false });

      if (!elections || elections.length === 0) {
        setElectionsWithResults([]);
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
            return { ...election, results: [], totalVotes: 0 };
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
              return { id: c.id, name: c.name, party: c.party, photo: c.photo_url, symbol: c.symbol, votes };
            })
            .sort((a, b) => b.votes - a.votes)
            .map((item, index) => ({ ...item, percent: totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0, rank: index + 1 }));

          return { ...election, results: enriched, totalVotes };
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-6 min-w-0">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-amber-500/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">Official Results</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Election Results</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Results are published after each election concludes.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading results...</p>
              </div>
            </div>
          ) : electionsWithResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center gap-3 p-8">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold">No Results Yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Results will be published here once an election has concluded. Check back after active elections close.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Election Tabs */}
              {electionsWithResults.length > 1 && (
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
              )}

              {activeElection && (
                <div className="space-y-4">
                  {/* Election name label */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      Completed
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" /> {activeElection.totalVotes.toLocaleString()} total votes
                    </span>
                  </div>

                  {activeElection.results.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No candidates were registered for this election.
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Winner Card */}
                      {activeElection.totalVotes > 0 && (
                        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-background dark:from-amber-900/10">
                          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative shrink-0">
                              <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-amber-300 dark:border-amber-700 shadow-lg">
                                {activeElection.results[0].photo ? (
                                  <img src={activeElection.results[0].photo} alt={activeElection.results[0].name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl font-bold text-amber-600">
                                    {activeElection.results[0].symbol || activeElection.results[0].name?.[0]}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                                <Trophy className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="text-center sm:text-left">
                              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">🏆 Winner</p>
                              <h2 className="text-2xl font-extrabold mt-0.5">{activeElection.results[0].name}</h2>
                              <p className="text-muted-foreground text-sm">{activeElection.results[0].party}</p>
                            </div>
                            <div className="sm:ml-auto text-center sm:text-right">
                              <p className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                                {activeElection.results[0].votes.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Votes · {activeElection.results[0].percent}%
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Full Leaderboard */}
                      <div className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Full Leaderboard</h2>
                        <div className="space-y-2">
                          {activeElection.results.map((item) => (
                            <ResultCard key={item.rank} result={item} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
