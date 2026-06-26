import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izlcbwjvbqkpeunibdmn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bGNid2p2YnFrcGV1bmliZG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI1MzAsImV4cCI6MjA5ODA1ODUzMH0.8JQZ_SYTmMQYTu28_Z-DQTE9gp2BWtf5DdxY_YV6jK8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Attempting signup...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'shubham+test' + Date.now() + '@gmail.com',
    password: 'password123',
    options: {
      data: {
        fullName: 'Test User 2',
        voterId: 'VOTER-' + Date.now(),
        phone: '1234567890',
        state: 'Test State',
        district: 'Test District',
        city: 'Test City',
      }
    }
  });

  if (authError) {
    console.error('Signup error:', authError);
    return;
  }

  console.log('Signup successful. User ID:', authData.user?.id);
  console.log('Session present?', !!authData.session);

  console.log('Fetching profile to verify trigger worked...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  } else {
    console.log('Profile successfully auto-created via trigger:', profile);
  }
}

testAuth();
