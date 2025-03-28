import { supabase } from './supabase';
import { parseFeed } from './rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './supabase-types';

// Type for RSS feed validation result
export interface FeedValidationResult {
  isValid: boolean;
  message: string;
  metadata?: {
    title: string;
    description?: string;
    author?: string;
    imageUrl?: string;
    websiteUrl?: string;
  };
}

/**
 * Validates an RSS feed URL by attempting to parse it
 * @param feedUrl The URL of the RSS feed to validate
 */
export async function validateRssFeed(feedUrl: string): Promise<FeedValidationResult> {
  try {
    // Try to parse the feed
    const { podcast } = await parseFeed(feedUrl);
    
    return {
      isValid: true,
      message: 'Feed validated successfully',
      metadata: {
        title: podcast.title,
        description: podcast.description,
        author: podcast.publisher,
        imageUrl: podcast.artwork,
        websiteUrl: podcast.website
      }
    };
  } catch (error) {
    console.error('Error validating RSS feed:', error);
    return {
      isValid: false,
      message: error instanceof Error ? error.message : 'Failed to validate RSS feed'
    };
  }
}

/**
 * Adds a podcast feed to the user's subscriptions
 * @param userId The user's ID
 * @param feedUrl The URL of the RSS feed
 * @param metadata Optional metadata about the feed
 */
export async function addPodcastFeed(
  userId: string, 
  feedUrl: string,
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    imageUrl?: string;
    websiteUrl?: string;
  }
) {
  try {
    // First check if the feed already exists for this user
    const { data: existingFeed } = await supabase
      .from('podcast_feeds')
      .select('id')
      .eq('user_id', userId)
      .eq('feed_url', feedUrl)
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
      const validationResult = await validateRssFeed(feedUrl);
      if (validationResult.isValid && validationResult.metadata) {
        feedMetadata = validationResult.metadata;
      } else {
        // If validation failed but we still want to add the feed
        feedMetadata = {
          title: 'Unknown Podcast',
          description: '',
          author: '',
          imageUrl: '',
          websiteUrl: ''
        };
      }
    }
    
    // Insert the feed into the database
    const { data, error } = await supabase
      .from('podcast_feeds')
      .insert({
        id: uuidv4(),
        user_id: userId,
        feed_url: feedUrl,
        title: feedMetadata.title,
        description: feedMetadata.description,
        author: feedMetadata.author,
        image_url: feedMetadata.imageUrl,
        website_url: feedMetadata.websiteUrl,
        last_checked_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding podcast feed:', error);
      return {
        success: false,
        message: 'Failed to add podcast feed',
        error
      };
    }
    
    // Fetch and store episodes
    await fetchAndStoreEpisodes(data.id, feedUrl);
    
    return {
      success: true,
      message: 'Podcast added successfully',
      feedId: data.id
    };
  } catch (error) {
    console.error('Error in addPodcastFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Fetches and stores episodes from an RSS feed
 * @param feedId The ID of the feed in the database
 * @param feedUrl The URL of the RSS feed
 */
export async function fetchAndStoreEpisodes(feedId: string, feedUrl: string) {
  try {
    // Parse the feed to get episodes
    const { episodes } = await parseFeed(feedUrl);
    
    // Prepare episodes for insertion
    const episodesToInsert = episodes.map(episode => ({
      id: uuidv4(),
      feed_id: feedId,
      guid: episode.id,
      title: episode.title,
      description: episode.description,
      published_date: episode.publishDate,
      duration: episode.durationSeconds,
      audio_url: episode.audioUrl,
      image_url: episode.artwork,
      is_played: false,
      created_at: new Date().toISOString()
    }));
    
    // Insert episodes in batches to avoid hitting limits
    const batchSize = 50;
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
      
      if (newEpisodes.length > 0) {
        const { error } = await supabase
          .from('episodes')
          .insert(newEpisodes);
        
        if (error) {
          console.error('Error inserting episodes:', error);
        }
      }
    }
    
    // Update the last_checked_at timestamp for the feed
    await supabase
      .from('podcast_feeds')
      .update({ last_checked_at: new Date().toISOString() })
      .eq('id', feedId);
    
    return {
      success: true,
      message: `Stored ${episodesToInsert.length} episodes`
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
 */
export async function getUserPodcastFeeds(userId: string) {
  try {
    const { data, error } = await supabase
      .from('podcast_feeds')
      .select('*')
      .eq('user_id', userId)
      .order('title');
    
    if (error) {
      console.error('Error getting user podcast feeds:', error);
      return {
        success: false,
        message: 'Failed to get podcast feeds',
        error
      };
    }
    
    return {
      success: true,
      feeds: data
    };
  } catch (error) {
    console.error('Error in getUserPodcastFeeds:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Gets episodes for a specific podcast feed
 * @param feedId The ID of the feed
 * @param limit Optional limit on the number of episodes to return
 * @param offset Optional offset for pagination
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
      console.error('Error getting feed episodes:', error);
      return {
        success: false,
        message: 'Failed to get episodes',
        error
      };
    }
    
    return {
      success: true,
      episodes: data
    };
  } catch (error) {
    console.error('Error in getFeedEpisodes:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Gets recent episodes from all of a user's podcast feeds
 * @param userId The user's ID
 * @param days Number of days to look back
 * @param limit Optional limit on the number of episodes to return
 */
export async function getRecentEpisodes(userId: string, days = 7, limit = 50) {
  try {
    // Calculate the date to look back to
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - days);
    
    // Get episodes from feeds the user is subscribed to
    const { data, error } = await supabase
      .from('episodes')
      .select('*, podcast_feeds!inner(*)')
      .gt('published_date', lookbackDate.toISOString())
      .eq('podcast_feeds.user_id', userId)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error getting recent episodes:', error);
      return {
        success: false,
        message: 'Failed to get recent episodes',
        error
      };
    }
    
    return {
      success: true,
      episodes: data
    };
  } catch (error) {
    console.error('Error in getRecentEpisodes:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Removes a podcast feed from the user's subscriptions
 * @param userId The user's ID
 * @param feedId The ID of the feed to remove
 */
export async function removePodcastFeed(userId: string, feedId: string) {
  try {
    // First check if the feed exists and belongs to the user
    const { data: existingFeed } = await supabase
      .from('podcast_feeds')
      .select('id')
      .eq('user_id', userId)
      .eq('id', feedId)
      .single();
    
    if (!existingFeed) {
      return {
        success: false,
        message: 'Feed not found or does not belong to this user'
      };
    }
    
    // Delete the feed
    const { error } = await supabase
      .from('podcast_feeds')
      .delete()
      .eq('id', feedId);
    
    if (error) {
      console.error('Error removing podcast feed:', error);
      return {
        success: false,
        message: 'Failed to remove podcast feed',
        error
      };
    }
    
    // Note: Episodes will be kept in the database for now
    // A separate cleanup job could remove orphaned episodes later
    
    return {
      success: true,
      message: 'Podcast removed successfully'
    };
  } catch (error) {
    console.error('Error in removePodcastFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Updates the metadata for a podcast feed
 * @param feedId The ID of the feed to update
 */
export async function refreshPodcastFeed(feedId: string) {
  try {
    // Get the feed URL
    const { data: feed, error: feedError } = await supabase
      .from('podcast_feeds')
      .select('feed_url')
      .eq('id', feedId)
      .single();
    
    if (feedError || !feed) {
      console.error('Error getting feed URL:', feedError);
      return {
        success: false,
        message: 'Failed to get feed URL',
        error: feedError
      };
    }
    
    // Validate and get updated metadata
    const validationResult = await validateRssFeed(feed.feed_url);
    if (!validationResult.isValid || !validationResult.metadata) {
      return {
        success: false,
        message: 'Failed to validate feed',
        error: validationResult.message
      };
    }
    
    // Update the feed metadata
    const { error: updateError } = await supabase
      .from('podcast_feeds')
      .update({
        title: validationResult.metadata.title,
        description: validationResult.metadata.description,
        author: validationResult.metadata.author,
        image_url: validationResult.metadata.imageUrl,
        website_url: validationResult.metadata.websiteUrl,
        last_checked_at: new Date().toISOString()
      })
      .eq('id', feedId);
    
    if (updateError) {
      console.error('Error updating feed metadata:', updateError);
      return {
        success: false,
        message: 'Failed to update feed metadata',
        error: updateError
      };
    }
    
    // Fetch and store episodes
    await fetchAndStoreEpisodes(feedId, feed.feed_url);
    
    return {
      success: true,
      message: 'Feed refreshed successfully'
    };
  } catch (error) {
    console.error('Error in refreshPodcastFeed:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}

/**
 * Refreshes all podcast feeds for a user
 * @param userId The user's ID
 */
export async function refreshAllUserFeeds(userId: string) {
  try {
    // Get all feeds for the user
    const { data: feeds, error: feedsError } = await supabase
      .from('podcast_feeds')
      .select('id, feed_url')
      .eq('user_id', userId);
    
    if (feedsError) {
      console.error('Error getting user feeds:', feedsError);
      return {
        success: false,
        message: 'Failed to get user feeds',
        error: feedsError
      };
    }
    
    if (!feeds || feeds.length === 0) {
      return {
        success: true,
        message: 'No feeds to refresh'
      };
    }
    
    // Refresh each feed
    const results = await Promise.all(
      feeds.map(feed => refreshPodcastFeed(feed.id))
    );
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: true,
      message: `Refreshed ${successCount} of ${feeds.length} feeds`
    };
  } catch (error) {
    console.error('Error in refreshAllUserFeeds:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
}
