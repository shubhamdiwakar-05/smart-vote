import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { supabase } from '../../lib/supabaseClient';
import { Users, MapPin, IdCard, Phone, Search } from 'lucide-react';

export default function AdminVotersPage() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [voteCountMap, setVoteCountMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: profiles }, { data: votes }] = await Promise.all([
        supabase.from('profiles').select('*').order('name', { ascending: true }),
        supabase.from('votes').select('voter_id'),
      ]);

      const countMap = {};
      (votes || []).forEach(({ voter_id }) => {
        countMap[voter_id] = (countMap[voter_id] || 0) + 1;
      });

      setVoters(profiles || []);
      setVoteCountMap(countMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = voters.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.voter_id?.toLowerCase().includes(q) ||
      v.district?.toLowerCase().includes(q) ||
      v.state?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q)
    );
  });

  const totalVoted = voters.filter((v) => voteCountMap[v.id] > 0).length;
  const turnout = voters.length > 0 ? Math.round((totalVoted / voters.length) * 100) : 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/30 bg-gradient-to-r from-cyan-500/10 via-background to-background p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">Admin · Voters</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Registered Voters</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {voters.length} registered · {totalVoted} voted · {turnout}% turnout
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Voters', value: voters.length, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
          { label: 'Voted', value: totalVoted, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Not Voted', value: voters.length - totalVoted, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, voter ID, district, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {/* Voter List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No voters found</p>
              {search && <p className="text-sm mt-1">Try a different search term.</p>}
            </CardContent>
          </Card>
        ) : (
          filtered.map((voter, i) => {
            const hasVoted = voteCountMap[voter.id] > 0;
            return (
              <motion.div key={voter.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className="border-border hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {voter.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{voter.name || '—'}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          hasVoted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {hasVoted ? `✓ Voted (${voteCountMap[voter.id]})` : 'Not voted'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {voter.voter_id && (
                          <span className="flex items-center gap-1"><IdCard className="h-3 w-3" /> {voter.voter_id}</span>
                        )}
                        {voter.phone && (
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {voter.phone}</span>
                        )}
                        {(voter.city || voter.district || voter.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[voter.city, voter.district, voter.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
