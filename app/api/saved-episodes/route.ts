import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET handler to fetch all saved episodes for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user's saved episodes
    const { data: savedEpisodes, error } = await supabase
      .from('saved_episodes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ savedEpisodes })
  } catch (error) {
    console.error('Error fetching saved episodes:', error)
    return NextResponse.json({ error: 'Failed to fetch saved episodes' }, { status: 500 })
  }
}

// POST handler to save an episode
export async function POST(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get episode ID from request body
    const body = await request.json()
    const { episodeId } = body
    
    if (!episodeId) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 })
    }
    
    // Check if the episode is already saved
    const { data: existingSaved } = await supabase
      .from('saved_episodes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('episode_id', episodeId)
      .maybeSingle()
    
    if (existingSaved) {
      return NextResponse.json({ error: 'Episode is already saved' }, { status: 400 })
    }
    
    // Save the episode
    const { data, error } = await supabase
      .from('saved_episodes')
      .insert({
        user_id: session.user.id,
        episode_id: episodeId
      })
      .select()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ savedEpisode: data[0] })
  } catch (error) {
    console.error('Error saving episode:', error)
    return NextResponse.json({ error: 'Failed to save episode' }, { status: 500 })
  }
}

// DELETE handler to unsave an episode
export async function DELETE(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get episode ID from request body
    const body = await request.json()
    const { episodeId } = body
    
    if (!episodeId) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 })
    }
    
    // Delete the saved episode
    const { error } = await supabase
      .from('saved_episodes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('episode_id', episodeId)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsaving episode:', error)
    return NextResponse.json({ error: 'Failed to unsave episode' }, { status: 500 })
  }
}