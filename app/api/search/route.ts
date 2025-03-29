import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFeeds, getFeedDetails } from '@/lib/feed-processor'

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
    
    // Get all user's podcast feeds
    const feeds = await getUserFeeds(session.user.id)
    
    if (!feeds || feeds.length === 0) {
      return NextResponse.json({ podcasts: [], episodes: [] })
    }
    
    // Get all podcasts and episodes data
    const allPodcasts: any[] = []
    const allEpisodes: any[] = []
    
    await Promise.all(
      feeds.map(async (feed) => {
        try {
          const { podcast, episodes } = await getFeedDetails(feed.id)
          
          // Add the feed id to the podcast for reference
          podcast.feedId = feed.id
          allPodcasts.push(podcast)
          
          // Add all episodes to combined list with podcast reference
          const episodesWithPodcast = episodes.map(episode => ({
            ...episode,
            podcastTitle: podcast.title,
            podcastImageUrl: podcast.imageUrl,
            feedId: feed.id
          }))
          
          allEpisodes.push(...episodesWithPodcast)
        } catch (error) {
          console.error(`Error getting feed details for ${feed.feed_url}:`, error)
          // Continue with other feeds even if one fails
        }
      })
    )
    
    // Normalize the search query for case-insensitive search
    const normalizedQuery = query.toLowerCase()
    
    // Search podcasts
    const matchingPodcasts = allPodcasts.filter(podcast => 
      (podcast.title && podcast.title.toLowerCase().includes(normalizedQuery)) || 
      (podcast.author && podcast.author.toLowerCase().includes(normalizedQuery)) ||
      (podcast.description && podcast.description.toLowerCase().includes(normalizedQuery))
    )
    
    // Search episodes
    const matchingEpisodes = allEpisodes.filter(episode => 
      (episode.title && episode.title.toLowerCase().includes(normalizedQuery)) || 
      (episode.podcastTitle && episode.podcastTitle.toLowerCase().includes(normalizedQuery)) ||
      (episode.description && episode.description.toLowerCase().includes(normalizedQuery))
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