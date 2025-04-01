import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './supabase-types';

// Use a conditional import for linkedom to handle browser environment
let DOMParser: typeof window.DOMParser | any;
try {
  // Only import in server context
  if (typeof window === 'undefined') {
    const linkedom = require('linkedom');
    DOMParser = linkedom.DOMParser;
  } else {
    // Use browser's native DOMParser in client context
    DOMParser = window.DOMParser;
  }
} catch (error) {
  console.warn('Error importing linkedom:', error);
  // Fallback to browser's native DOMParser if available
  if (typeof window !== 'undefined' && window.DOMParser) {
    DOMParser = window.DOMParser;
  }
}

// Types for podcast and episode data
export interface Podcast {
  id: string;
  title: string;
  publisher: string;
  artwork: string;
  description: string;
  categories: { main: string; sub: string[] }[];
  website: string;
  language: string;
  explicit: boolean;
  episodeCount: number;
  frequency: string;
  lastUpdated: string;
  feedUrl: string;
}

export interface Episode {
  id: string;
  guid: string;
  title: string;
  description: string;
  publishDate: string;
  duration: string;
  durationSeconds: number;
  podcastTitle: string;
  podcastId: string;
  artwork: string;
  audioUrl: string;
  isNew: boolean;
  isBookmarked: boolean;
  progress: number;
  chaptersUrl?: string;
  transcript_url?: string;
  season?: number;
  episode?: number;
  type?: 'full' | 'trailer' | 'bonus';
  explicit?: boolean;
}

// Extended types for RSS parser
interface ExtendedItem extends Parser.Item {
  itunes?: {
    duration?: string;
    image?: string | { href?: string; url?: string };
    summary?: string;
    explicit?: string;
    author?: string;
    categories?: string[];
    season?: string;
    episode?: string;
    episodeType?: string;
  };
  enclosure?: {
    url?: string;
    length?: string;
    type?: string;
  };
  'podcast:chapters'?: {
    url?: string;
  };
  'podcast:transcript'?: {
    url?: string;
  };
  'media:content'?: {
    url?: string;
    type?: string;
  }[];
}

interface ExtendedOutput extends Parser.Output<ExtendedItem> {
  itunes?: {
    image?: string | { href?: string; url?: string };
    author?: string;
    owner?: {
      name?: string;
      email?: string;
    };
    categories?: Record<string, any>;
    explicit?: string;
    type?: string;
  };
  image?: {
    url?: string;
    link?: string;
  };
  'podcast:locked'?: boolean;
  'podcast:funding'?: {
    url?: string;
    value?: string;
  }[];
}

// Create a new parser instance with extended custom fields
const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'itunes.duration'],
      ['itunes:image', 'itunes.image', { keepArray: false }],
      ['itunes:summary', 'itunes.summary'],
      ['itunes:explicit', 'itunes.explicit'],
      ['itunes:author', 'itunes.author'],
      ['itunes:category', 'itunes.categories', { keepArray: true }],
      ['itunes:season', 'itunes.season'],
      ['itunes:episode', 'itunes.episode'],
      ['itunes:episodeType', 'itunes.episodeType'],
      ['podcast:chapters', 'podcast:chapters', { keepArray: false }],
      ['podcast:transcript', 'podcast:transcript', { keepArray: false }],
      ['media:content', 'media:content', { keepArray: true }],
    ],
    feed: [
      ['itunes:image', 'itunes.image', { keepArray: false }],
      ['itunes:author', 'itunes.author'],
      ['itunes:owner', 'itunes.owner'],
      ['itunes:category', 'itunes.categories', { keepArray: false }],
      ['itunes:explicit', 'itunes.explicit'],
      ['itunes:type', 'itunes.type'],
      ['podcast:locked', 'podcast:locked'],
      ['podcast:funding', 'podcast:funding', { keepArray: true }],
    ]
  }
});

/**
 * Parses duration from various formats to seconds
 * @param duration Duration string in various formats
 * @returns Duration in seconds
 */
export function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;
  
  // Clean the duration string
  const cleanDuration = duration.trim().replace(/^(PT)?/i, '');
  
  // Handle ISO 8601 format (e.g., PT1H30M15S)
  if (/^\d+[HMS]/.test(cleanDuration) || /^[HMS]/.test(cleanDuration)) {
    let seconds = 0;
    
    // Extract hours
    const hoursMatch = cleanDuration.match(/(\d+)H/);
    if (hoursMatch) {
      seconds += parseInt(hoursMatch[1], 10) * 3600;
    }
    
    // Extract minutes
    const minutesMatch = cleanDuration.match(/(\d+)M/);
    if (minutesMatch) {
      seconds += parseInt(minutesMatch[1], 10) * 60;
    }
    
    // Extract seconds
    const secondsMatch = cleanDuration.match(/(\d+)S/);
    if (secondsMatch) {
      seconds += parseInt(secondsMatch[1], 10);
    }
    
    return seconds;
  }
  
  // Handle HH:MM:SS format
  if (cleanDuration.includes(':')) {
    const parts = cleanDuration.split(':').map(part => parseInt(part, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  }
  
  // Handle simple seconds format or fallback
  return parseInt(cleanDuration, 10) || 0;
}

/**
 * Formats seconds to a human-readable duration string
 * @param seconds Duration in seconds
 * @returns Formatted duration string (HH:MM:SS)
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Extracts image URL from various formats
 * @param imageData Image data from RSS feed
 * @returns Image URL string
 */
function extractImageUrl(imageData: any): string {
  if (!imageData) return '';
  
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  if (typeof imageData === 'object') {
    // Try different properties that might contain the URL
    return imageData.url || imageData.href || 
           (imageData.$ && imageData.$.url) || 
           (imageData.$ && imageData.$.href) || '';
  }
  
  return '';
}

/**
 * Sanitizes HTML content to plain text
 * @param html HTML content
 * @returns Plain text
 */
export function sanitizeHtml(html?: string): string {
  if (!html) return '';
  
  try {
    // Use linkedom to parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (error) {
    // Fallback to basic regex replacement
    return html
      .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
      .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();
  }
}

/**
 * Extracts categories from iTunes category data
 * @param categoriesData Categories data from RSS feed
 * @returns Structured categories array
 */
function extractCategories(categoriesData: any): { main: string; sub: string[] }[] {
  const categories: { main: string; sub: string[] }[] = [];
  
  if (!categoriesData) {
    return [{ main: 'Podcasts', sub: [] }];
  }
  
  try {
    if (typeof categoriesData === 'object') {
      // Handle nested categories
      Object.keys(categoriesData).forEach(key => {
        const mainCategory = key;
        const subCategories: string[] = [];
        
        if (categoriesData[key] && typeof categoriesData[key] === 'object') {
          Object.keys(categoriesData[key]).forEach(subKey => {
            subCategories.push(subKey);
          });
        }
        
        categories.push({ main: mainCategory, sub: subCategories });
      });
    } else if (Array.isArray(categoriesData)) {
      // Handle array of categories
      categoriesData.forEach(category => {
        if (typeof category === 'string') {
          categories.push({ main: category, sub: [] });
        }
      });
    } else if (typeof categoriesData === 'string') {
      // Handle single category string
      categories.push({ main: categoriesData, sub: [] });
    }
  } catch (error) {
    console.error('Error extracting categories:', error);
  }
  
  return categories.length > 0 ? categories : [{ main: 'Podcasts', sub: [] }];
}

/**
 * Extracts audio URL from various possible locations in the feed item
 * @param item RSS feed item
 * @returns Audio URL string
 */
function extractAudioUrl(item: ExtendedItem): string {
  // Check enclosure first (most common)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('audio/')) {
    return item.enclosure.url;
  }
  
  // Check media:content
  if (item['media:content'] && Array.isArray(item['media:content'])) {
    const audioContent = item['media:content'].find(content => 
      content.type?.startsWith('audio/') && content.url
    );
    if (audioContent?.url) {
      return audioContent.url;
    }
  }
  
  // Fallback to enclosure even if type is not audio (some feeds don't specify type correctly)
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  
  // Last resort: check if the link might be an audio file
  if (item.link && /\.(mp3|m4a|wav|ogg)($|\?)/i.test(item.link)) {
    return item.link;
  }
  
  return '';
}

/**
 * Parses an RSS feed URL and extracts podcast and episode data
 * @param feedUrl URL of the RSS feed
 * @returns Object containing podcast metadata and episodes
 */
export async function parseFeed(feedUrl: string): Promise<{ podcast: Podcast, episodes: Episode[] }> {
  try {
    // Fetch and parse the feed
    const feed = await parser.parseURL(feedUrl) as ExtendedOutput;
    
    // Generate a unique ID for the podcast
    const podcastId = uuidv4();
    
    // Extract podcast metadata with fallbacks
    const podcastTitle = feed.title || feed.description?.split(' - ')[0] || 'Unknown Podcast';
    const podcastArtwork = extractImageUrl(feed.itunes?.image) || 
                           feed.image?.url || 
                           '/images/placeholder-podcast.png';
    
    const podcast: Podcast = {
      id: podcastId,
      title: podcastTitle,
      publisher: feed.itunes?.author || 
                feed.itunes?.owner?.name || 
                feed.creator || 
                feed.author || 
                'Unknown Publisher',
      artwork: podcastArtwork,
      description: feed.description || feed.itunes?.summary || '',
      categories: extractCategories(feed.itunes?.categories),
      website: feed.link || '',
      language: feed.language || 'en',
      explicit: feed.itunes?.explicit === 'yes' || feed.itunes?.explicit === 'true',
      episodeCount: feed.items?.length || 0,
      frequency: feed.itunes?.type || 'episodic',
      lastUpdated: feed.lastBuildDate || new Date().toISOString(),
      feedUrl
    };
    
    // Extract episode data with fallbacks
    const episodes: Episode[] = (feed.items || []).map((item, index) => {
      const extendedItem = item as ExtendedItem;
      
      // Get audio URL with fallbacks
      const audioUrl = extractAudioUrl(extendedItem);
      
      // Parse publish date
      const publishDate = item.pubDate || item.isoDate || '';
      
      // Parse duration
      const rawDuration = extendedItem.itunes?.duration || '';
      const durationSeconds = parseDurationToSeconds(rawDuration);
      const formattedDuration = formatDuration(durationSeconds);
      
      // Generate a unique ID or use GUID
      const guid = item.guid || `${podcastId}-episode-${index}`;
      const episodeId = uuidv4();
      
      // Extract season and episode numbers
      const season = extendedItem.itunes?.season ? parseInt(extendedItem.itunes.season, 10) : undefined;
      const episodeNumber = extendedItem.itunes?.episode ? parseInt(extendedItem.itunes.episode, 10) : undefined;
      
      // Determine episode type
      let type: 'full' | 'trailer' | 'bonus' = 'full';
      if (extendedItem.itunes?.episodeType) {
        if (extendedItem.itunes.episodeType === 'trailer') type = 'trailer';
        else if (extendedItem.itunes.episodeType === 'bonus') type = 'bonus';
      }
      
      // Extract chapters URL if available
      const chaptersUrl = extendedItem['podcast:chapters']?.url;
      
      // Extract transcript URL if available
      const transcriptUrl = extendedItem['podcast:transcript']?.url;
      
      return {
        id: episodeId,
        guid,
        title: item.title || `Episode ${index + 1}`,
        description: extendedItem.itunes?.summary || 
                     item.content || 
                     item.contentSnippet || 
                     '',
        publishDate,
        duration: formattedDuration,
        durationSeconds,
        podcastTitle: podcast.title,
        podcastId,
        artwork: extractImageUrl(extendedItem.itunes?.image) || podcast.artwork,
        audioUrl,
        isNew: new Date(publishDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // Within the last week
        isBookmarked: false,
        progress: 0,
        chaptersUrl,
        transcript_url: transcriptUrl,
        season,
        episode: episodeNumber,
        type,
        explicit: extendedItem.itunes?.explicit === 'yes' || extendedItem.itunes?.explicit === 'true'
      };
    })
    // Filter out episodes without audio URLs
    .filter(episode => episode.audioUrl);
    
    return { podcast, episodes };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a URL is a valid podcast RSS feed
 * @param url URL to validate
 * @returns Promise resolving to a boolean indicating if the URL is a valid podcast RSS feed
 */
export async function isValidPodcastFeed(url: string): Promise<boolean> {
  try {
    const feed = await parser.parseURL(url) as ExtendedOutput;
    
    // Check if it has basic podcast elements
    const hasItems = feed.items && feed.items.length > 0;
    const hasTitle = !!feed.title;
    
    // Check if at least one item has an audio enclosure
    const hasAudio = feed.items?.some(item => {
      const extendedItem = item as ExtendedItem;
      return !!extractAudioUrl(extendedItem);
    });
    
    return hasItems && hasTitle && hasAudio;
  } catch (error) {
    console.error('Error validating podcast feed:', error);
    return false;
  }
}

/**
 * Attempts to fix common issues with RSS feed URLs
 * @param url URL to fix
 * @returns Fixed URL
 */
export function fixFeedUrl(url: string): string {
  // Ensure URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Fix common URL issues
  return url
    .trim()
    .replace(/\s+/g, '')  // Remove whitespace
    .replace(/\/+$/, ''); // Remove trailing slashes
}

/**
 * Extracts the domain from a URL
 * @param url URL to extract domain from
 * @returns Domain name
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
}
