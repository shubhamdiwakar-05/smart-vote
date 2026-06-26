import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, MapPin, CreditCard, PenLine, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (clerkUser) {
        const { data } = await supabase.from('profiles').select('*').eq('id', clerkUser.id).maybeSingle();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [clerkUser]);

  const user = clerkUser ? { 
    id: clerkUser.id, 
    name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress, 
    email: clerkUser.primaryEmailAddress?.emailAddress,
    phone: profile?.phone,
    voter_id: profile?.voter_id,
    city: profile?.city,
    district: profile?.district,
    state: profile?.state
  } : null;

  const details = [
    { icon: Mail, label: 'Email', value: user?.email || '—' },
    { icon: Phone, label: 'Phone', value: user?.phone || '—' },
    { icon: MapPin, label: 'Location', value: user?.city ? `${user.city}, ${user.district}, ${user.state}` : '—' },
    { icon: CreditCard, label: 'Voter ID', value: user?.voter_id || '—' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-6 min-w-0">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Account</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Voter Profile</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your personal information and account settings.</p>
          </div>

          {/* Profile Card */}
          <Card className="border-border">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <Avatar className="h-20 w-20 shrink-0 ring-4 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-extrabold">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Badge */}
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{user?.name || 'Smart Voter'}</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <Badge variant="secondary" className="text-xs">Verified Voter</Badge>
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="sm:ml-auto flex gap-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="sm" className="gap-2">
                    <PenLine className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border my-6" />

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold mt-0.5 break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border my-6" />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Update Details
                </Button>
                <Button variant="outline" className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
