import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseFeed } from '@/lib/rss-parser'

export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }
    
    // Get all user's podcast subscriptions
    const { data: subscriptions, error } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
    
    if (error) {
      throw error
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ podcasts: [], episodes: [] })
    }
    
    // Parse all feeds to get podcasts and episodes data
    const allPodcasts: any[] = []
    const allEpisodes: any[] = []
    
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const { podcast, episodes } = await parseFeed(subscription.feed_url)
          
          // Add the subscription id to the podcast for reference
          podcast.subscriptionId = subscription.id
          allPodcasts.push(podcast)
          
          // Add all episodes to combined list
          allEpisodes.push(...episodes)
        } catch (error) {
          console.error(`Error parsing feed ${subscription.feed_url}:`, error)
          // Continue with other feeds even if one fails
        }
      })
    )
    
    // Normalize the search query for case-insensitive search
    const normalizedQuery = query.toLowerCase()
    
    // Search podcasts
    const matchingPodcasts = allPodcasts.filter(podcast => 
      podcast.title.toLowerCase().includes(normalizedQuery) || 
      podcast.publisher.toLowerCase().includes(normalizedQuery) ||
      podcast.description.toLowerCase().includes(normalizedQuery)
    )
    
    // Search episodes
    const matchingEpisodes = allEpisodes.filter(episode => 
      episode.title.toLowerCase().includes(normalizedQuery) || 
      episode.podcastTitle.toLowerCase().includes(normalizedQuery) ||
      episode.description.toLowerCase().includes(normalizedQuery)
    )
    
    return NextResponse.json({ 
      podcasts: matchingPodcasts,
      episodes: matchingEpisodes
    })
  } catch (error) {
    console.error('Error searching content:', error)
    return NextResponse.json({ error: 'Failed to search content' }, { status: 500 })
  }
}