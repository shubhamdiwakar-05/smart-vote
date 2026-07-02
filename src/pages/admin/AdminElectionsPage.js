import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Vote,
  Clock,
  Activity,
  CheckCircle,
  MapPin,
  Calendar,
  ChevronDown,
} from 'lucide-react';

const STATUS_OPTIONS = ['Upcoming', 'Ongoing', 'Completed'];
const TYPE_OPTIONS = ['General', 'State', 'Local', 'Municipal', 'By-election'];

const statusStyle = {
  Upcoming: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  Ongoing: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  Completed: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const statusIcon = { Upcoming: Clock, Ongoing: Activity, Completed: CheckCircle };

function ElectionModal({ election, onClose, onSave }) {
  const [form, setForm] = useState(
    election || {
      title: '',
      description: '',
      type: 'General',
      district: '',
      status: 'Upcoming',
      start_time: '',
      end_time: '',
      start_date: '',
      end_date: '',
    }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.start_time || !form.end_time) return toast.error('Start and end times are required');
    if (new Date(form.start_time) >= new Date(form.end_time))
      return toast.error('End time must be after start time');

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      type: form.type || 'General',
      district: form.district?.trim() || null,
      status: form.status || 'Upcoming',
      start_time: form.start_time,
      end_time: form.end_time,
      start_date: form.start_time ? new Date(form.start_time).toLocaleDateString('en-IN') : form.start_date,
      end_date: form.end_time ? new Date(form.end_time).toLocaleDateString('en-IN') : form.end_date,
    };

    let error;
    if (election?.id) {
      ({ error } = await supabase.from('elections').update(payload).eq('id', election.id));
    } else {
      ({ error } = await supabase.from('elections').insert([payload]));
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success(election?.id ? 'Election updated!' : 'Election created!');
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{election?.id ? 'Edit Election' : 'Create New Election'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Election Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Delhi State Assembly Elections 2026"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the election..."
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Election Type</label>
              <select
                name="type"
                value={form.type || 'General'}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Status</label>
              <select
                name="status"
                value={form.status || 'Upcoming'}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">District / Region</label>
              <input
                name="district"
                value={form.district || ''}
                onChange={handleChange}
                placeholder="e.g. New Delhi, Maharashtra"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              {saving ? (
                <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Check className="h-4 w-4" /> {election?.id ? 'Update Election' : 'Create Election'}</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editElection, setEditElection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleting, setDeleting] = useState(null);

  const fetchElections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });
    setElections(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchElections(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this election and all its candidates? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('candidates').delete().eq('election_id', id);
    const { error } = await supabase.from('elections').delete().eq('id', id);
    setDeleting(null);
    if (error) { toast.error('Failed to delete: ' + error.message); }
    else { toast.success('Election deleted.'); fetchElections(); }
  };

  const handleModalClose = () => { setShowModal(false); setEditElection(null); };
  const handleModalSave = () => { handleModalClose(); fetchElections(); };

  const filtered = filterStatus === 'All' ? elections : elections.filter((e) => e.status === filterStatus);

  return (
    <AdminLayout>
      <AnimatePresence>
        {showModal && (
          <ElectionModal election={editElection} onClose={handleModalClose} onSave={handleModalSave} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-gradient-to-r from-red-500/10 via-background to-background p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">Admin · Elections</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Elections</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create, edit, and control election timelines.</p>
        </div>
        <Button
          onClick={() => { setEditElection(null); setShowModal(true); }}
          className="bg-red-500 hover:bg-red-600 text-white gap-2 rounded-full shrink-0"
        >
          <Plus className="h-4 w-4" /> New Election
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterStatus === s
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {s}
            <span className="ml-1.5 text-xs opacity-70">
              {s === 'All' ? elections.length : elections.filter((e) => e.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Elections List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Vote className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-lg">No elections found</p>
              <p className="text-sm mt-1">Click "New Election" to create your first one.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((election) => {
            const StatusIcon = statusIcon[election.status] || Clock;
            return (
              <motion.div key={election.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-base">{election.title}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle[election.status] || statusStyle.Upcoming}`}>
                            <StatusIcon className="h-3 w-3 inline mr-1" />
                            {election.status || 'Upcoming'}
                          </span>
                          {election.type && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {election.type}
                            </span>
                          )}
                        </div>
                        {election.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-lg">{election.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          {election.district && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {election.district}
                            </span>
                          )}
                          {(election.start_time || election.start_date) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {election.start_time
                                ? new Date(election.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                : election.start_date}
                              {' → '}
                              {election.end_time
                                ? new Date(election.end_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                : election.end_date}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => { setEditElection(election); setShowModal(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:border-destructive"
                          onClick={() => handleDelete(election.id)}
                          disabled={deleting === election.id}
                        >
                          {deleting === election.id ? (
                            <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
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
