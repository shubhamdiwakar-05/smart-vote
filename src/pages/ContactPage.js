import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, User, ShieldAlert, Upload, ImageIcon, X } from 'lucide-react';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function ContactPage() {
  const { t } = useTranslation();
  const { user, isSignedIn } = useUser();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ticketing state
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState(null);

  // New features state
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const PREDEFINED_QUERIES = [
    'OTP not received',
    'Login Issue',
    'Election details missing',
    'Update Voter ID'
  ];

  // Auto-fill form if logged in
  useEffect(() => {
    if (isSignedIn && user) {
      setForm(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || ''
      }));
      fetchMyTickets();

      const channel = supabase
        .channel('user_support_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchMyTickets)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, fetchMyTickets)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSignedIn, user]);

  const fetchMyTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      // Fetch by email to ensure backward compatibility with older tickets
      const email = user.primaryEmailAddress?.emailAddress;
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          *,
          support_messages (*)
        `)
        .or(`email.eq.${email},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sort replies
      const sortedData = (data || []).map(ticket => ({
        ...ticket,
        support_messages: (ticket.support_messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));
      
      setTickets(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleScreenshotUpload = async (file) => {
    if (!file) return null;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Screenshot must be under 3MB');
      throw new Error('Screenshot too large');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP allowed');
      throw new Error('Invalid file type');
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
      .from('support-screenshots')
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      toast.error('Upload failed: ' + error.message);
      throw error;
    }

    const { data: urlData } = supabase.storage.from('support-screenshots').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let uploadedUrl = null;
      if (screenshot) {
        setUploading(true);
        uploadedUrl = await handleScreenshotUpload(screenshot);
        setUploading(false);
      }

      let result;
      let retries = 3;
      
      while (retries > 0) {
        result = await supabase
          .from('contact_messages')
          .insert([{ 
            name: form.name, 
            email: form.email, 
            message: form.message,
            user_id: user?.id || null,
            screenshot_url: uploadedUrl
          }]);
          
        // Handle Supabase cold start / Envoy proxy 503 timeouts
        if (result.error && (
            result.error.message.includes('upstream connect error') || 
            result.error.message.includes('timeout') || 
            result.error.message.includes('503') ||
            result.error.code === '503'
        )) {
          retries -= 1;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
            continue;
          }
        }
        break;
      }

      if (result.error) throw result.error;
      
      toast.success('Message Sent!', { description: 'We have received your concern and will get back to you soon.' });
      setForm(prev => ({ ...prev, message: '' }));
      setScreenshot(null);
      setPreviewUrl(null);
      if (isSignedIn) fetchMyTickets();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message', { description: err.message || 'Connection error. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const sendReply = async (ticketId) => {
    const text = replyText[ticketId]?.trim();
    if (!text || !user) return;
    
    setSendingReply(ticketId);
    try {
      let data, error;
      let retries = 3;
      
      while (retries > 0) {
        const result = await supabase
          .from('support_messages')
          .insert([{
            ticket_id: ticketId,
            sender_id: user.id,
            sender_role: 'user',
            message: text
          }])
          .select()
          .single();
          
        data = result.data;
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

      if (error) throw error;

      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
      
      // Update local state
      setTickets(prev => prev.map(m => {
        if (m.id === ticketId) {
          return {
            ...m,
            support_messages: [...(m.support_messages || []), data]
          };
        }
        return m;
      }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reply', { description: error.message || 'Connection error. Please try again.' });
    } finally {
      setSendingReply(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t('contact.title', 'Contact Us')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle', "Have questions or need support? We're here to help.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-muted/10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: Contact Info & My Tickets */}
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-8 bg-card p-8 rounded-2xl shadow-sm border border-border">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Get In Touch</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our team handles voter registration issues, election queries, technical support, and general feedback. We aim to respond within 24 hours.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{t('contact.email', 'Email Support')}</p>
                      <p className="text-muted-foreground">support@smartvote.gov.in</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{t('contact.phone', 'Toll-Free Helpline')}</p>
                      <p className="text-muted-foreground">1800-11-1950</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{t('contact.address', 'Headquarters')}</p>
                      <p className="text-muted-foreground">
                        Nirvachan Sadan,<br/>
                        Ashoka Road, New Delhi 110001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <Card className="shadow-xl border-primary/20 sticky top-24">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Submit a Concern</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">{t('contact.name_label', 'Full Name')}</Label>
                    <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" required className="h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">{t('contact.email_label', 'Email Address')}</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Your email address" required className="h-12" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message" className="text-sm font-semibold">{t('contact.msg_label', 'Message')}</Label>
                      <span className="text-xs text-muted-foreground">Or pick a common issue:</span>
                    </div>
                    
                    {/* Pre-defined Query Chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PREDEFINED_QUERIES.map(query => (
                        <button
                          key={query}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, message: prev.message ? `${prev.message}\n${query}` : query }))}
                          className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {query}
                        </button>
                      ))}
                    </div>

                    <textarea 
                      id="message" 
                      rows={5} 
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Please describe your issue in detail..."
                      className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      required
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Attach Screenshot (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/30 shrink-0 relative group">
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button type="button" onClick={() => { setScreenshot(null); setPreviewUrl(null); }} className="text-white hover:text-red-400">
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="screenshot"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setScreenshot(file);
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => document.getElementById('screenshot').click()}
                          disabled={isSubmitting}
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload Screenshot
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, WEBP · Max 3MB</p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-4 text-lg font-bold rounded-xl" disabled={isSubmitting || uploading}>
                    {(isSubmitting || uploading) ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                    {uploading ? 'Uploading...' : isSubmitting ? 'Sending...' : t('contact.send', 'Send Message')}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
          </div>
          
          {/* TICKETING SECTION */}
          {isSignedIn && (
            <div className="mt-16 max-w-4xl mx-auto">
              <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
                <MessageSquare className="text-primary h-8 w-8" />
                My Support Tickets
              </h2>
              
              {loadingTickets ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border/50 shadow-sm">
                  <p className="text-muted-foreground text-lg">You haven't submitted any support requests yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map(ticket => {
                    const isExpanded = expandedTicketId === ticket.id;
                    return (
                      <Card key={ticket.id} className="overflow-hidden shadow-md border border-border/60 transition-all">
                        <div 
                          className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                                ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 
                                'bg-red-100 text-red-700'
                              }`}>
                                {ticket.status}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="font-semibold text-lg line-clamp-1">{ticket.message}</p>
                            {ticket.screenshot_url && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md border border-blue-100">
                                <ImageIcon className="h-3.5 w-3.5" /> Attached Screenshot
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? 'Hide Chat' : 'View Chat'}
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t bg-muted/10">
                            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                              
                              {/* Original User Message */}
                              <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-4 w-4" />
                                  </div>
                                </div>
                                <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-background border border-border/50 shadow-sm">
                                  <p className="text-sm font-bold text-primary mb-1">You</p>
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                                  {ticket.screenshot_url && (
                                    <div className="mt-3 rounded-lg overflow-hidden border border-border/50 max-w-sm">
                                      <img src={ticket.screenshot_url} alt="Attached screenshot" className="w-full object-contain" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Chat Replies */}
                              {ticket.support_messages && ticket.support_messages.map(reply => {
                                const isUser = reply.sender_role === 'user';
                                return (
                                  <div key={reply.id} className={`flex gap-4 ${isUser ? '' : 'flex-row-reverse'}`}>
                                    <div className="flex-shrink-0 mt-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary/10 text-primary' : 'bg-saffron/10 text-saffron-dark'}`}>
                                        {isUser ? <User className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                      </div>
                                    </div>
                                    <div className={`flex-1 p-4 rounded-2xl border border-border/50 shadow-sm max-w-[85%] ${isUser ? 'bg-background rounded-tl-none' : 'bg-saffron/5 rounded-tr-none'}`}>
                                      <div className={`flex items-center gap-2 mb-1 ${isUser ? '' : 'justify-end'}`}>
                                        <p className="text-sm font-bold text-primary">
                                          {isUser ? 'You' : 'Admin Support'}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground">
                                          {new Date(reply.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isUser ? 'text-left' : 'text-right'}`}>
                                        {reply.message}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reply Input Area */}
                            {ticket.status !== 'Resolved' ? (
                              <div className="p-4 border-t bg-background flex gap-3">
                                <textarea
                                  rows={1}
                                  value={replyText[ticket.id] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                                  placeholder="Type your reply..."
                                  className="flex-1 min-h-[44px] max-h-32 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      sendReply(ticket.id);
                                    }
                                  }}
                                />
                                <Button 
                                  className="h-11 px-6 rounded-xl shrink-0 shadow-md" 
                                  onClick={() => sendReply(ticket.id)}
                                  disabled={sendingReply === ticket.id || !(replyText[ticket.id]?.trim())}
                                >
                                  {sendingReply === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                  Reply
                                </Button>
                              </div>
                            ) : (
                              <div className="p-4 border-t bg-muted/20 text-center text-sm text-muted-foreground">
                                This ticket has been resolved and closed. If you have further issues, please submit a new concern.
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
