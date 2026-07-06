import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const now = new Date();
  
  // Make the first election Ongoing
  const ongoingStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const ongoingEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  
  // Make the second election Upcoming
  const upcomingStart = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const upcomingEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  const { data: elections } = await supabase.from('elections').select('*');
  if (elections && elections.length >= 2) {
    await supabase.from('elections').update({ start_time: ongoingStart, end_time: ongoingEnd, status: 'Ongoing' }).eq('id', elections[0].id);
    await supabase.from('elections').update({ start_time: upcomingStart, end_time: upcomingEnd, status: 'Upcoming' }).eq('id', elections[1].id);
    console.log('Updated elections to be Ongoing and Upcoming.');
  } else {
    console.log('Not enough elections to update.');
  }
}

run();
