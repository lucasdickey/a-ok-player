import { supabase } from './supabase';

/**
 * Tests the connection to Supabase
 * @returns Object with status and details about the connection
 */
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      message: 'Supabase credentials are not properly configured',
      details: 'Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    };
  }
  
  try {
    // Simple query to test connection - avoid using aggregate functions
    const { data, error } = await supabase.from('podcast_subscriptions').select('id').limit(1);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        details: error.message,
        error
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      details: 'Connection is working properly',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when connecting to Supabase',
      details: error instanceof Error ? error.message : String(error),
      error
    };
  }
}

/**
 * Tests the database schema by checking all required tables
 * @returns Object with status and details about the database schema
 */
export async function testDatabaseSchema() {
  try {
    const tables = [
      'podcast_subscriptions',
      'episodes',
      'queue_items',
      'saved_episodes',
      'playback_states'
    ];
    
    const results = await Promise.all(
      tables.map(async (table) => {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        return {
          table,
          exists: !error,
          error: error ? error.message : null
        };
      })
    );
    
    const missingTables = results.filter(result => !result.exists);
    
    if (missingTables.length > 0) {
      return {
        success: false,
        message: 'Some required tables are missing',
        details: `Missing tables: ${missingTables.map(t => t.table).join(', ')}`,
        tables: results
      };
    }
    
    return {
      success: true,
      message: 'All required tables exist',
      details: 'Database schema is properly configured',
      tables: results
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when testing database schema',
      details: error instanceof Error ? error.message : String(error),
      error
    };
  }
}

/**
 * Tests the table structure by checking for required columns
 * @returns Object with status and details about the table structure
 */
export async function testTableStructure() {
  try {
    // Define the expected columns for each table
    const expectedColumns = {
      podcast_subscriptions: [
        'id', 
        'user_id', 
        'title', 
        'description', 
        'author', 
        'image_url', 
        'feed_url', 
        'website_url', 
        'last_checked_at', 
        'created_at'
      ],
      episodes: [
        'id', 
        'feed_id', 
        'guid', 
        'title', 
        'description', 
        'published_date', 
        'duration', 
        'audio_url', 
        'image_url', 
        'is_played', 
        'created_at'
      ],
      queue_items: [
        'id', 
        'user_id', 
        'episode_id', 
        'position', 
        'added_at'
      ],
      saved_episodes: [
        'id', 
        'user_id', 
        'episode_id', 
        'created_at'
      ],
      playback_states: [
        'id', 
        'user_id', 
        'episode_id', 
        'last_position', 
        'playback_rate', 
        'updated_at'
      ]
    };
    
    // For each table, try to select the required columns
    const results = await Promise.all(
      Object.entries(expectedColumns).map(async ([table, columns]) => {
        try {
          const { error } = await supabase
            .from(table)
            .select(columns.join(','))
            .limit(0);
          
          return {
            table,
            valid: !error,
            error: error ? error.message : null
          };
        } catch (e) {
          return {
            table,
            valid: false,
            error: e instanceof Error ? e.message : String(e)
          };
        }
      })
    );
    
    const invalidTables = results.filter(result => !result.valid);
    
    if (invalidTables.length > 0) {
      return {
        success: false,
        message: 'Some tables have invalid structure',
        details: `Tables with invalid structure: ${invalidTables.map(t => t.table).join(', ')}`,
        tables: results
      };
    }
    
    return {
      success: true,
      message: 'All tables have valid structure',
      details: 'Table structure is properly configured',
      tables: results
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when testing table structure',
      details: error instanceof Error ? error.message : String(error),
      error
    };
  }
}