"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFeeds, getFeedEpisodes, refreshFeed } from "@/lib/feed-processor"
import { PodcastFeed } from "@/lib/feed-processor"
import { useAuth } from "@/components/auth/auth-provider"
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
}

export default function LibraryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null)
  const [feeds, setFeeds] = useState<PodcastFeed[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])

  // Load feeds when the component mounts or user changes
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    const loadFeeds = async () => {
      setIsLoading(true)
      
      try {
        const userFeeds = await getUserFeeds(user.id)
        setFeeds(userFeeds)
        
        // If there are feeds, select the first one by default
        if (userFeeds.length > 0) {
          setSelectedFeed(userFeeds[0].id)
          const feedEpisodes = await getFeedEpisodes(userFeeds[0].id)
          setEpisodes(feedEpisodes)
        }
      } catch (error) {
        console.error('Error loading feeds:', error)
        toast({
          title: 'Error',
          description: 'Failed to load your podcast feeds',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFeeds()
  }, [user, router, toast])

  // Load episodes when the selected feed changes
  useEffect(() => {
    if (!selectedFeed) return
    
    const loadEpisodes = async () => {
      setIsLoading(true)
      
      try {
        const feedEpisodes = await getFeedEpisodes(selectedFeed)
        setEpisodes(feedEpisodes)
      } catch (error) {
        console.error('Error loading episodes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load episodes',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEpisodes()
  }, [selectedFeed, toast])

  // Handle refresh
  const handleRefresh = async () => {
    if (!user || !selectedFeed) return
    
    setIsRefreshing(true)
    
    try {
      await refreshFeed(user.id, selectedFeed)
      
      // Reload episodes after refresh
      const feedEpisodes = await getFeedEpisodes(selectedFeed)
      setEpisodes(feedEpisodes)
      
      toast({
        title: 'Success',
        description: 'Podcast refreshed successfully',
      })
    } catch (error) {
      console.error('Error refreshing feed:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh podcast',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading && feeds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const selectedPodcast = feeds.find(feed => feed.id === selectedFeed)

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedFeed}
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
          <Button asChild size="sm">
            <Link href="/feeds/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Podcast
            </Link>
          </Button>
        </div>
      </div>

      {feeds.length === 0 ? (
        <div className="text-center py-12">
          <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium">Your library is empty</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Add podcast feeds to start building your library
          </p>
          <Button asChild>
            <Link href="/feeds/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Podcast
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Your Podcasts</h2>
              <div className="space-y-1">
                {feeds.map((feed) => (
                  <Button
                    key={feed.id}
                    variant={selectedFeed === feed.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFeed(feed.id)}
                  >
                    <div className="flex items-center w-full">
                      <div className="h-6 w-6 rounded mr-2 overflow-hidden">
                        <img 
                          src={feed.image_url || '/images/placeholder-podcast.png'} 
                          alt={feed.title || 'Podcast'} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate">{feed.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            {selectedPodcast ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-24 w-24 rounded overflow-hidden">
                    <img 
                      src={selectedPodcast.image_url || '/images/placeholder-podcast.png'} 
                      alt={selectedPodcast.title || 'Podcast'} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPodcast.title}</h2>
                    <p className="text-muted-foreground">{selectedPodcast.author}</p>
                    <p className="text-sm mt-2">{selectedPodcast.description}</p>
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList>
                    <TabsTrigger value="all">All Episodes</TabsTrigger>
                    <TabsTrigger value="unplayed">Unplayed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4 mt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : episodes.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No episodes found</p>
                      </div>
                    ) : (
                      episodes.map((episode) => (
                        <Card key={episode.id} className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between">
                              <div className="space-y-1">
                                <h3 className="font-medium">{episode.title}</h3>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {episode.published_date 
                                      ? new Date(episode.published_date).toLocaleDateString() 
                                      : 'Unknown date'}
                                  </span>
                                  <Clock className="h-3 w-3 ml-3 mr-1" />
                                  <span>{episode.duration_formatted || '0:00'}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
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
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {episode.description || 'No description available'}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="unplayed" className="space-y-4 mt-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : episodes.filter(e => !e.is_played).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No unplayed episodes</p>
                      </div>
                    ) : (
                      episodes
                        .filter(episode => !episode.is_played)
                        .map((episode) => (
                          <Card key={episode.id} className="overflow-hidden">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between">
                                <div className="space-y-1">
                                  <h3 className="font-medium">{episode.title}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                      {episode.published_date 
                                        ? new Date(episode.published_date).toLocaleDateString() 
                                        : 'Unknown date'}
                                    </span>
                                    <Clock className="h-3 w-3 ml-3 mr-1" />
                                    <span>{episode.duration_formatted || '0:00'}</span>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
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
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {episode.description || 'No description available'}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a podcast</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose a podcast from your library to view episodes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
