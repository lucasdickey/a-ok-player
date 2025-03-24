import Parser from 'rss-parser'
import { Episode, Podcast } from './podcast-data'
import { v4 as uuidv4 } from 'uuid'

// Extend the Parser.Item type to include iTunes specific fields
interface ExtendedItem extends Parser.Item {
  itunes?: {
    duration?: string
    image?: string
    summary?: string
    explicit?: string
    author?: string
    categories?: string[]
  }
  enclosure?: {
    url?: string
    length?: string
    type?: string
  }
}

interface ExtendedOutput extends Parser.Output<ExtendedItem> {
  itunes?: {
    image?: string
    author?: string
    owner?: {
      name?: string
      email?: string
    }
    categories?: Record<string, any>
  }
  image?: {
    url?: string
  }
}

// Create a new parser instance
const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'itunes.duration'],
      ['itunes:image', 'itunes.image', { keepArray: false }],
      ['itunes:summary', 'itunes.summary'],
      ['itunes:explicit', 'itunes.explicit'],
      ['itunes:author', 'itunes.author'],
      ['itunes:category', 'itunes.categories', { keepArray: true }],
    ],
    feed: [
      ['itunes:image', 'itunes.image', { keepArray: false }],
      ['itunes:author', 'itunes.author'],
      ['itunes:owner', 'itunes.owner'],
      ['itunes:category', 'itunes.categories', { keepArray: false }],
    ]
  }
})

// Function to parse seconds from various duration formats
function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0
  
  // Handle HH:MM:SS format
  if (duration.includes(':')) {
    const parts = duration.split(':').map(part => parseInt(part, 10))
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    return 0
  }
  
  // Handle simple seconds format
  return parseInt(duration, 10) || 0
}

export async function parseFeed(feedUrl: string): Promise<{ podcast: Podcast, episodes: Episode[] }> {
  try {
    const feed = await parser.parseURL(feedUrl) as ExtendedOutput
    
    // Generate a unique ID for the podcast
    const podcastId = uuidv4()
    
    // Extract podcast metadata
    const podcast: Podcast = {
      id: podcastId,
      title: feed.title || 'Unknown Podcast',
      publisher: feed.itunes?.author || feed.creator || 'Unknown Publisher',
      artwork: feed.itunes?.image?.url || feed.image?.url || '/placeholder.svg',
      description: feed.description || '',
      categories: [{ main: 'Podcasts', sub: [] }], // Default category
      website: feed.link || '',
      language: feed.language || 'en',
      explicit: feed.itunes?.explicit === 'yes',
      episodeCount: feed.items?.length || 0,
      frequency: 'Unknown', // Would need more data to determine this
      lastUpdated: feed.lastBuildDate || new Date().toISOString(),
      feedUrl
    }
    
    // Extract episode data
    const episodes: Episode[] = (feed.items || []).map((item, index) => {
      const extendedItem = item as ExtendedItem
      const audioUrl = extendedItem.enclosure?.url || ''
      const publishDate = item.pubDate || ''
      const durationSeconds = parseDurationToSeconds(extendedItem.itunes?.duration)
      
      return {
        id: item.guid || `${podcastId}-episode-${index}`,
        title: item.title || `Episode ${index + 1}`,
        description: extendedItem.itunes?.summary || item.content || item.contentSnippet || '',
        publishDate,
        duration: extendedItem.itunes?.duration || '0:00',
        durationSeconds,
        podcastTitle: feed.title || '',
        podcastId,
        artwork: extendedItem.itunes?.image?.url || feed.itunes?.image?.url || feed.image?.url || '/placeholder.svg',
        audioUrl,
        isNew: new Date(publishDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // Within the last week
        isBookmarked: false,
        progress: 0
      }
    })
    
    return { podcast, episodes }
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
    throw new Error('Failed to parse RSS feed')
  }
}