import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
