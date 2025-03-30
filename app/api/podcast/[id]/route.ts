import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFeedDetails, refreshFeed } from '@/lib/feed-processor'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the feed by ID
    const { data: feed, error: feedError } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()
    
    if (feedError) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 })
    }
    
    // Get the feed details and episodes
    const { podcast, episodes } = await getFeedDetails(feed.id)
    
    // Get saved episodes and playback states for this podcast's episodes
    const episodeIds = episodes.map(episode => episode.id)
    
    // Get saved episodes
    const { data: savedEpisodes } = await supabase
      .from('saved_episodes')
      .select('episode_id')
      .eq('user_id', session.user.id)
      .in('episode_id', episodeIds)
    
    // Get playback states
    const { data: playbackStates } = await supabase
      .from('playback_states')
      .select('episode_id, last_position, playback_rate')
      .eq('user_id', session.user.id)
      .in('episode_id', episodeIds)
    
    // Create a map of saved episode IDs
    const savedEpisodeMap = savedEpisodes?.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.episode_id] = true
      return acc
    }, {}) || {}
    
    // Create a map of playback states
    const playbackStateMap = playbackStates?.reduce<Record<string, { position: number, rate: number }>>((acc, item) => {
      acc[item.episode_id] = { 
        position: item.last_position,
        rate: item.playback_rate
      }
      return acc
    }, {}) || {}
    
    // Enhance episodes with user-specific data
    const enhancedEpisodes = episodes.map(episode => ({
      ...episode,
      isBookmarked: !!savedEpisodeMap[episode.id],
      progress: playbackStateMap[episode.id]?.position || 0,
      playbackRate: playbackStateMap[episode.id]?.rate || 1
    }))
    
    return NextResponse.json({ podcast, episodes: enhancedEpisodes })
  } catch (error) {
    console.error('Error fetching podcast:', error)
    return NextResponse.json({ error: 'Failed to fetch podcast' }, { status: 500 })
  }
}

// PUT handler to refresh a podcast feed
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Refresh the feed
    const result = await refreshFeed(session.user.id, params.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    // Get the updated feed details
    const { podcast, episodes } = await getFeedDetails(params.id)
    
    return NextResponse.json({ 
      success: true, 
      message: result.message,
      podcast,
      episodeCount: episodes.length,
      newEpisodeCount: result.newEpisodeCount
    })
  } catch (error) {
    console.error('Error refreshing podcast:', error)
    return NextResponse.json({ error: 'Failed to refresh podcast' }, { status: 500 })
  }
}