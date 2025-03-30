import { parseFeed, isValidPodcastFeed, fixFeedUrl, sanitizeHtml, parseDurationToSeconds, formatDuration } from './enhanced-rss-parser';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './supabase-types';

// Type definitions
export type PodcastFeed = Database['public']['Tables']['podcast_subscriptions']['Row'];
export type Episode = Database['public']['Tables']['episodes']['Row'];
export type PodcastEpisode = Episode & {
  podcast_subscriptions?: PodcastFeed;
};

// Feed validation result interface
export interface FeedValidationResult {
  isValid: boolean;
  message: string;
  metadata?: {
    title: string;
    description?: string;
    author?: string;
    imageUrl?: string;
    websiteUrl?: string;
    language?: string;
    explicit?: boolean;
    categories?: string[];
  };
}

// Feed processing result interface
export interface FeedProcessingResult {
  success: boolean;
  message: string;
  feedId?: string;
  error?: any;
  episodeCount?: number;
  newEpisodeCount?: number;
}

/**
 * Validates an RSS feed URL by attempting to parse it
 * @param feedUrl The URL of the RSS feed to validate
 * @returns Validation result with metadata if successful
 */
export async function validateFeed(feedUrl: string): Promise<FeedValidationResult> {
  try {
    // Fix common URL issues
    const fixedUrl = fixFeedUrl(feedUrl);
    
    // Check if it's a valid podcast feed
    const isValid = await isValidPodcastFeed(fixedUrl);
    
    if (!isValid) {
      return {
        isValid: false,
        message: 'The URL does not appear to be a valid podcast RSS feed'
      };
    }
    
    // Try to parse the feed to get metadata
    const { podcast } = await parseFeed(fixedUrl);
    
    // Extract main category
    const mainCategory = podcast.categories[0]?.main || '';
    const subCategories = podcast.categories.flatMap(cat => cat.sub);
    const allCategories = [mainCategory, ...subCategories].filter(Boolean);
    
    return {
      isValid: true,
      message: 'Feed validated successfully',
      metadata: {
        title: podcast.title,
        description: sanitizeHtml(podcast.description),
        author: podcast.publisher,
        imageUrl: podcast.artwork,
        websiteUrl: podcast.website,
        language: podcast.language,
        explicit: podcast.explicit,
        categories: allCategories
      }
    };
  } catch (error) {
    console.error('Error validating RSS feed:', error);
    return {
      isValid: false,
      message: error instanceof Error 
        ? `Failed to validate RSS feed: ${error.message}` 
        : 'Failed to validate RSS feed'
    };
  }
}

/**
 * Adds a podcast feed to the user's subscriptions
 * @param userId The user's ID
 * @param feedUrl The URL of the RSS feed
 * @param metadata Optional metadata about the feed
 * @returns Processing result with feed ID if successful
 */
export async function addFeed(
  userId: string, 
  feedUrl: string,
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    imageUrl?: string;
    websiteUrl?: string;
    language?: string;
    explicit?: boolean;
    categories?: string[];
  }
): Promise<FeedProcessingResult> {
  try {
    // Fix common URL issues
    const fixedUrl = fixFeedUrl(feedUrl);
    
    // First check if the feed already exists for this user
    const { data: existingFeed } = await supabase
      .from('podcast_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('feed_url', fixedUrl)
      .single();
    
    if (existingFeed) {
      return {
        success: false,
        message: 'You are already subscribed to this podcast',
        feedId: existingFeed.id
      };
    }
    
    // If no metadata was provided, try to fetch it
    let feedMetadata = metadata;
    if (!feedMetadata) {
      const validationResult = await validateFeed(fixedUrl);
      if (validationResult.isValid && validationResult.metadata) {
        feedMetadata = validationResult.metadata;
      } else {
        return {
          success: false,
          message: validationResult.message,
          error: new Error(validationResult.message)
        };
      }
    }
    
    // Insert the feed into the database
    const feedId = uuidv4();
    const { data, error } = await supabase
      .from('podcast_subscriptions')
      .insert({
        id: feedId,
        user_id: userId,
        feed_url: fixedUrl,
        title: feedMetadata.title || 'Unknown Podcast',
        description: feedMetadata.description || '',
        author: feedMetadata.author || '',
        image_url: feedMetadata.imageUrl || '',
        website_url: feedMetadata.websiteUrl || '',
        language: feedMetadata.language || 'en',
        explicit: feedMetadata.explicit || false,
        categories: feedMetadata.categories || [],
        last_checked_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding podcast feed:', error);
      return {
        success: false,
        message: 'Failed to add podcast feed to database',
        error
      };
    }
    
    // Fetch and store episodes
    const processingResult = await fetchAndStoreEpisodes(feedId, fixedUrl);
    
    return {
      success: true,
      message: `Podcast added successfully with ${processingResult.episodeCount || 0} episodes`,
      feedId,
      episodeCount: processingResult.episodeCount,
      newEpisodeCount: processingResult.newEpisodeCount
    };
  } catch (error) {
    console.error('Error in addFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while adding the feed',
      error
    };
  }
}

/**
 * Fetches and stores episodes from an RSS feed
 * @param feedId The ID of the feed in the database
 * @param feedUrl The URL of the RSS feed
 * @returns Processing result with episode counts
 */
export async function fetchAndStoreEpisodes(feedId: string, feedUrl: string): Promise<FeedProcessingResult> {
  try {
    // Parse the feed to get episodes
    const { episodes } = await parseFeed(feedUrl);
    
    if (!episodes || episodes.length === 0) {
      return {
        success: true,
        message: 'No episodes found in feed',
        episodeCount: 0,
        newEpisodeCount: 0
      };
    }
    
    // Prepare episodes for insertion
    const episodesToInsert = episodes.map(episode => ({
      id: uuidv4(),
      feed_id: feedId,
      guid: episode.guid,
      title: episode.title,
      description: sanitizeHtml(episode.description),
      published_date: episode.publishDate,
      duration: episode.durationSeconds,
      duration_formatted: episode.duration,
      audio_url: episode.audioUrl,
      image_url: episode.artwork,
      chapters_url: episode.chaptersUrl || null,
      transcript_url: episode.transcript || null,
      season: episode.season || null,
      episode_number: episode.episode || null,
      type: episode.type || 'full',
      explicit: episode.explicit || false,
      is_played: false,
      created_at: new Date().toISOString()
    }));
    
    // Insert episodes in batches to avoid hitting limits
    const batchSize = 50;
    let newEpisodeCount = 0;
    
    for (let i = 0; i < episodesToInsert.length; i += batchSize) {
      const batch = episodesToInsert.slice(i, i + batchSize);
      
      // Check for existing episodes to avoid duplicates
      const guids = batch.map(e => e.guid);
      const { data: existingEpisodes } = await supabase
        .from('episodes')
        .select('guid')
        .eq('feed_id', feedId)
        .in('guid', guids);
      
      const existingGuids = new Set(existingEpisodes?.map(e => e.guid) || []);
      
      // Filter out episodes that already exist
      const newEpisodes = batch.filter(e => !existingGuids.has(e.guid));
      newEpisodeCount += newEpisodes.length;
      
      if (newEpisodes.length > 0) {
        const { error } = await supabase
          .from('episodes')
          .insert(newEpisodes);
        
        if (error) {
          console.error('Error inserting episodes:', error);
          return {
            success: false,
            message: 'Error inserting episodes',
            error,
            episodeCount: episodes.length,
            newEpisodeCount
          };
        }
      }
    }
    
    // Update the last_checked_at timestamp for the feed
    await supabase
      .from('podcast_subscriptions')
      .update({ 
        last_checked_at: new Date().toISOString(),
        episode_count: episodes.length
      })
      .eq('id', feedId);
    
    return {
      success: true,
      message: `Successfully processed ${episodes.length} episodes (${newEpisodeCount} new)`,
      episodeCount: episodes.length,
      newEpisodeCount
    };
  } catch (error) {
    console.error('Error in fetchAndStoreEpisodes:', error);
    return {
      success: false,
      message: 'Failed to fetch and store episodes',
      error
    };
  }
}

/**
 * Gets all podcast feeds for a user
 * @param userId The user's ID
 * @returns Array of podcast feeds
 */
export async function getUserFeeds(userId: string) {
  console.log('Fetching feeds for user:', userId);
  
  if (!userId) {
    console.error('No userId provided to getUserFeeds');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('title');
    
    if (error) {
      console.error('Error fetching user feeds:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return []; // Return empty array instead of throwing
    }
    
    console.log(`Successfully fetched ${data?.length || 0} feeds for user`);
    return data || [];
  } catch (error) {
    console.error('Error in getUserFeeds:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    return []; // Return empty array instead of throwing
  }
}

/**
 * Gets episodes for a specific podcast feed
 * @param feedId The ID of the feed
 * @param limit Optional limit on the number of episodes to return
 * @param offset Optional offset for pagination
 * @returns Array of episodes
 */
export async function getFeedEpisodes(feedId: string, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('feed_id', feedId)
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching feed episodes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFeedEpisodes:', error);
    throw error;
  }
}

/**
 * Gets recent episodes from all of a user's podcast feeds
 * @param userId The user's ID
 * @param days Number of days to look back
 * @param limit Optional limit on the number of episodes to return
 * @returns Array of episodes with feed information
 */
export async function getRecentEpisodes(userId: string, days = 7, limit = 50) {
  console.log('Fetching recent episodes for user:', userId);
  
  if (!userId) {
    console.error('No userId provided to getRecentEpisodes');
    return [];
  }
  
  try {
    // Calculate the date to look back to
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - days);
    
    console.log(`Looking back to ${lookbackDate.toISOString()}`);
    
    // First get the user's feeds
    const { data: feeds, error: feedsError } = await supabase
      .from('podcast_subscriptions')
      .select('id')
      .eq('user_id', userId);
    
    if (feedsError) {
      console.error('Error fetching user feeds for episodes:', feedsError);
      return [];
    }
    
    if (!feeds || feeds.length === 0) {
      console.log('User has no podcast feeds');
      return [];
    }
    
    // Get feed IDs
    const feedIds = feeds.map(feed => feed.id);
    console.log(`Found ${feedIds.length} feeds for user`);
    
    // Then get episodes for those feeds
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .in('feed_id', feedIds)
      .gt('published_date', lookbackDate.toISOString())
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
      return [];
    }
    
    if (!episodes || episodes.length === 0) {
      console.log('No recent episodes found');
      return [];
    }
    
    console.log(`Successfully fetched ${episodes.length} recent episodes`);
    
    // Now get the feed details for each episode
    const episodesWithFeedDetails = await Promise.all(
      episodes.map(async (episode) => {
        const { data: feedData } = await supabase
          .from('podcast_subscriptions')
          .select('id, title, image_url, author')
          .eq('id', episode.feed_id)
          .single();
        
        return {
          ...episode,
          podcast_subscriptions: feedData || {
            id: episode.feed_id,
            title: 'Unknown Podcast',
            image_url: null,
            author: 'Unknown Author'
          }
        };
      })
    );
    
    return episodesWithFeedDetails;
  } catch (error) {
    console.error('Error in getRecentEpisodes:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    return []; // Return empty array instead of throwing
  }
}

/**
 * Removes a podcast feed from the user's subscriptions
 * @param userId The user's ID
 * @param feedId The ID of the feed to remove
 * @returns Processing result
 */
export async function removeFeed(userId: string, feedId: string): Promise<FeedProcessingResult> {
  try {
    // First verify that the feed belongs to the user
    const { data: feed } = await supabase
      .from('podcast_subscriptions')
      .select('id')
      .eq('id', feedId)
      .eq('user_id', userId)
      .single();
    
    if (!feed) {
      return {
        success: false,
        message: 'Feed not found or does not belong to user'
      };
    }
    
    // Delete all episodes for this feed
    const { error: episodesError } = await supabase
      .from('episodes')
      .delete()
      .eq('feed_id', feedId);
    
    if (episodesError) {
      console.error('Error deleting episodes:', episodesError);
      return {
        success: false,
        message: 'Failed to delete episodes',
        error: episodesError
      };
    }
    
    // Delete the feed
    const { error: feedError } = await supabase
      .from('podcast_subscriptions')
      .delete()
      .eq('id', feedId);
    
    if (feedError) {
      console.error('Error deleting feed:', feedError);
      return {
        success: false,
        message: 'Failed to delete feed',
        error: feedError
      };
    }
    
    return {
      success: true,
      message: 'Podcast feed removed successfully'
    };
  } catch (error) {
    console.error('Error in removeFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while removing the feed',
      error
    };
  }
}

/**
 * Refreshes a podcast feed by fetching the latest episodes
 * @param userId The user's ID
 * @param feedId The ID of the feed to refresh
 * @returns Processing result with episode counts and podcast data
 */
export async function refreshFeed(userId: string, feedId: string): Promise<FeedProcessingResult & { podcast?: any }> {
  try {
    // First verify that the feed belongs to the user
    const { data: feed } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('id', feedId)
      .eq('user_id', userId)
      .single();
    
    if (!feed) {
      return {
        success: false,
        message: 'Feed not found or does not belong to user'
      };
    }
    
    // Fix common URL issues
    const fixedUrl = fixFeedUrl(feed.feed_url);
    
    // Parse the feed
    const { podcast, episodes } = await parseFeed(fixedUrl);
    
    // Update feed metadata
    const { error: updateError } = await supabase
      .from('podcast_subscriptions')
      .update({
        title: podcast.title,
        description: sanitizeHtml(podcast.description),
        author: podcast.publisher,
        image_url: podcast.artwork,
        website_url: podcast.website,
        last_checked_at: new Date().toISOString()
      })
      .eq('id', feedId);
    
    if (updateError) {
      throw new Error(`Failed to update feed metadata: ${updateError.message}`);
    }
    
    // Process episodes
    const result = await fetchAndStoreEpisodes(feedId, fixedUrl);
    
    return {
      success: true,
      message: `Feed refreshed successfully with ${result.newEpisodeCount} new episodes`,
      feedId,
      episodeCount: result.episodeCount,
      newEpisodeCount: result.newEpisodeCount,
      podcast: {
        title: podcast.title,
        description: sanitizeHtml(podcast.description),
        author: podcast.publisher,
        imageUrl: podcast.artwork,
        websiteUrl: podcast.website
      }
    };
  } catch (error) {
    console.error('Error in refreshFeed:', error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Failed to refresh feed: ${error.message}` 
        : 'Failed to refresh feed',
      error
    };
  }
}

/**
 * Refreshes all podcast feeds for a user
 * @param userId The user's ID
 * @returns Processing result with feed and episode counts
 */
export async function refreshAllFeeds(userId: string): Promise<{
  success: boolean;
  message: string;
  feedCount: number;
  updatedFeeds: number;
  newEpisodes: number;
  errors: string[];
}> {
  try {
    // Get all feeds for the user
    const feeds = await getUserFeeds(userId);
    
    if (!feeds || feeds.length === 0) {
      return {
        success: true,
        message: 'No feeds found to refresh',
        feedCount: 0,
        updatedFeeds: 0,
        newEpisodes: 0,
        errors: []
      };
    }
    
    // Process each feed
    const results = await Promise.all(
      feeds.map(feed => refreshFeed(userId, feed.id))
    );
    
    // Compile results
    const updatedFeeds = results.filter(r => r.success).length;
    const newEpisodes = results.reduce((sum, r) => sum + (r.newEpisodeCount || 0), 0);
    const errors = results
      .filter(r => !r.success)
      .map(r => r.message);
    
    return {
      success: true,
      message: `Refreshed ${updatedFeeds} of ${feeds.length} feeds, found ${newEpisodes} new episodes`,
      feedCount: feeds.length,
      updatedFeeds,
      newEpisodes,
      errors
    };
  } catch (error) {
    console.error('Error in refreshAllFeeds:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while refreshing feeds',
      feedCount: 0,
      updatedFeeds: 0,
      newEpisodes: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Gets detailed information about a podcast feed
 * @param feedId The ID of the feed to get details for
 * @returns Podcast details and episodes
 */
export async function getFeedDetails(feedId: string) {
  console.log('Getting feed details for:', feedId);
  
  if (!feedId) {
    console.error('No feedId provided to getFeedDetails');
    return { podcast: null, episodes: [] };
  }
  
  try {
    // Get the feed information
    const { data: feed, error } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('id', feedId)
      .single();
    
    if (error) {
      console.error('Error fetching feed details:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { podcast: null, episodes: [] };
    }
    
    if (!feed) {
      console.error('Feed not found with ID:', feedId);
      return { podcast: null, episodes: [] };
    }
    
    // Get episodes for this feed
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .eq('feed_id', feedId)
      .order('published_date', { ascending: false })
      .limit(10);
    
    if (episodesError) {
      console.error(`Failed to fetch episodes: ${episodesError.message}`);
      console.error('Error details:', JSON.stringify(episodesError, null, 2));
      return { podcast: feed, episodes: [] };
    }
    
    // Format the podcast data using only properties that exist in the schema
    const podcast = {
      id: feed.id,
      title: feed.title || 'Unknown Podcast',
      description: feed.description || '',
      author: feed.author || 'Unknown Author',
      imageUrl: feed.image_url || '',
      websiteUrl: feed.website_url || '',
      // Use default values for properties that don't exist in the schema
      language: 'en',
      explicit: false,
      categories: [],
      lastCheckedAt: feed.last_checked_at
    };
    
    console.log(`Successfully fetched feed details and ${episodes?.length || 0} episodes`);
    return {
      podcast,
      episodes: episodes || []
    };
  } catch (error) {
    console.error('Error in getFeedDetails:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    return { podcast: null, episodes: [] };
  }
}
