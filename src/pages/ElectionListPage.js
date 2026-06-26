import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ElectionCard from '../components/ElectionCard';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '../components/ui/card';
import { supabase } from '../lib/supabaseClient';
import { ScrollText } from 'lucide-react';

export default function ElectionListPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data) setElections(data);
      setLoading(false);
    };
    fetchElections();
  }, []);

  const handleView = (id) => {
    navigate('/vote');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <Sidebar />

        <section className="space-y-6 min-w-0">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-background to-background p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Election Directory</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Active & Upcoming Elections</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage, monitor, and participate in elections from one secure portal.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading elections...</p>
              </div>
            </div>
          ) : elections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {elections.map((election) => (
                <motion.div key={election.id} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400 }}>
                  <ElectionCard
                    election={{
                      id: election.id,
                      name: election.title,
                      description: election.description,
                      start: election.start_date,
                      end: election.end_date,
                      status: election.status,
                    }}
                    onView={handleView}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <ScrollText className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No Elections Found</p>
                <p className="text-sm text-muted-foreground">There are no elections scheduled at this time.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
