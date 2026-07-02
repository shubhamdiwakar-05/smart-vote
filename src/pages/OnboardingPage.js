import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';
import { indiaLocations } from '../data/locations';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ voterId: '', phone: '', state: '', district: '', city: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const stateOptions = indiaLocations.map((item) => item.state);
  const stateEntry = indiaLocations.find((item) => item.state === form.state);
  const districtOptions = stateEntry?.districts || [];

  const validate = () => {
    const next = {};
    if (!form.voterId.trim()) next.voterId = t('onboarding.req_voter_id');
    if (!form.phone.match(/^\d{10}$/)) next.phone = t('onboarding.req_phone');
    if (!form.state) next.state = t('onboarding.req_state');
    if (!form.district) next.district = t('onboarding.req_district');
    if (!form.city) next.city = t('onboarding.req_city');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || !user) return;
    
    setLoading(true);
    try {
      // 1. Insert into Supabase
      const { error: dbError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          name: user.fullName || user.primaryEmailAddress?.emailAddress,
          voter_id: form.voterId,
          phone: form.phone,
          state: form.state,
          district: form.district,
          city: form.city,
        }
      ]);

      if (dbError) throw dbError;

      // 2. Update Clerk unsafeMetadata to mark onboarding complete
      await user.update({
        unsafeMetadata: { onboardingComplete: true }
      });

      toast.success('Onboarding complete!');
      // Force reload to update ProtectedRoute state
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background py-8 px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-border">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">{t('onboarding.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('onboarding.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voter ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="voterId">{t('onboarding.voter_id')}</Label>
                  <Input
                    id="voterId"
                    placeholder={t('onboarding.voter_id_ph')}
                    value={form.voterId}
                    onChange={(e) => setForm({ ...form, voterId: e.target.value.toUpperCase() })}
                    className={errors.voterId ? 'border-destructive' : ''}
                  />
                  {errors.voterId && <p className="text-xs text-destructive">{errors.voterId}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t('onboarding.phone')}</Label>
                  <Input
                    id="phone"
                    placeholder={t('onboarding.phone_ph')}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* State */}
                <div className="space-y-1.5">
                  <Label>{t('onboarding.state')}</Label>
                  <Select
                    value={form.state}
                    onValueChange={(val) => setForm({ ...form, state: val, district: '', city: '' })}
                  >
                    <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('onboarding.state_ph')} />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <Label>{t('onboarding.district')}</Label>
                  <Select
                    value={form.district}
                    onValueChange={(val) => setForm({ ...form, district: val, city: '' })}
                    disabled={!form.state}
                  >
                    <SelectTrigger className={errors.district ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('onboarding.district_ph')} />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d.district} value={d.district}>{d.district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label>{t('onboarding.city')}</Label>
                  <Input
                    placeholder={t('onboarding.city_ph')}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center">
                <Button type="submit" className="w-full max-w-sm" size="lg" disabled={loading}>
                  {loading ? t('onboarding.saving') : t('onboarding.submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
