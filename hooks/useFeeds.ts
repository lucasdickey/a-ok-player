"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
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
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  // Add a new feed
  const addNewFeed = async (feedUrl: string) => {
    if (!user) {
      console.error('Error: You must be logged in to add feeds')
      return { success: false, message: 'You must be logged in to add feeds' }
    }

    try {
      const result = await addFeed(user.id, feedUrl)
      
      if (result.success) {
        console.log(`Success: Added "${result.message}"`)
        fetchFeeds() // Refresh the feeds list
        return { success: true, feedId: result.feedId, message: result.message }
      } else {
        // Only log errors to console if it's not an "already subscribed" message
        if (!result.message?.includes('already subscribed')) {
          console.error('Error:', result.message)
        }
        return { success: false, message: result.message, feedId: result.feedId }
      }
    } catch (error) {
      console.error('Error adding feed:', error)
      console.error('Error: Failed to add podcast feed')
      return { success: false, message: 'Failed to add podcast feed' }
    }
  }

  // Remove a feed
  const removeFeedById = async (feedId: string) => {
    if (!user) return false

    try {
      const result = await removeFeed(user.id, feedId)
      
      if (result.success) {
        console.log('Success: Podcast removed from your library')
        // Update the local state
        setFeeds(feeds.filter(feed => feed.id !== feedId))
        return true
      } else {
        console.error('Error:', result.message)
        return false
      }
    } catch (error) {
      console.error('Error removing feed:', error)
      console.error('Failed to remove podcast feed')
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
        console.log(`Success: Refreshed feed with ${result.newEpisodeCount} new episodes`)
        fetchFeeds() // Refresh the feeds list
        return true
      } else {
        console.error('Error:', result.message)
        return false
      }
    } catch (error) {
      console.error('Error refreshing feed:', error)
      console.error('Failed to refresh podcast feed')
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
        console.log(`Success: Refreshed ${result.updatedFeeds} feeds with ${result.newEpisodes} new episodes`)
        fetchFeeds() // Refresh the feeds list
        return true
      } else {
        console.error('Error:', result.message)
        return false
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error)
      console.error('Failed to refresh podcast feeds')
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
      console.error('Failed to load episodes')
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
      console.error('Failed to load recent episodes')
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
