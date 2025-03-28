"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserRSSFeeds, SavedRSSFeed, getRecentEpisodes, RSSFeedEpisode, refreshUserFeeds } from "@/lib/rss-service"
import { useAuth } from "@/components/auth/auth-provider"
import { RecentlyPlayed } from "@/components/recently-played"
import Link from "next/link"
import { Calendar, Clock, Headphones, Play, PlusCircle, Radio, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function StreamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feeds, setFeeds] = useState<SavedRSSFeed[]>([])
  const [episodes, setEpisodes] = useState<RSSFeedEpisode[]>([])

  // Load feeds and episodes when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('Stream page - Getting feeds for user:', user.id);
      loadUserContent();
    } else {
      setFeeds([]);
      setEpisodes([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserContent = async () => {
    setIsLoading(true);
    
    try {
      // Get user's feeds
      const userFeeds = getUserRSSFeeds(user!.id);
      setFeeds(userFeeds);
      
      // Get recent episodes
      const recentEpisodes = getRecentEpisodes(user!.id);
      setEpisodes(recentEpisodes);
    } catch (error) {
      console.error('Error loading user content:', error);
      toast({
        title: "Error",
        description: "Failed to load your content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshFeeds = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    
    try {
      await refreshUserFeeds(user.id);
      
      // Reload content after refresh
      const userFeeds = getUserRSSFeeds(user.id);
      setFeeds(userFeeds);
      
      const recentEpisodes = getRecentEpisodes(user.id);
      setEpisodes(recentEpisodes);
      
      toast({
        title: "Feeds refreshed",
        description: "Your podcast feeds have been updated with the latest episodes."
      });
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      toast({
        title: "Error",
        description: "Failed to refresh your feeds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddRSSFeed = () => {
    router.push('/search');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Stream</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshFeeds}
            disabled={isRefreshing || isLoading}
            className="border-[#c32b1a] text-[#c32b1a] hover:bg-[#c32b1a]/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={handleAddRSSFeed} className="bg-[#c32b1a] hover:bg-[#a82315]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add RSS Feed
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="w-full animate-pulse">
              <CardHeader className="p-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : feeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Radio className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-medium mb-2">Your stream is empty</h2>
          <p className="mb-4">Subscribe to podcasts to see their latest episodes here</p>
          <Button onClick={handleAddRSSFeed} className="bg-[#c32b1a] hover:bg-[#a82315]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add RSS Feed
          </Button>
        </div>
      ) : episodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-medium mb-2">No recent episodes</h2>
          <p className="mb-4">Your subscribed podcasts haven't published new episodes recently</p>
          <Button onClick={() => router.push('/library')} className="bg-[#c32b1a] hover:bg-[#a82315]">
            <Headphones className="h-4 w-4 mr-2" />
            Go to Your Library
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Episodes</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {episodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </TabsContent>
            
            <TabsContent value="today" className="space-y-4">
              {episodes
                .filter(episode => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const pubDate = new Date(episode.pubDate);
                  return pubDate >= today;
                })
                .map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
            </TabsContent>
            
            <TabsContent value="week" className="space-y-4">
              {episodes
                .filter(episode => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  weekAgo.setHours(0, 0, 0, 0);
                  const pubDate = new Date(episode.pubDate);
                  return pubDate >= weekAgo;
                })
                .map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recently Played</h2>
        <RecentlyPlayed />
      </section>
    </div>
  )
}

interface EpisodeCardProps {
  episode: RSSFeedEpisode;
}

function EpisodeCard({ episode }: EpisodeCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  // Find the feed for this episode to get podcast title
  const [podcastTitle, setPodcastTitle] = useState<string>('');
  
  useEffect(() => {
    // Get feed info from localStorage
    try {
      const storedFeeds = localStorage.getItem('rssFeeds');
      if (storedFeeds) {
        const feeds = JSON.parse(storedFeeds);
        const feed = feeds.find((f: SavedRSSFeed) => f.id === episode.feedId);
        if (feed) {
          setPodcastTitle(feed.title);
        }
      }
    } catch (error) {
      console.error('Error getting podcast title:', error);
    }
  }, [episode.feedId]);
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <div className="flex p-4">
        <div className="h-20 w-20 rounded bg-muted mr-4 flex-shrink-0">
          {episode.imageUrl ? (
            <img 
              src={episode.imageUrl} 
              alt={podcastTitle} 
              className="h-full w-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary">
              <Radio className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1">{episode.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{podcastTitle}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1 inline" />
            {formatDate(episode.pubDate)}
            {episode.duration && (
              <>
                <span className="mx-2">•</span>
                <Clock className="h-3 w-3 mr-1 inline" />
                {episode.duration}
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {episode.description ? episode.description.replace(/<[^>]*>/g, '') : 'No description available'}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 flex-shrink-0 self-center text-[#c32b1a] hover:text-[#c32b1a] hover:bg-[#c32b1a]/10"
          onClick={() => window.open(episode.audioUrl, '_blank')}
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  )
}
