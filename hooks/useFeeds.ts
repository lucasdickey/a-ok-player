import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import * as supabaseRssService from '@/lib/supabase-rss-service';
import { toast } from '@/components/ui/use-toast';

export interface Feed {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  imageUrl: string | null;
  feedUrl: string;
  websiteUrl: string | null;
  lastCheckedAt: string | null;
}

export interface Episode {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  description: string | null;
  publishedDate: string | null;
  duration: number | null;
  audioUrl: string;
  imageUrl: string | null;
  isPlayed: boolean;
}

export function useFeeds() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load feeds for the current user
  const loadFeeds = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabaseRssService.getUserPodcastFeeds(user.id);
      
      if (result.success && result.feeds) {
        // Transform the data to match our interface
        const transformedFeeds: Feed[] = result.feeds.map(feed => ({
          id: feed.id,
          title: feed.title || 'Untitled Podcast',
          description: feed.description,
          author: feed.author,
          imageUrl: feed.image_url,
          feedUrl: feed.feed_url,
          websiteUrl: feed.website_url,
          lastCheckedAt: feed.last_checked_at
        }));
        
        setFeeds(transformedFeeds);
      } else {
        setError(result.message || 'Failed to load feeds');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading feeds:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add a new feed
  const addFeed = useCallback(async (feedUrl: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a podcast feed",
        variant: "destructive"
      });
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      // First validate the feed
      const validationResult = await supabaseRssService.validateRssFeed(feedUrl);
      
      if (!validationResult.isValid) {
        toast({
          title: "Invalid Feed",
          description: validationResult.message,
          variant: "destructive"
        });
        return { success: false };
      }
      
      // Add the feed
      const result = await supabaseRssService.addPodcastFeed(
        user.id, 
        feedUrl, 
        validationResult.metadata
      );
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Podcast added to your library",
        });
        
        // Reload feeds to get the new one
        await loadFeeds();
        return { success: true, feedId: result.feedId };
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add podcast",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Error adding feed:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, loadFeeds]);

  // Remove a feed
  const removeFeed = useCallback(async (feedId: string) => {
    if (!user) return { success: false };
    
    setLoading(true);
    
    try {
      const result = await supabaseRssService.removePodcastFeed(user.id, feedId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Podcast removed from your library",
        });
        
        // Update local state
        setFeeds(currentFeeds => currentFeeds.filter(feed => feed.id !== feedId));
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove podcast",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Error removing feed:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh a feed
  const refreshFeed = useCallback(async (feedId: string) => {
    setLoading(true);
    
    try {
      const result = await supabaseRssService.refreshPodcastFeed(feedId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Podcast refreshed successfully",
        });
        
        // Reload feeds to get updated data
        await loadFeeds();
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to refresh podcast",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Error refreshing feed:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [loadFeeds]);

  // Refresh all feeds
  const refreshAllFeeds = useCallback(async () => {
    if (!user) return { success: false };
    
    setLoading(true);
    
    try {
      const result = await supabaseRssService.refreshAllUserFeeds(user.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "All podcasts refreshed",
        });
        
        // Reload feeds to get updated data
        await loadFeeds();
        return { success: true };
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to refresh podcasts",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      console.error('Error refreshing all feeds:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, loadFeeds]);

  // Get episodes for a feed
  const getFeedEpisodes = useCallback(async (feedId: string, limit = 50, offset = 0) => {
    try {
      const result = await supabaseRssService.getFeedEpisodes(feedId, limit, offset);
      
      if (result.success && result.episodes) {
        // Transform the data to match our interface
        const transformedEpisodes: Episode[] = result.episodes.map(episode => ({
          id: episode.id,
          feedId: episode.feed_id,
          guid: episode.guid,
          title: episode.title,
          description: episode.description,
          publishedDate: episode.published_date,
          duration: episode.duration,
          audioUrl: episode.audio_url,
          imageUrl: episode.image_url,
          isPlayed: episode.is_played
        }));
        
        return { success: true, episodes: transformedEpisodes };
      } else {
        return { 
          success: false, 
          message: result.message || 'Failed to load episodes',
          episodes: [] as Episode[]
        };
      }
    } catch (err) {
      console.error('Error getting feed episodes:', err);
      return { 
        success: false, 
        message: 'An unexpected error occurred',
        episodes: [] as Episode[]
      };
    }
  }, []);

  // Get recent episodes
  const getRecentEpisodes = useCallback(async (days = 7, limit = 50) => {
    if (!user) return { success: false, episodes: [] as Episode[] };
    
    try {
      const result = await supabaseRssService.getRecentEpisodes(user.id, days, limit);
      
      if (result.success && result.episodes) {
        // Transform the data to match our interface
        const transformedEpisodes: Episode[] = result.episodes.map(episode => ({
          id: episode.id,
          feedId: episode.feed_id,
          guid: episode.guid,
          title: episode.title,
          description: episode.description,
          publishedDate: episode.published_date,
          duration: episode.duration,
          audioUrl: episode.audio_url,
          imageUrl: episode.image_url,
          isPlayed: episode.is_played
        }));
        
        return { success: true, episodes: transformedEpisodes };
      } else {
        return { 
          success: false, 
          message: result.message || 'Failed to load recent episodes',
          episodes: [] as Episode[]
        };
      }
    } catch (err) {
      console.error('Error getting recent episodes:', err);
      return { 
        success: false, 
        message: 'An unexpected error occurred',
        episodes: [] as Episode[]
      };
    }
  }, [user]);

  // Load feeds when the user changes
  useEffect(() => {
    if (user) {
      loadFeeds();
    } else {
      setFeeds([]);
    }
  }, [user, loadFeeds]);

  return {
    feeds,
    loading,
    error,
    addFeed,
    removeFeed,
    refreshFeed,
    refreshAllFeeds,
    getFeedEpisodes,
    getRecentEpisodes
  };
}
