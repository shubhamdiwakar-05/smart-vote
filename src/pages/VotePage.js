import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CandidateCard from '../components/CandidateCard';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, MapPin, Calendar, AlertCircle, Vote } from 'lucide-react';

export default function VotePage() {
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

  const user = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        voter_id: profile?.voter_id,
        city: profile?.city,
        district: profile?.district,
        state: profile?.state,
      }
    : null;

  // Elections + candidates state
  const [electionsData, setElectionsData] = useState([]); // [{election, candidates, hasVoted}]
  const [loading, setLoading] = useState(true);

  // Confirm dialog state
  const [selected, setSelected] = useState(null); // {candidate, electionId}
  const [open, setOpen] = useState(false);

  // Fetch all ongoing elections and candidates
  useEffect(() => {
    const fetchElectionData = async () => {
      setLoading(true);
      const { data: ongoingElections } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'Ongoing')
        .order('start_time', { ascending: true });

      if (!ongoingElections || ongoingElections.length === 0) {
        setElectionsData([]);
        setLoading(false);
        return;
      }

      const enriched = await Promise.all(
        ongoingElections.map(async (election) => {
          // Fetch candidates
          const { data: candidates } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id);

          // Check if user has voted in this election
          let hasVoted = false;
          if (user) {
            const { data: voteData } = await supabase
              .from('votes')
              .select('id')
              .eq('election_id', election.id)
              .eq('voter_id', user.id)
              .maybeSingle();
            hasVoted = !!voteData;
          }

          return { election, candidates: candidates || [], hasVoted };
        })
      );

      setElectionsData(enriched);
      setLoading(false);
    };

    fetchElectionData();
  }, [user?.id]);

  const handleSelect = (candidate, electionId) => {
    if (!user) {
      toast.error('Please log in to cast your vote.');
      return;
    }
    const elData = electionsData.find((e) => e.election.id === electionId);
    if (elData?.hasVoted) {
      toast.error('You have already voted in this election.');
      return;
    }
    setSelected({ candidate, electionId });
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (!selected || !user) return;

    const { candidate, electionId } = selected;
    const { error } = await supabase.from('votes').insert([
      { election_id: electionId, candidate_id: candidate.id, voter_id: user.id },
    ]);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already voted in this election.');
      } else {
        toast.error('Failed to cast vote. Please try again.');
      }
    } else {
      toast.success(`Vote cast successfully for ${candidate.name}!`);
      // Mark this election as voted locally
      setElectionsData((prev) =>
        prev.map((e) =>
          e.election.id === electionId ? { ...e, hasVoted: true } : e
        )
      );
    }
    setSelected(null);
  };

  const formatDate = (ts, fallback) => {
    if (!ts) return fallback || '—';
    try {
      return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return fallback || ts;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <Sidebar />
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading elections...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (electionsData.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <Sidebar />
          <Card className="flex items-center justify-center h-64">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Active Elections</h3>
              <p className="text-muted-foreground text-sm mt-1">
                There are no ongoing elections at this time. Check back later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-10 min-w-0">
          {/* Page Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Cast Your Vote</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Active Elections</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {electionsData.length} election{electionsData.length !== 1 ? 's' : ''} currently active.
              Your vote is secret and immutable.
            </p>
          </div>

          {/* Voter Info Card */}
          {user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voter Profile</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={clerkUser?.imageUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{[user.city, user.district, user.state].filter(Boolean).join(', ') || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {user.voter_id || '—'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voting Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Vote className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {electionsData.filter((e) => e.hasVoted).length} / {electionsData.length} voted
                    </p>
                    <p className="text-xs text-muted-foreground">across active elections</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Per-Election Sections */}
          {electionsData.map(({ election, candidates, hasVoted }) => (
            <div key={election.id} className="space-y-4">
              {/* Election Header */}
              <div className={`rounded-2xl border p-5 shadow-sm ${
                hasVoted
                  ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/10 to-background'
                  : 'border-border bg-gradient-to-r from-primary/5 to-background'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                        Ongoing
                      </span>
                      {election.type && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{election.type}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight">{election.title}</h2>
                    {election.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{election.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      {election.district && (
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{election.district}</span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(election.start_time, election.start_date)} – {formatDate(election.end_time, election.end_date)}
                      </span>
                    </div>
                  </div>

                  {hasVoted && (
                    <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-semibold">Voted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Candidates Grid */}
              {hasVoted ? (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-5 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">Your vote has been recorded!</p>
                  <p className="text-sm text-muted-foreground mt-1">Results will be available after the election closes.</p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-muted-foreground">
                  <p className="text-sm">No candidates have been registered for this election yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((candidate) => (
                    <motion.div key={candidate.id} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <CandidateCard
                        candidate={{
                          id: candidate.id,
                          name: candidate.name,
                          party: candidate.party,
                          symbol: candidate.symbol,
                          photo: candidate.photo_url,
                        }}
                        onSelect={(id) => {
                          const c = candidates.find((c) => c.id === id);
                          if (c) handleSelect(c, election.id);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>

      {/* Confirm Vote Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. Please confirm your selection below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border my-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {selected?.candidate?.symbol || '🗳️'}
            </div>
            <div>
              <p className="font-bold text-lg">{selected?.candidate?.name}</p>
              <p className="text-sm text-muted-foreground">{selected?.candidate?.party}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Confirm Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
