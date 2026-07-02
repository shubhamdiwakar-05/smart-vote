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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
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
    if (!form.voterId.trim()) next.voterId = 'Voter ID is required.';
    if (!form.phone.match(/^\d{10}$/)) next.phone = 'Please enter a valid 10-digit phone number.';
    if (!form.state) next.state = 'Please select your state.';
    if (!form.district) next.district = 'Please select your district.';
    if (!form.city) next.city = 'Please select your city.';
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
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              We need a few more details to set up your voter profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voter ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="voterId">Voter ID</Label>
                  <Input
                    id="voterId"
                    placeholder="e.g., SMV-2026-4567"
                    value={form.voterId}
                    onChange={(e) => setForm({ ...form, voterId: e.target.value.toUpperCase() })}
                    className={errors.voterId ? 'border-destructive' : ''}
                  />
                  {errors.voterId && <p className="text-xs text-destructive">{errors.voterId}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="10-digit mobile number"
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
                  <Label>State</Label>
                  <Select
                    value={form.state}
                    onValueChange={(val) => setForm({ ...form, state: val, district: '', city: '' })}
                  >
                    <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select State" />
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
                  <Label>District</Label>
                  <Select
                    value={form.district}
                    onValueChange={(val) => setForm({ ...form, district: val, city: '' })}
                    disabled={!form.state}
                  >
                    <SelectTrigger className={errors.district ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select District" />
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
                  <Label>City / Village / Constituency</Label>
                  <Input
                    placeholder="Enter your city or village"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center">
                <Button type="submit" className="w-full max-w-sm" size="lg" disabled={loading}>
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
