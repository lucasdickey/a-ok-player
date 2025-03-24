import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET handler to fetch a specific episode's playback state
export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get episode ID from query params
    const searchParams = request.nextUrl.searchParams
    const episodeId = searchParams.get('episodeId')
    
    if (!episodeId) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 })
    }
    
    // Get the playback state
    const { data, error } = await supabase
      .from('playback_states')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('episode_id', episodeId)
      .maybeSingle()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ playbackState: data })
  } catch (error) {
    console.error('Error fetching playback state:', error)
    return NextResponse.json({ error: 'Failed to fetch playback state' }, { status: 500 })
  }
}

// POST/PUT handler to update the playback state for an episode
export async function POST(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get playback data from request body
    const body = await request.json()
    const { episodeId, position, playbackRate } = body
    
    if (!episodeId || position === undefined) {
      return NextResponse.json({ 
        error: 'Episode ID and position are required' 
      }, { status: 400 })
    }
    
    // Check if a playback state already exists for this episode
    const { data: existingState } = await supabase
      .from('playback_states')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('episode_id', episodeId)
      .maybeSingle()
    
    let result;
    
    if (existingState) {
      // Update existing state
      result = await supabase
        .from('playback_states')
        .update({
          last_position: position,
          playback_rate: playbackRate || 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingState.id)
        .select()
    } else {
      // Create new state
      result = await supabase
        .from('playback_states')
        .insert({
          user_id: session.user.id,
          episode_id: episodeId,
          last_position: position,
          playback_rate: playbackRate || 1
        })
        .select()
    }
    
    if (result.error) {
      throw result.error
    }
    
    return NextResponse.json({ playbackState: result.data[0] })
  } catch (error) {
    console.error('Error updating playback state:', error)
    return NextResponse.json({ error: 'Failed to update playback state' }, { status: 500 })
  }
}