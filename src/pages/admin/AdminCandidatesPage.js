import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Users,
  Upload,
  ImageIcon,
} from 'lucide-react';

const EMOJI_SYMBOLS = ['🪷', '✋', '🧹', '🐘', '🚲', '🕰️', '🌾', '🏹', '⚖️', '🚜', '🏠', '☂️', '✈️', '🦁', '🌴'];

function CandidateModal({ candidate, elections, defaultElectionId, onClose, onSave }) {
  const [form, setForm] = useState(
    candidate || {
      election_id: defaultElectionId || '',
      name: '',
      party: '',
      symbol: '⭐',
      bio: '',
      age: '',
      manifesto: '',
      photo_url: '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(candidate?.photo_url || '');
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error('Image must be under 3MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Only JPEG, PNG, WEBP allowed');

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    let error;
    let retries = 3;
    
    while (retries > 0) {
      const result = await supabase.storage
        .from('candidate-photos')
        .upload(fileName, file, { contentType: file.type });
        
      error = result.error;
      
      // Handle Supabase cold start / Envoy proxy 503 timeouts
      if (error && (
          error.message.includes('upstream connect error') || 
          error.message.includes('timeout') || 
          error.message.includes('503') ||
          error.code === '503'
      )) {
        retries -= 1;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      break;
    }

    if (error) {
      toast.error('Upload failed: ' + (error.message || 'Connection error. Please try again.'));
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('candidate-photos').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    setPreviewUrl(publicUrl);
    setForm((f) => ({ ...f, photo_url: publicUrl }));
    setUploading(false);
    toast.success('Photo uploaded!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Candidate name is required');
    if (!form.election_id) return toast.error('Please select an election');

    setSaving(true);
    const payload = {
      election_id: form.election_id,
      name: form.name.trim(),
      party: form.party?.trim() || null,
      symbol: form.symbol || '⭐',
      bio: form.bio?.trim() || null,
      age: form.age ? parseInt(form.age) : null,
      manifesto: form.manifesto?.trim() || null,
      photo_url: form.photo_url || null,
    };

    let error;
    let retries = 3;

    while (retries > 0) {
      if (candidate?.id) {
        ({ error } = await supabase.from('candidates').update(payload).eq('id', candidate.id));
      } else {
        ({ error } = await supabase.from('candidates').insert([payload]));
      }

      // Handle Supabase cold start / Envoy proxy 503 timeouts
      if (error && (
          error.message.includes('upstream connect error') || 
          error.message.includes('timeout') || 
          error.message.includes('503') ||
          error.code === '503'
      )) {
        retries -= 1;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }
      break;
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + (error.message || 'Connection error. Please try again.'));
    } else {
      toast.success(candidate?.id ? 'Candidate updated!' : 'Candidate added!');
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
          <h2 className="text-xl font-bold">{candidate?.id ? 'Edit Candidate' : 'Add Candidate'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Election Select */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Assign to Election *</label>
            <select
              name="election_id"
              value={form.election_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            >
              <option value="">Select an election...</option>
              {elections.map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Narendra Modi"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Party</label>
              <input
                name="party"
                value={form.party || ''}
                onChange={handleChange}
                placeholder="e.g. BJP, INC, AAP"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Age</label>
              <input
                type="number"
                name="age"
                value={form.age || ''}
                onChange={handleChange}
                placeholder="e.g. 54"
                min={18}
                max={120}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Symbol Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Symbol</label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-lg bg-muted/30">
                {EMOJI_SYMBOLS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setForm((f) => ({ ...f, symbol: emoji }))}
                    className={`text-xl w-9 h-9 rounded-lg transition-all ${
                      form.symbol === emoji ? 'bg-orange-500/20 ring-2 ring-orange-500 scale-110' : 'hover:bg-accent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/30 shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <><div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Upload Photo</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, WEBP · Max 3MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Short Bio</label>
            <textarea
              name="bio"
              value={form.bio || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Brief background about the candidate..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Manifesto / Key Points</label>
            <textarea
              name="manifesto"
              value={form.manifesto || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Key promises and policy points..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {saving ? (
                <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Check className="h-4 w-4" /> {candidate?.id ? 'Update Candidate' : 'Add Candidate'}</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [filterElection, setFilterElection] = useState('All');
  const [deleting, setDeleting] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: cands }, { data: elecs }] = await Promise.all([
      supabase.from('candidates').select('*').order('created_at', { ascending: false }),
      supabase.from('elections').select('id, title, status').order('created_at', { ascending: false }),
    ]);
    setCandidates(cands || []);
    setElections(elecs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate? This cannot be undone.')) return;
    setDeleting(id);
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    setDeleting(null);
    if (error) { toast.error('Failed to delete: ' + error.message); }
    else { toast.success('Candidate deleted.'); fetchData(); }
  };

  const handleModalClose = () => { setShowModal(false); setEditCandidate(null); };
  const handleModalSave = () => { handleModalClose(); fetchData(); };

  const getElectionTitle = (id) => elections.find((e) => e.id === id)?.title || 'Unknown Election';

  const filtered = filterElection === 'All' ? candidates : candidates.filter((c) => c.election_id === filterElection);

  return (
    <AdminLayout>
      <AnimatePresence>
        {showModal && elections.length > 0 && (
          <CandidateModal 
            candidate={editCandidate} 
            elections={elections} 
            defaultElectionId={filterElection !== 'All' ? filterElection : ''}
            onClose={handleModalClose} 
            onSave={handleModalSave} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-orange-200 dark:border-orange-900/30 bg-gradient-to-r from-orange-500/10 via-background to-background p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Admin · Candidates</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register candidates with profile photos and assign them to elections.</p>
        </div>
        <Button
          onClick={() => { setEditCandidate(null); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-full shrink-0"
          disabled={elections.length === 0}
        >
          <Plus className="h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {elections.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          ⚠️ You need to create at least one election before adding candidates.
        </div>
      )}

      {/* Filter by Election */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterElection('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterElection === 'All' ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          All <span className="ml-1 text-xs opacity-70">{candidates.length}</span>
        </button>
        {elections.map((e) => (
          <button
            key={e.id}
            onClick={() => setFilterElection(e.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all truncate max-w-[180px] ${
              filterElection === e.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {e.title}
            <span className="ml-1 text-xs opacity-70">{candidates.filter((c) => c.election_id === e.id).length}</span>
          </button>
        ))}
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-lg">No candidates yet</p>
                <p className="text-sm mt-1">Add your first candidate to get started.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filtered.map((candidate) => (
            <motion.div key={candidate.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shrink-0 border border-border">
                      {candidate.photo_url ? (
                        <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">{candidate.symbol || '👤'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{candidate.name}</p>
                      {candidate.party && <p className="text-sm text-muted-foreground truncate">{candidate.party}</p>}
                      {candidate.age && <p className="text-xs text-muted-foreground">Age {candidate.age}</p>}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md truncate mb-3">
                    📌 {getElectionTitle(candidate.election_id)}
                  </p>

                  {candidate.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{candidate.bio}</p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => { setEditCandidate(candidate); setShowModal(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      onClick={() => handleDelete(candidate.id)}
                      disabled={deleting === candidate.id}
                    >
                      {deleting === candidate.id ? (
                        <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
