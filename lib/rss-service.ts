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
  status?: string; // 'active', 'error', 'pending'
  errorMessage?: string;
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

// Debug logger function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[RSS-DEBUG ${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Function to fetch and parse RSS feed with multiple proxy fallbacks
export async function fetchRSSFeed(url: string): Promise<RSSFeedMetadata | null> {
  logDebug(`Fetching RSS feed from URL: ${url}`);
  
  // List of CORS proxies to try in order
  const corsProxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`
  ];
  
  // Try each proxy in sequence
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      const proxyUrl = corsProxies[i](url);
      logDebug(`Using proxy #${i+1}: ${proxyUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        logDebug('Starting fetch request');
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        logDebug(`Fetch response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          logDebug(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }
        
        // Handle different proxy response formats
        let feedContent = '';
        
        if (i === 0) { // allorigins
          logDebug('Parsing proxy response as JSON to extract RSS content');
          const data = await response.json();
          logDebug('Received data from proxy', { hasContents: !!data?.contents });
          
          if (!data || !data.contents) {
            logDebug('No content returned from proxy', data);
            throw new Error('No content returned from proxy');
          }
          
          feedContent = data.contents;
        } else if (i === 1) { // corsproxy.io
          feedContent = await response.text();
        } else { // cors-anywhere
          feedContent = await response.text();
        }
        
        // Try to parse the feed
        logDebug('Attempting to parse RSS XML content...');
        const feed = await parser.parseString(feedContent);
        logDebug('Successfully parsed RSS feed', { 
          title: feed.title, 
          itemCount: feed.items?.length 
        });
        
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
        
        logDebug('Fetched RSS feed metadata', result);
        return result;
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          logDebug('Fetch request timed out after 15 seconds');
          throw new Error('Request timed out. Please try again.');
        }
        logDebug(`Fetch error with proxy #${i+1}: ${fetchError.message || fetchError}`);
        
        // If this is the last proxy, throw the error
        if (i === corsProxies.length - 1) {
          throw fetchError;
        }
        // Otherwise, continue to the next proxy
        logDebug(`Trying next proxy...`);
      }
    } catch (proxyError: any) {
      // If this is the last proxy, throw the error
      if (i === corsProxies.length - 1) {
        logDebug(`All proxies failed. Last error: ${proxyError.message || proxyError}`);
        return null;
      }
    }
  }
  
  // This should never be reached, but TypeScript requires a return statement
  return null;
}

// Function to save RSS feed URL to user's library (without requiring successful fetch)
export async function saveRSSFeedUrl(userId: string, feedUrl: string): Promise<{ data: SavedRSSFeed | null, error: any }> {
  logDebug(`Saving RSS feed URL for user: ${userId}, URL: ${feedUrl}`);
  
  if (!userId) {
    logDebug('Cannot save feed: userId is null or empty');
    return { data: null, error: { message: 'User ID is required' } };
  }
  
  try {
    // Get existing feeds from localStorage
    let existingFeeds = [];
    const storedFeeds = localStorage.getItem('rssFeeds');
    
    if (storedFeeds) {
      try {
        existingFeeds = JSON.parse(storedFeeds);
        logDebug(`Found ${existingFeeds.length} existing feeds in localStorage`);
      } catch (parseError) {
        logDebug(`Error parsing stored feeds: ${parseError}`);
        existingFeeds = [];
      }
    }
    
    // Check if feed already exists
    const existingFeed = existingFeeds.find((feed: any) => feed.feedUrl === feedUrl && feed.userId === userId);
    if (existingFeed) {
      logDebug('Feed already exists in library');
      return { data: existingFeed, error: { message: 'This feed is already in your library' } };
    }
    
    // Add new feed with minimal data
    const feedId = uuidv4();
    const newFeed: SavedRSSFeed = {
      id: feedId,
      userId,
      feedUrl,
      title: 'Loading Podcast...',
      description: '',
      imageUrl: '',
      author: '',
      addedAt: new Date().toISOString(),
      lastFetched: new Date().toISOString(),
      status: 'pending'
    };
    
    existingFeeds.push(newFeed);
    
    // Save to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(existingFeeds));
    logDebug('Saved feed URL to localStorage', newFeed);
    
    // Immediately start fetching episodes in the background
    setTimeout(() => {
      fetchAndIndexEpisodes(feedId, feedUrl)
        .then(episodes => {
          logDebug(`Successfully fetched ${episodes.length} episodes for feed ${feedId}`);
        })
        .catch(error => {
          logDebug(`Error fetching episodes for feed ${feedId}: ${error.message || error}`);
        });
    }, 100);
    
    return { data: newFeed, error: null };
  } catch (error: any) {
    logDebug(`Error saving RSS feed URL: ${error.message || error}`);
    return { data: null, error: { message: error.message || 'Error saving feed URL' } };
  }
}

// Function to update RSS feed metadata after fetching
export async function updateRSSFeedMetadata(feedId: string, metadata: RSSFeedMetadata | null, error?: string): Promise<boolean> {
  logDebug(`Updating RSS feed metadata for feed ID: ${feedId}`);
  
  try {
    // Get existing feeds from localStorage
    const storedFeeds = localStorage.getItem('rssFeeds');
    if (!storedFeeds) {
      logDebug('No stored feeds found in localStorage');
      return false;
    }
    
    let feeds: SavedRSSFeed[] = [];
    try {
      feeds = JSON.parse(storedFeeds);
    } catch (parseError) {
      logDebug(`Error parsing stored feeds: ${parseError}`);
      return false;
    }
    
    // Find the feed to update
    const feedIndex = feeds.findIndex(feed => feed.id === feedId);
    if (feedIndex === -1) {
      logDebug(`Feed with ID ${feedId} not found`);
      return false;
    }
    
    // Update the feed
    if (metadata) {
      logDebug('Updating feed with fetched metadata', metadata);
      feeds[feedIndex] = {
        ...feeds[feedIndex],
        title: metadata.title || feeds[feedIndex].title,
        description: metadata.description || feeds[feedIndex].description,
        imageUrl: metadata.imageUrl || feeds[feedIndex].imageUrl,
        author: metadata.author || feeds[feedIndex].author,
        lastFetched: new Date().toISOString(),
        status: 'active',
        errorMessage: undefined
      };
    } else if (error) {
      logDebug(`Marking feed as error with message: ${error}`);
      feeds[feedIndex] = {
        ...feeds[feedIndex],
        lastFetched: new Date().toISOString(),
        status: 'error',
        errorMessage: error
      };
    }
    
    // Save back to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(feeds));
    logDebug('Updated feed metadata in localStorage');
    
    return true;
  } catch (error: any) {
    logDebug(`Error updating RSS feed metadata: ${error.message || error}`);
    return false;
  }
}

// Function to save RSS feed to user's library and fetch metadata
export async function saveRSSFeed(userId: string, feedUrl: string, metadata?: RSSFeedMetadata) {
  logDebug(`Saving RSS feed for user: ${userId}, URL: ${feedUrl}`);
  
  if (!userId) {
    logDebug('Cannot save feed: userId is null or empty');
    return { error: { message: 'User ID is required' } };
  }
  
  try {
    // Get existing feeds from localStorage
    let existingFeeds = [];
    const storedFeeds = localStorage.getItem('rssFeeds');
    
    if (storedFeeds) {
      try {
        existingFeeds = JSON.parse(storedFeeds);
        logDebug(`Found ${existingFeeds.length} existing feeds in localStorage`);
      } catch (parseError) {
        logDebug(`Error parsing stored feeds: ${parseError}`);
        existingFeeds = [];
      }
    }
    
    // Check if feed already exists
    if (existingFeeds.some((feed: any) => feed.feedUrl === feedUrl && feed.userId === userId)) {
      logDebug('Feed already exists in library');
      return { error: { message: 'This feed is already in your library' } };
    }
    
    // Add new feed
    const feedId = uuidv4();
    const newFeed: SavedRSSFeed = {
      id: feedId,
      userId,
      feedUrl,
      title: metadata?.title || 'Untitled Podcast',
      description: metadata?.description || '',
      imageUrl: metadata?.imageUrl || '',
      author: metadata?.author || '',
      addedAt: new Date().toISOString(),
      lastFetched: new Date().toISOString(),
      status: 'active'
    };
    
    existingFeeds.push(newFeed);
    
    // Save to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(existingFeeds));
    logDebug('Saved feed to localStorage', newFeed);
    
    // Fetch and index episodes in the background
    setTimeout(() => {
      fetchAndIndexEpisodes(feedId, feedUrl)
        .then(episodes => {
          logDebug(`Successfully fetched ${episodes.length} episodes for feed ${feedId}`);
        })
        .catch(error => {
          logDebug(`Error fetching episodes for feed ${feedId}: ${error.message || error}`);
        });
    }, 100);
    
    return { data: newFeed, error: null };
  } catch (error: any) {
    logDebug(`Error saving RSS feed: ${error.message || error}`);
    return { error: { message: error.message || 'Error saving feed' } };
  }
}

// Function to get user's RSS feeds
export function getUserRSSFeeds(userId: string): SavedRSSFeed[] {
  logDebug(`Getting RSS feeds for user: ${userId}`);
  
  if (!userId) {
    logDebug('Cannot get feeds: userId is null or empty');
    return [];
  }
  
  try {
    // Get feeds from localStorage
    const storedFeeds = localStorage.getItem('rssFeeds');
    if (!storedFeeds) {
      logDebug('No stored feeds found in localStorage');
      return [];
    }
    
    let feeds: SavedRSSFeed[] = [];
    try {
      feeds = JSON.parse(storedFeeds);
    } catch (parseError) {
      logDebug(`Error parsing stored feeds: ${parseError}`);
      return [];
    }
    
    // Filter feeds by userId
    const userFeeds = feeds.filter(feed => feed.userId === userId);
    logDebug(`Found ${userFeeds.length} feeds for user ${userId}`);
    
    return userFeeds;
  } catch (error: any) {
    logDebug(`Error getting user RSS feeds: ${error.message || error}`);
    return [];
  }
}

// Function to fetch and index episodes from an RSS feed
export async function fetchAndIndexEpisodes(feedId: string, feedUrl: string): Promise<RSSFeedEpisode[]> {
  logDebug(`Fetching and indexing episodes for feed ID: ${feedId}, URL: ${feedUrl}`);
  
  // List of CORS proxies to try in order
  const corsProxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`
  ];
  
  // Try each proxy in sequence
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      const proxyUrl = corsProxies[i](feedUrl);
      logDebug(`Using proxy #${i+1} for episodes: ${proxyUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        logDebug('Starting fetch request for episodes');
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        logDebug(`Fetch response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          logDebug(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }
        
        // Handle different proxy response formats
        let feedContent = '';
        
        if (i === 0) { // allorigins
          logDebug('Parsing proxy response as JSON to extract RSS content');
          const data = await response.json();
          
          if (!data || !data.contents) {
            logDebug('No content returned from proxy', data);
            throw new Error('No content returned from proxy');
          }
          
          feedContent = data.contents;
        } else if (i === 1) { // corsproxy.io
          feedContent = await response.text();
        } else { // cors-anywhere
          feedContent = await response.text();
        }
        
        // Try to parse the feed
        logDebug('Attempting to parse RSS XML content for episodes...');
        const feed = await parser.parseString(feedContent);
        logDebug('Successfully parsed RSS feed', { 
          title: feed.title, 
          itemCount: feed.items?.length 
        });
        
        // Extract feed metadata and update it
        const metadata: RSSFeedMetadata = {
          title: feed.title || 'Untitled Podcast',
          description: feed.description || '',
          link: feed.link || feedUrl
        };
        
        // Extract feed image
        if (feed.itunesImage && feed.itunesImage.href) {
          metadata.imageUrl = feed.itunesImage.href;
        } else if (feed.image && feed.image.url) {
          metadata.imageUrl = feed.image.url;
        }
        
        // Extract feed author
        if (feed.itunesAuthor) {
          metadata.author = feed.itunesAuthor;
        } else if (feed.creator) {
          metadata.author = feed.creator;
        } else if (feed.author) {
          metadata.author = feed.author;
        }
        
        // Update the feed metadata
        await updateRSSFeedMetadata(feedId, metadata);
        
        if (!feed.items || feed.items.length === 0) {
          logDebug('No episodes found in feed');
          return [];
        }
        
        // Process episodes
        const episodes: RSSFeedEpisode[] = feed.items.map((item: any) => {
          // Extract audio URL from enclosure
          let audioUrl = '';
          if (item.enclosure && item.enclosure.url) {
            audioUrl = item.enclosure.url;
          }
          
          // Extract image URL
          let imageUrl = metadata.imageUrl || '';
          if (item.itunesImage && item.itunesImage.href) {
            imageUrl = item.itunesImage.href;
          }
          
          return {
            id: uuidv4(),
            feedId,
            title: item.title || 'Untitled Episode',
            description: item.content || item.itunesSummary || item.contentSnippet || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            duration: item.duration || '',
            audioUrl,
            imageUrl,
            link: item.link || ''
          };
        }).filter((episode: RSSFeedEpisode) => episode.audioUrl); // Only include episodes with audio URLs
        
        logDebug(`Processed ${episodes.length} episodes with audio URLs`);
        
        // Save episodes to localStorage
        saveEpisodesToStorage(episodes);
        
        // Update the feed's lastFetched timestamp
        updateFeedLastFetched(feedId);
        
        return episodes;
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          logDebug('Fetch request for episodes timed out after 15 seconds');
          
          // If this is the last proxy, update metadata with error
          if (i === corsProxies.length - 1) {
            updateRSSFeedMetadata(feedId, null, 'Request timed out. Please try again.');
          }
          
          throw new Error('Request timed out. Please try again.');
        }
        
        logDebug(`Fetch error for episodes with proxy #${i+1}: ${fetchError.message || fetchError}`);
        
        // If this is the last proxy, update metadata with error and throw
        if (i === corsProxies.length - 1) {
          updateRSSFeedMetadata(feedId, null, fetchError.message || 'Error fetching feed');
          throw fetchError;
        }
        
        // Otherwise, continue to the next proxy
        logDebug(`Trying next proxy for episodes...`);
      }
    } catch (proxyError: any) {
      // If this is the last proxy, update metadata with error and return empty array
      if (i === corsProxies.length - 1) {
        logDebug(`All proxies failed for episodes. Last error: ${proxyError.message || proxyError}`);
        updateRSSFeedMetadata(feedId, null, proxyError.message || 'Error fetching episodes');
        return [];
      }
    }
  }
  
  // This should never be reached, but TypeScript requires a return statement
  return [];
}

// Function to save episodes to localStorage
export function saveEpisodesToStorage(episodes: RSSFeedEpisode[]): void {
  if (!episodes || episodes.length === 0) {
    logDebug('No episodes to save');
    return;
  }
  
  logDebug(`Saving ${episodes.length} episodes to localStorage`);
  
  try {
    // Get existing episodes from localStorage
    let existingEpisodes: RSSFeedEpisode[] = [];
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    
    if (storedEpisodes) {
      try {
        existingEpisodes = JSON.parse(storedEpisodes);
        logDebug(`Found ${existingEpisodes.length} existing episodes in localStorage`);
      } catch (parseError) {
        logDebug(`Error parsing stored episodes: ${parseError}`);
        existingEpisodes = [];
      }
    }
    
    // Get the feed ID from the first episode
    const feedId = episodes[0].feedId;
    
    // Remove existing episodes for this feed
    existingEpisodes = existingEpisodes.filter(episode => episode.feedId !== feedId);
    logDebug(`Removed existing episodes for feed ${feedId}`);
    
    // Add new episodes
    const allEpisodes = [...existingEpisodes, ...episodes];
    
    // Save to localStorage
    localStorage.setItem('rssEpisodes', JSON.stringify(allEpisodes));
    logDebug(`Saved ${episodes.length} episodes to localStorage. Total episodes: ${allEpisodes.length}`);
  } catch (error: any) {
    logDebug(`Error saving episodes to localStorage: ${error.message || error}`);
  }
}

// Function to get episodes for a specific feed
export function getFeedEpisodes(feedId: string): RSSFeedEpisode[] {
  logDebug(`Getting episodes for feed ID: ${feedId}`);
  
  try {
    // Get episodes from localStorage
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    if (!storedEpisodes) {
      logDebug('No stored episodes found in localStorage');
      return [];
    }
    
    let episodes: RSSFeedEpisode[] = [];
    try {
      episodes = JSON.parse(storedEpisodes);
    } catch (parseError) {
      logDebug(`Error parsing stored episodes: ${parseError}`);
      return [];
    }
    
    // Filter episodes by feedId
    const feedEpisodes = episodes.filter(episode => episode.feedId === feedId);
    
    // Sort by publication date (newest first)
    feedEpisodes.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });
    
    logDebug(`Found ${feedEpisodes.length} episodes for feed ${feedId}`);
    
    return feedEpisodes;
  } catch (error: any) {
    logDebug(`Error getting feed episodes: ${error.message || error}`);
    return [];
  }
}

// Function to get recent episodes from all feeds
export function getRecentEpisodes(userId: string, daysAgo: number = 7): RSSFeedEpisode[] {
  logDebug(`Getting recent episodes for user: ${userId}, days ago: ${daysAgo}`);
  
  if (!userId) {
    logDebug('Cannot get recent episodes: userId is null or empty');
    return [];
  }
  
  try {
    // Get user's feeds
    const userFeeds = getUserRSSFeeds(userId);
    if (userFeeds.length === 0) {
      logDebug('No feeds found for user');
      return [];
    }
    
    // Get feed IDs
    const feedIds = userFeeds.map(feed => feed.id);
    
    // Get episodes from localStorage
    const storedEpisodes = localStorage.getItem('rssEpisodes');
    if (!storedEpisodes) {
      logDebug('No stored episodes found in localStorage');
      return [];
    }
    
    let episodes: RSSFeedEpisode[] = [];
    try {
      episodes = JSON.parse(storedEpisodes);
    } catch (parseError) {
      logDebug(`Error parsing stored episodes: ${parseError}`);
      return [];
    }
    
    // Filter episodes by feedIds and date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    const cutoffTime = cutoffDate.getTime();
    
    const recentEpisodes = episodes.filter(episode => {
      // Check if episode belongs to user's feeds
      if (!feedIds.includes(episode.feedId)) {
        return false;
      }
      
      // Check if episode is recent
      const episodeDate = new Date(episode.pubDate).getTime();
      return episodeDate >= cutoffTime;
    });
    
    // Sort by publication date (newest first)
    recentEpisodes.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });
    
    logDebug(`Found ${recentEpisodes.length} recent episodes for user ${userId}`);
    
    return recentEpisodes;
  } catch (error: any) {
    logDebug(`Error getting recent episodes: ${error.message || error}`);
    return [];
  }
}

// Function to refresh all feeds for a user
export async function refreshUserFeeds(userId: string): Promise<void> {
  logDebug(`Refreshing all feeds for user: ${userId}`);
  
  if (!userId) {
    logDebug('Cannot refresh feeds: userId is null or empty');
    return;
  }
  
  try {
    // Get user's feeds
    const userFeeds = getUserRSSFeeds(userId);
    if (userFeeds.length === 0) {
      logDebug('No feeds found for user');
      return;
    }
    
    logDebug(`Found ${userFeeds.length} feeds to refresh`);
    
    // Refresh each feed
    const refreshPromises = userFeeds.map(feed => {
      return fetchAndIndexEpisodes(feed.id, feed.feedUrl)
        .then(episodes => {
          logDebug(`Successfully refreshed feed ${feed.id} with ${episodes.length} episodes`);
        })
        .catch(error => {
          logDebug(`Error refreshing feed ${feed.id}: ${error.message || error}`);
        });
    });
    
    await Promise.all(refreshPromises);
    
    logDebug('All feeds refreshed successfully');
  } catch (error: any) {
    logDebug(`Error refreshing user feeds: ${error.message || error}`);
  }
}

// Function to update lastFetched timestamp for a feed
export function updateFeedLastFetched(feedId: string): void {
  logDebug(`Updating lastFetched timestamp for feed ID: ${feedId}`);
  
  try {
    // Get existing feeds from localStorage
    const storedFeeds = localStorage.getItem('rssFeeds');
    if (!storedFeeds) {
      logDebug('No stored feeds found in localStorage');
      return;
    }
    
    let feeds: SavedRSSFeed[] = [];
    try {
      feeds = JSON.parse(storedFeeds);
    } catch (parseError) {
      logDebug(`Error parsing stored feeds: ${parseError}`);
      return;
    }
    
    // Find the feed to update
    const feedIndex = feeds.findIndex(feed => feed.id === feedId);
    if (feedIndex === -1) {
      logDebug(`Feed with ID ${feedId} not found`);
      return;
    }
    
    // Update the lastFetched timestamp
    feeds[feedIndex] = {
      ...feeds[feedIndex],
      lastFetched: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('rssFeeds', JSON.stringify(feeds));
    logDebug('Updated feed lastFetched timestamp in localStorage');
  } catch (error: any) {
    logDebug(`Error updating feed lastFetched timestamp: ${error.message || error}`);
  }
}
