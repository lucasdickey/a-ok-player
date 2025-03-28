import { parseFeed, isValidPodcastFeed, fixFeedUrl, sanitizeHtml, parseDurationToSeconds, formatDuration } from './enhanced-rss-parser';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './supabase-types';

// Type definitions
export type PodcastFeed = Database['public']['Tables']['podcast_feeds']['Row'];
export type Episode = Database['public']['Tables']['episodes']['Row'];

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
      .from('podcast_feeds')
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
      .from('podcast_feeds')
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
      .from('podcast_feeds')
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
  try {
    const { data, error } = await supabase
      .from('podcast_feeds')
      .select('*')
      .eq('user_id', userId)
      .order('title');
    
    if (error) {
      console.error('Error fetching user feeds:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserFeeds:', error);
    throw error;
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
  try {
    // Calculate the date to look back to
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        podcast_feeds!inner(
          id,
          title,
          image_url,
          author
        )
      `)
      .gt('published_date', lookbackDate.toISOString())
      .eq('podcast_feeds.user_id', userId)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent episodes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getRecentEpisodes:', error);
    throw error;
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
      .from('podcast_feeds')
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
      .from('podcast_feeds')
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
 * @returns Processing result with episode counts
 */
export async function refreshFeed(userId: string, feedId: string): Promise<FeedProcessingResult> {
  try {
    // First verify that the feed belongs to the user
    const { data: feed } = await supabase
      .from('podcast_feeds')
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
    
    // Fetch and validate the feed
    const validationResult = await validateFeed(feed.feed_url);
    
    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Failed to refresh feed: ${validationResult.message}`
      };
    }
    
    // Update feed metadata if available
    if (validationResult.metadata) {
      await supabase
        .from('podcast_feeds')
        .update({
          title: validationResult.metadata.title || feed.title,
          description: validationResult.metadata.description || feed.description,
          author: validationResult.metadata.author || feed.author,
          image_url: validationResult.metadata.imageUrl || feed.image_url,
          website_url: validationResult.metadata.websiteUrl || feed.website_url,
          language: validationResult.metadata.language || feed.language,
          explicit: validationResult.metadata.explicit !== undefined ? validationResult.metadata.explicit : feed.explicit,
          categories: validationResult.metadata.categories || feed.categories,
          last_checked_at: new Date().toISOString()
        })
        .eq('id', feedId);
    }
    
    // Fetch and store new episodes
    const processingResult = await fetchAndStoreEpisodes(feedId, feed.feed_url);
    
    return {
      success: processingResult.success,
      message: `Feed refreshed: ${processingResult.message}`,
      feedId,
      episodeCount: processingResult.episodeCount,
      newEpisodeCount: processingResult.newEpisodeCount
    };
  } catch (error) {
    console.error('Error in refreshFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while refreshing the feed',
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
