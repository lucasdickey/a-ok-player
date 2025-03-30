import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// These values need to be replaced with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with additional options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Tests the connection to Supabase
 * @returns Object with status and details about the connection
 */
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      message: 'Supabase credentials are not properly configured',
      details: 'Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }
  }
  
  try {
    // Simple query to test connection - avoid using aggregate functions
    const { data, error } = await supabase.from('podcast_subscriptions').select('id').limit(1)
    
    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        details: error.message,
        error
      }
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      details: 'Connection is working properly',
      data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Exception when connecting to Supabase',
      details: error instanceof Error ? error.message : String(error),
      error
    }
  }
}