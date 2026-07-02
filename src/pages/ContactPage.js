import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('contact.send') + ' (Mock)');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left: Contact Info */}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{t('contact.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team handles voter registration issues, election queries, technical support, and general feedback. We aim to respond within 24 hours.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{t('contact.email')}</p>
                    <p className="text-muted-foreground">support@smartvote.gov.in</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{t('contact.phone')}</p>
                    <p className="text-muted-foreground">1800-11-1950</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{t('contact.address')}</p>
                    <p className="text-muted-foreground">
                      Nirvachan Sadan,<br/>
                      Ashoka Road, New Delhi 110001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <Card className="shadow-lg border-border">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t('contact.name_label')}</Label>
                    <Input id="name" placeholder={t('contact.name_label')} required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('contact.email_label')}</Label>
                    <Input id="email" type="email" placeholder={t('contact.email_label')} required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">{t('contact.msg_label')}</Label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      placeholder={t('contact.msg_label')}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2">
                    <Send className="h-4 w-4 mr-2" />
                    {t('contact.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
