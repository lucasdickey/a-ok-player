import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import Parser from 'rss-parser';

// Initialize the RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:image', 'itunesImage'],
      ['itunes:summary', 'itunesSummary'],
      ['enclosure', 'enclosure']
    ] as any[],
    feed: [
      ['itunes:author', 'itunesAuthor'],
      ['itunes:image', 'itunesImage']
    ] as any[]
  }
});

// Type for RSS feed metadata
export interface RSSFeedMetadata {
  title: string;
  description?: string;
  imageUrl?: string;
  author?: string;
  link?: string;
}

// Type for saved RSS feed
export interface SavedRSSFeed {
  id: string;
  userId: string;
  feedUrl: string;
  title: string;
  description?: string;
  imageUrl?: string;
  author?: string;
  addedAt: string;
  lastFetched?: string;
}

// Type for RSS feed episode
export interface RSSFeedEpisode {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  pubDate: string;
  duration?: string;
  audioUrl: string;
  imageUrl?: string;
  link?: string;
}

// Function to fetch and parse RSS feed
export async function fetchRSSFeed(url: string): Promise<RSSFeedMetadata | null> {
  try {
    console.log('Fetching RSS feed from URL:', url);
    
    // Use a CORS proxy for client-side requests
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.contents) {
      throw new Error('No content returned from proxy');
    }
    
    // Parse the RSS feed using rss-parser
    const feed = await parser.parseString(data.contents);
    
    // Extract feed metadata
    const result: RSSFeedMetadata = {
      title: feed.title || 'Untitled Podcast',
      description: feed.description || '',
      link: feed.link || url
    };
    
    // Extract feed image
    if (feed.itunesImage && feed.itunesImage.href) {
      result.imageUrl = feed.itunesImage.href;
    } else if (feed.image && feed.image.url) {
      result.imageUrl = feed.image.url;
    }
    
    // Extract feed author
    if (feed.itunesAuthor) {
      result.author = feed.itunesAuthor;
    } else if (feed.creator) {
      result.author = feed.creator;
    } else if (feed.author) {
      result.author = feed.author;
    }
    
    console.log('Fetched RSS feed metadata:', result);
    return result;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return null;
  }
}

// Function to save RSS feed to user's library
export async function saveRSSFeed(userId: string, feedUrl: string, metadata: RSSFeedMetadata) {
  console.log('Saving RSS feed for user:', userId, 'URL:', feedUrl);
  
  if (!userId) {
    console.error('Cannot save feed: userId is null or empty');
    return { error: { message: 'User ID is required' } };
  }
  
  try {
    // Get existing feeds from localStorage
    let existingFeeds = [];
    const storedFeeds = localStorage.getItem('rssFeeds');
    
    if (storedFeeds) {
      try {
        existingFeeds = JSON.parse(storedFeeds);
      } catch (parseError) {
        console.error('Error parsing stored feeds:', parseError);
        existingFeeds = [];
      }
    }
    
    console.log('Existing feeds:', existingFeeds);
    
    // Check if feed already exists
    if (existingFeeds.some((feed: any) => feed.feedUrl === feedUrl && feed.userId === userId)) {
      console.log('Feed already exists in library');
      return { error: { message: 'This feed is already in your library' } };
    }
    
    // Add new feed
    const feedId = uuidv4();
    const newFeed = {
      id: feedId,
      userId,
      feedUrl,
      title: metadata.title || 'Untitled Podcast',
      description: metadata.description || '',
      imageUrl: metadata.imageUrl || '',
      author: metadata.author || '',
      addedAt: new Date().toISOString(),
      lastFetched: new Date().toISOString()
    };
    
    existingFeeds.push(newFeed);
    
    // Save to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(existingFeeds));
    console.log('Updated feeds in localStorage:', JSON.stringify(existingFeeds));
    
    // Fetch and index episodes
    fetchAndIndexEpisodes(feedId, feedUrl);
    
    return { data: newFeed, error: null };
  } catch (error) {
    console.error('Error saving RSS feed:', error);
    return { error: { message: 'Failed to save feed to library' } };
  }
}

// Function to get user's RSS feeds
export function getUserRSSFeeds(userId: string): SavedRSSFeed[] {
  console.log('Getting RSS feeds for user:', userId);
  
  if (!userId) {
    console.error('Cannot get feeds: userId is null or empty');
    return [];
  }
  
  try {
    // Get feeds from localStorage
    const storedFeeds = localStorage.getItem('rssFeeds');
    let feeds = [];
    
    if (storedFeeds) {
      try {
        feeds = JSON.parse(storedFeeds);
      } catch (parseError) {
        console.error('Error parsing stored feeds:', parseError);
        feeds = [];
      }
    }
    
    console.log('All feeds in localStorage:', feeds);
    
    // Filter feeds by userId
    const userFeeds = feeds.filter((feed: any) => feed.userId === userId);
    console.log('User feeds:', userFeeds);
    
    return userFeeds;
  } catch (error) {
    console.error('Error getting user RSS feeds:', error);
    return [];
  }
}

// Function to fetch and index episodes from an RSS feed
export async function fetchAndIndexEpisodes(feedId: string, feedUrl: string): Promise<RSSFeedEpisode[]> {
  try {
    console.log('Fetching episodes for feed:', feedId, 'URL:', feedUrl);
    
    // Use a CORS proxy for client-side requests
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.contents) {
      throw new Error('No content returned from proxy');
    }
    
    // Parse the RSS feed using rss-parser
    const feed = await parser.parseString(data.contents);
    
    // Extract episodes
    const episodes: RSSFeedEpisode[] = [];
    
    if (feed.items && feed.items.length > 0) {
      feed.items.forEach((item: any, index: number) => {
        // Only process items with enclosures (audio files)
        if (item.enclosure && item.enclosure.url) {
          // Extract episode image URL
          let imageUrl = '';
          if (item.itunesImage && item.itunesImage.href) {
            imageUrl = item.itunesImage.href;
          } else if (feed.itunesImage && feed.itunesImage.href) {
            // Use podcast image if episode doesn't have one
            imageUrl = feed.itunesImage.href;
          } else if (feed.image && feed.image.url) {
            imageUrl = feed.image.url;
          }
          
          // Create episode object
          episodes.push({
            id: uuidv4(),
            feedId,
            title: item.title || `Episode ${index + 1}`,
            description: item.itunesSummary || item.contentSnippet || item.content || '',
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            duration: item.duration || '',
            audioUrl: item.enclosure.url,
            imageUrl,
            link: item.link || ''
          });
        }
      });
    }
    
    // Save episodes to localStorage
    saveEpisodesToStorage(episodes);
    
    console.log(`Indexed ${episodes.length} episodes for feed ${feedId}`);
    return episodes;
  } catch (error) {
    console.error('Error fetching and indexing episodes:', error);
    return [];
  }
}

// Function to save episodes to localStorage
function saveEpisodesToStorage(episodes: RSSFeedEpisode[]): void {
  try {
    // Get existing episodes
    let existingEpisodes: RSSFeedEpisode[] = [];
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    
    if (storedEpisodes) {
      try {
        existingEpisodes = JSON.parse(storedEpisodes);
      } catch (parseError) {
        console.error('Error parsing stored episodes:', parseError);
        existingEpisodes = [];
      }
    }
    
    // Get feed ID of the new episodes
    const feedId = episodes.length > 0 ? episodes[0].feedId : null;
    
    if (feedId) {
      // Remove existing episodes for this feed
      existingEpisodes = existingEpisodes.filter(episode => episode.feedId !== feedId);
    }
    
    // Add new episodes
    const updatedEpisodes = [...existingEpisodes, ...episodes];
    
    // Save to localStorage
    localStorage.setItem('rssEpisodes', JSON.stringify(updatedEpisodes));
    console.log(`Saved ${episodes.length} episodes to localStorage`);
  } catch (error) {
    console.error('Error saving episodes to localStorage:', error);
  }
}

// Function to get episodes for a specific feed
export function getFeedEpisodes(feedId: string): RSSFeedEpisode[] {
  try {
    // Get episodes from localStorage
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    let episodes: RSSFeedEpisode[] = [];
    
    if (storedEpisodes) {
      try {
        episodes = JSON.parse(storedEpisodes);
      } catch (parseError) {
        console.error('Error parsing stored episodes:', parseError);
        episodes = [];
      }
    }
    
    // Filter episodes by feedId
    const feedEpisodes = episodes.filter(episode => episode.feedId === feedId);
    
    // Sort by publication date (newest first)
    feedEpisodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return feedEpisodes;
  } catch (error) {
    console.error('Error getting feed episodes:', error);
    return [];
  }
}

// Function to get recent episodes from all feeds
export function getRecentEpisodes(userId: string, daysAgo: number = 7): RSSFeedEpisode[] {
  try {
    // Get user's feeds
    const userFeeds = getUserRSSFeeds(userId);
    const feedIds = userFeeds.map(feed => feed.id);
    
    // Get episodes from localStorage
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    let episodes: RSSFeedEpisode[] = [];
    
    if (storedEpisodes) {
      try {
        episodes = JSON.parse(storedEpisodes);
      } catch (parseError) {
        console.error('Error parsing stored episodes:', parseError);
        episodes = [];
      }
    }
    
    // Filter episodes by feedId and publication date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    const recentEpisodes = episodes.filter(episode => 
      feedIds.includes(episode.feedId) && 
      new Date(episode.pubDate) >= cutoffDate
    );
    
    // Sort by publication date (newest first)
    recentEpisodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return recentEpisodes;
  } catch (error) {
    console.error('Error getting recent episodes:', error);
    return [];
  }
}

// Function to refresh all feeds for a user
export async function refreshUserFeeds(userId: string): Promise<void> {
  try {
    // Get user's feeds
    const userFeeds = getUserRSSFeeds(userId);
    
    // Refresh each feed
    for (const feed of userFeeds) {
      await fetchAndIndexEpisodes(feed.id, feed.feedUrl);
      
      // Update lastFetched timestamp
      updateFeedLastFetched(feed.id);
    }
    
    console.log(`Refreshed ${userFeeds.length} feeds for user ${userId}`);
  } catch (error) {
    console.error('Error refreshing user feeds:', error);
  }
}

// Function to update lastFetched timestamp for a feed
function updateFeedLastFetched(feedId: string): void {
  try {
    // Get existing feeds
    const storedFeeds = localStorage.getItem('rssFeeds');
    if (!storedFeeds) return;
    
    let feeds: SavedRSSFeed[] = [];
    try {
      feeds = JSON.parse(storedFeeds);
    } catch (parseError) {
      console.error('Error parsing stored feeds:', parseError);
      return;
    }
    
    // Find and update the feed
    const updatedFeeds = feeds.map(feed => {
      if (feed.id === feedId) {
        return {
          ...feed,
          lastFetched: new Date().toISOString()
        };
      }
      return feed;
    });
    
    // Save back to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(updatedFeeds));
  } catch (error) {
    console.error('Error updating feed lastFetched:', error);
  }
}
