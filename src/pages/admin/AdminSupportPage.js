import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, Clock, Send, User, ShieldAlert } from 'lucide-react';
import { useUser } from '@clerk/react';

export default function AdminSupportPage() {
  const { user: adminUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('admin_support_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          *,
          support_messages (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sort support messages by created_at inside each ticket
      const sortedData = (data || []).map(ticket => ({
        ...ticket,
        support_messages: (ticket.support_messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));
      
      setMessages(sortedData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Message marked as ${newStatus}`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const sendReply = async (ticketId) => {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    
    setSendingReply(ticketId);
    try {
      let data, error;
      let retries = 3;

      while (retries > 0) {
        const result = await supabase
          .from('support_messages')
          .insert([{
            ticket_id: ticketId,
            sender_id: adminUser?.id || 'admin',
            sender_role: 'admin',
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

      toast.success('Reply sent');
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
      
      // Update local state
      setMessages(prev => prev.map(m => {
        if (m.id === ticketId) {
          return {
            ...m,
            support_messages: [...(m.support_messages || []), data],
            status: m.status === 'Resolved' ? 'In Progress' : m.status // Re-open if resolved
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support & Concerns</h1>
        <Badge variant="outline" className="px-4 py-1 text-sm">
          {messages.filter(m => m.status === 'Pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No support messages found.
            </CardContent>
          </Card>
        ) : (
          messages.map(msg => (
            <Card key={msg.id} className="overflow-hidden shadow-md">
              <div className={`h-1 w-full ${msg.status === 'Resolved' ? 'bg-green-500' : msg.status === 'In Progress' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <CardHeader className="pb-3 border-b bg-muted/20 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {msg.name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={
                    msg.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                    msg.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }>
                    {msg.status}
                  </Badge>
                  
                  {/* Status Actions */}
                  {msg.status !== 'Pending' && (
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => updateStatus(msg.id, 'Pending')}>
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Button>
                  )}
                  {msg.status !== 'In Progress' && (
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => updateStatus(msg.id, 'In Progress')}>
                      <Loader2 className="h-3 w-3 mr-1" /> Progress
                    </Button>
                  )}
                  {msg.status !== 'Resolved' && (
                    <Button variant="default" size="sm" className="h-7 text-xs px-2" onClick={() => updateStatus(msg.id, 'Resolved')}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="p-6 bg-background space-y-6 max-h-[500px] overflow-y-auto">
                  {/* Original Message */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-border/50">
                      <p className="text-sm font-semibold mb-1 text-primary">{msg.name} (Original Query)</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      {msg.screenshot_url && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-border/50 max-w-sm">
                          <img src={msg.screenshot_url} alt="Attached screenshot" className="w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {msg.support_messages && msg.support_messages.map((reply) => {
                    const isAdmin = reply.sender_role === 'admin';
                    return (
                      <div key={reply.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-saffron/10 text-saffron-dark' : 'bg-primary/10 text-primary'}`}>
                            {isAdmin ? <ShieldAlert className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className={`flex-1 p-4 rounded-2xl border border-border/50 max-w-[85%] ${isAdmin ? 'bg-saffron/5 rounded-tr-none' : 'bg-muted/30 rounded-tl-none'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                            <p className="text-sm font-semibold text-primary">
                              {isAdmin ? 'Admin Support' : msg.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Area */}
                <div className="p-4 border-t bg-muted/10 flex gap-3">
                  <textarea
                    rows={1}
                    value={replyText[msg.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                    placeholder="Type your reply to the user..."
                    className="flex-1 min-h-[44px] max-h-32 rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply(msg.id);
                      }
                    }}
                  />
                  <Button 
                    className="h-11 w-11 rounded-full shrink-0 shadow-md" 
                    onClick={() => sendReply(msg.id)}
                    disabled={sendingReply === msg.id || !(replyText[msg.id]?.trim())}
                  >
                    {sendingReply === msg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
