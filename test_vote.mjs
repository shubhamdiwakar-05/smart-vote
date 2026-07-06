import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking votes table schema or testing insert...");
  // Try inserting a vote with null candidate
  // We need a valid voter_id and election_id
  const electionId = 'a886d260-9d23-4516-b3b3-253cffc4edb1'; // Maharashtra
  const voterId = 'test-voter-id'; // We can just see if it fails with foreign key or null constraint
  const { data, error } = await supabase.from('votes').insert([
    { election_id: electionId, candidate_id: null, voter_id: voterId }
  ]);
  console.log("Result:", data, error);
}

run();
