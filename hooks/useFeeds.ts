"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import { 
  getUserFeeds, 
  addFeed, 
  removeFeed, 
  refreshFeed, 
  refreshAllFeeds,
  getFeedEpisodes,
  getRecentEpisodes
} from '@/lib/feed-processor'
import { PodcastFeed } from '@/lib/feed-processor'

export function useFeeds() {
  const [feeds, setFeeds] = useState<PodcastFeed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch feeds when the component mounts or user changes
  const fetchFeeds = useCallback(async () => {
    if (!user) {
      setFeeds([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const userFeeds = await getUserFeeds(user.id)
      setFeeds(userFeeds)
    } catch (error) {
      console.error('Error fetching feeds:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your podcast feeds',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  // Add a new feed
  const addNewFeed = async (feedUrl: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add feeds',
        variant: 'destructive',
      })
      return { success: false }
    }

    try {
      const result = await addFeed(user.id, feedUrl)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Added "${result.message}"`,
        })
        fetchFeeds() // Refresh the feeds list
        return { success: true, feedId: result.feedId }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        return { success: false }
      }
    } catch (error) {
      console.error('Error adding feed:', error)
      toast({
        title: 'Error',
        description: 'Failed to add podcast feed',
        variant: 'destructive',
      })
      return { success: false }
    }
  }

  // Remove a feed
  const removeFeedById = async (feedId: string) => {
    if (!user) return false

    try {
      const result = await removeFeed(user.id, feedId)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Podcast removed from your library',
        })
        // Update the local state
        setFeeds(feeds.filter(feed => feed.id !== feedId))
        return true
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        return false
      }
    } catch (error) {
      console.error('Error removing feed:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove podcast feed',
        variant: 'destructive',
      })
      return false
    }
  }

  // Refresh a single feed
  const refreshFeedById = async (feedId: string) => {
    if (!user) return false

    try {
      setIsRefreshing(true)
      const result = await refreshFeed(user.id, feedId)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Refreshed feed with ${result.newEpisodeCount} new episodes`,
        })
        fetchFeeds() // Refresh the feeds list
        return true
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        return false
      }
    } catch (error) {
      console.error('Error refreshing feed:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh podcast feed',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRefreshing(false)
    }
  }

  // Refresh all feeds
  const refreshAllUserFeeds = async () => {
    if (!user) return false

    try {
      setIsRefreshing(true)
      const result = await refreshAllFeeds(user.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Refreshed ${result.updatedFeeds} feeds with ${result.newEpisodes} new episodes`,
        })
        fetchFeeds() // Refresh the feeds list
        return true
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        return false
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh podcast feeds',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get episodes for a specific feed
  const getEpisodesForFeed = async (feedId: string, limit = 50, offset = 0) => {
    if (!user) return []

    try {
      return await getFeedEpisodes(feedId, limit, offset)
    } catch (error) {
      console.error('Error fetching episodes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load episodes',
        variant: 'destructive',
      })
      return []
    }
  }

  // Get recent episodes from all feeds
  const getRecentFeedEpisodes = async (days = 7, limit = 50) => {
    if (!user) return []

    try {
      return await getRecentEpisodes(user.id, days, limit)
    } catch (error) {
      console.error('Error fetching recent episodes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load recent episodes',
        variant: 'destructive',
      })
      return []
    }
  }

  return {
    feeds,
    isLoading,
    isRefreshing,
    fetchFeeds,
    addFeed: addNewFeed,
    removeFeed: removeFeedById,
    refreshFeed: refreshFeedById,
    refreshAllFeeds: refreshAllUserFeeds,
    getEpisodesForFeed,
    getRecentEpisodes: getRecentFeedEpisodes
  }
}
