import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Building2, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email Support', value: 'support@smartvote.app' },
    { icon: Building2, label: 'Office', value: 'Government Election Center, New Delhi' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Get in Touch</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Contact SmartVote Support</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Need help with your voter account or election process? Our secure support team is here to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4">How can we help?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our team handles voter registration issues, election queries, technical support, and general feedback. We aim to respond within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-border">
                <CardContent className="p-6 sm:p-8">
                  {sent ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                      <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Message Sent!</h3>
                        <p className="text-sm text-muted-foreground mt-1">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name">Your Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="Full name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-email">Email Address</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-message">Message</Label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          placeholder="How can we help you?"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
