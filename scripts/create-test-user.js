// Script to create a test user for local development
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

// Test user credentials
const TEST_EMAIL = 'testuser@aokplayer.com';
const TEST_PASSWORD = 'TestPassword123!';

async function createTestUser() {
  try {
    // First try with service role key if available
    if (supabaseServiceKey) {
      console.log('Using service role key for admin operations...');
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        // Try to create user with admin API
        const { data, error } = await adminSupabase.auth.admin.createUser({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          email_confirm: true // Auto-confirm the email
        });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`Test user ${TEST_EMAIL} already exists.`);
          } else {
            console.error('Error creating test user with admin API:', error.message);
            console.log('Falling back to regular signup...');
          }
        } else {
          console.log('Test user created successfully with admin API!');
          console.log(`You can use the following credentials for testing:`);
          console.log(`Email: ${TEST_EMAIL}`);
          console.log(`Password: ${TEST_PASSWORD}`);
          return;
        }
      } catch (adminError) {
        console.error('Admin API error:', adminError.message);
        console.log('Falling back to regular signup...');
      }
    }

    // Fallback to regular signup
    console.log('Using anonymous key for regular signup...');
    const regularSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await regularSupabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`Test user ${TEST_EMAIL} already exists.`);
      } else {
        console.error('Error creating test user with regular signup:', error.message);
      }
    } else {
      console.log('Test user signup initiated!');
      console.log('Note: You may need to confirm the email if email confirmation is enabled.');
      console.log(`You can use the following credentials for testing:`);
      console.log(`Email: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}`);
    }
    
    // Try to sign in to see if the user already exists and is confirmed
    const { data: signInData, error: signInError } = await regularSupabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (!signInError) {
      console.log('Successfully signed in with test user credentials.');
      console.log('The test user is confirmed and ready to use.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createTestUser();
