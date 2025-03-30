"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFeeds, getRecentEpisodes, refreshAllFeeds } from "@/lib/feed-processor"
import { PodcastFeed } from "@/lib/feed-processor"
import { useAuth } from "@/components/auth/auth-provider"
import { RecentlyPlayed } from "@/components/recently-played"
import Link from "next/link"
import { Calendar, Clock, Headphones, Play, PlusCircle, Radio, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define types for episodes
interface Episode {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  description: string | null;
  published_date: string | null;
  duration: number | null;
  duration_formatted?: string;
  audio_url: string;
  image_url: string | null;
  is_played: boolean;
  podcast_subscriptions?: {
    id: string;
    title: string | null;
    image_url: string | null;
    author: string | null;
  };
}

export default function StreamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feeds, setFeeds] = useState<PodcastFeed[]>([])
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([])

  // Load content when the component mounts or user changes
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    const loadContent = async () => {
      setIsLoading(true)
      
      try {
        // Get user's feeds
        const userFeeds = await getUserFeeds(user.id)
        setFeeds(userFeeds)
        
        // Get recent episodes
        const episodes = await getRecentEpisodes(user.id)
        setRecentEpisodes(episodes)
      } catch (error) {
        console.error('Error loading content:', error)
        toast({
          title: 'Error',
          description: 'Failed to load content',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadContent()
  }, [user, router, toast])

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return
    
    setIsRefreshing(true)
    
    try {
      await refreshAllFeeds(user.id)
      
      // Reload content after refresh
      const userFeeds = await getUserFeeds(user.id)
      setFeeds(userFeeds)
      
      const episodes = await getRecentEpisodes(user.id)
      setRecentEpisodes(episodes)
      
      toast({
        title: 'Success',
        description: 'Content refreshed successfully',
      })
    } catch (error) {
      console.error('Error refreshing content:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh content',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Home</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEpisodes.length > 0 ? (
              recentEpisodes.slice(0, 6).map((episode) => (
                <Card key={episode.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={episode.image_url || '/images/placeholder-podcast.png'} 
                      alt={episode.title} 
                      className="object-cover w-full h-full"
                    />
                    <Button 
                      variant="default" 
                      size="icon" 
                      className="absolute bottom-2 right-2 rounded-full"
                      onClick={() => {
                        toast({
                          title: "Playing",
                          description: `Now playing ${episode.title}`,
                        })
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{episode.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {episode.podcast_subscriptions?.title || 'Unknown Podcast'}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{episode.duration_formatted || '0:00'}</span>
                      <Calendar className="h-3 w-3 ml-3 mr-1" />
                      <span>
                        {episode.published_date 
                          ? new Date(episode.published_date).toLocaleDateString() 
                          : 'Unknown date'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium">No Recent Episodes</h3>
                <p className="text-muted-foreground mt-2">
                  Subscribe to podcasts to see recent episodes here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/feeds/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Podcast
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          {recentEpisodes.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/library">
                  <Headphones className="mr-2 h-4 w-4" />
                  View All Episodes
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feeds.length > 0 ? (
              feeds.map((feed) => (
                <Card key={feed.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={feed.image_url || '/images/placeholder-podcast.png'} 
                      alt={feed.title || 'Podcast'} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{feed.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {feed.author || 'Unknown Author'}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <Link href={`/feeds/${feed.id}`}>
                        View Episodes
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium">No Subscriptions</h3>
                <p className="text-muted-foreground mt-2">
                  Add podcast feeds to see them here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/feeds/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Podcast
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          {feeds.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/feeds">
                  <Radio className="mr-2 h-4 w-4" />
                  View All Podcasts
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
