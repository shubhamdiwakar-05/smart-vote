import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching elections...");
  const { data: elections, error: err1 } = await supabase.from('elections').select('*');
  console.log("Elections:", elections, err1);

  console.log("Fetching candidates...");
  const { data: candidates, error: err2 } = await supabase.from('candidates').select('*');
  console.log("Candidates:", candidates, err2);
  
  console.log("Fetching users...");
  const { data: users, error: err3 } = await supabase.from('users').select('*');
  console.log("Users:", users, err3);
}

run();
