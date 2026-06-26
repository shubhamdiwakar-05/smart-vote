import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, MapPin, Calendar, AlertCircle } from 'lucide-react';

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

  // Map Clerk user to expected shape
  const user = clerkUser ? { 
    id: clerkUser.id, 
    name: clerkUser.fullName, 
    email: clerkUser.primaryEmailAddress?.emailAddress,
    voter_id: profile?.voter_id,
    city: profile?.city,
    district: profile?.district,
    state: profile?.state
  } : null;
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchElectionData = async () => {
      const { data: electionData } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'Ongoing')
        .limit(1)
        .single();

      if (electionData) {
        setElection(electionData);
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('*')
          .eq('election_id', electionData.id);
        if (candidatesData) setCandidates(candidatesData);

        if (user) {
          const { data: voteData } = await supabase
            .from('votes')
            .select('*')
            .eq('election_id', electionData.id)
            .eq('voter_id', user.id)
            .maybeSingle();
          if (voteData) setHasVoted(true);
        }
      }
      setLoading(false);
    };

    fetchElectionData();
  }, [user]);

  const handleSelect = (id) => {
    if (!user) {
      toast.error('Please log in to cast your vote.');
      return;
    }
    if (hasVoted) {
      toast.error('You have already voted in this election.');
      return;
    }
    setSelected(candidates.find((c) => c.id === id));
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (!selected || !election || !user) return;

    const { error } = await supabase.from('votes').insert([
      { election_id: election.id, candidate_id: selected.id, voter_id: user.id },
    ]);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already voted in this election.');
        setHasVoted(true);
      } else {
        toast.error('Failed to cast vote. Please try again.');
      }
    } else {
      setHasVoted(true);
      toast.success(`Vote cast successfully for ${selected?.name}!`);
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
              <p className="text-sm">Loading election details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <Sidebar />
          <Card className="flex items-center justify-center h-64">
            <CardContent className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Active Elections</h3>
              <p className="text-muted-foreground text-sm mt-1">There are no ongoing elections at this time. Check back later.</p>
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

        <section className="space-y-6 min-w-0">
          {/* Election Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Active Election</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{election.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm max-w-xl">{election.description}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{election.district || 'Nationwide'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{election.start_date} – {election.end_date}</span>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Voter Profile */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voter Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {user ? (
                  <div>
                    <p className="font-semibold">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.city}, {user.district}, {user.state}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {user.voter_id}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Please log in to vote.</p>
                )}
              </CardContent>
            </Card>

            {/* Voting Status */}
            <Card className={`border-border ${hasVoted ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Voting Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                {hasVoted ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Vote Cast Successfully!</p>
                      <p className="text-xs text-muted-foreground">Your vote has been recorded and secured.</p>
                    </div>
                  </>
                ) : user ? (
                  <>
                    <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Ready to Vote</p>
                      <p className="text-xs text-muted-foreground">Location: {user.district}, {user.state}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Log in to check your status.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Candidates Grid */}
          <div>
            <h2 className="text-lg font-bold mb-4">Select a Candidate</h2>
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
                    onSelect={handleSelect}
                  />
                </motion.div>
              ))}
            </div>
          </div>
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
              {selected?.symbol || '🗳️'}
            </div>
            <div>
              <p className="font-bold text-lg">{selected?.name}</p>
              <p className="text-sm text-muted-foreground">{selected?.party}</p>
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
