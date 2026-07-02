import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';

// Anon key — used for all voter-facing reads (respects RLS)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

// Service role key — used ONLY in admin pages for write operations (bypasses RLS)
// Safe here because admin pages are route-guarded by useAdminCheck
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Regular client for voters
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — bypasses RLS entirely, only used in /admin/* pages
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase; // fallback to anon if key missing (will still get RLS errors)
