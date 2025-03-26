"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserRSSFeeds, SavedRSSFeed, getFeedEpisodes, RSSFeedEpisode, refreshUserFeeds } from "@/lib/rss-service"
import { useMockAuth } from "@/components/auth/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, Headphones, ListMusic, Play, PlusCircle, Radio, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function LibraryPage() {
  const { user } = useMockAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feeds, setFeeds] = useState<SavedRSSFeed[]>([])
  const [viewType, setViewType] = useState<"card" | "list">("card")
  const [selectedFeed, setSelectedFeed] = useState<SavedRSSFeed | null>(null)
  const [feedEpisodes, setFeedEpisodes] = useState<RSSFeedEpisode[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load feeds when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('Library page - Getting feeds for user:', user.id);
      loadUserFeeds();
    } else {
      setFeeds([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserFeeds = () => {
    setIsLoading(true);
    
    try {
      const userFeeds = getUserRSSFeeds(user!.id);
      setFeeds(userFeeds);
    } catch (error) {
      console.error('Error loading user feeds:', error);
      toast({
        title: "Error",
        description: "Failed to load your podcast library. Please try again.",
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
      
      // Reload feeds after refresh
      const userFeeds = getUserRSSFeeds(user.id);
      setFeeds(userFeeds);
      
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

  const handleViewEpisodes = (feed: SavedRSSFeed) => {
    setSelectedFeed(feed);
    const episodes = getFeedEpisodes(feed.id);
    setFeedEpisodes(episodes);
    setIsDialogOpen(true);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
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

      <Tabs defaultValue="card" className="w-full" onValueChange={(value) => setViewType(value as "card" | "list")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="card">Card View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Headphones className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-xl font-medium mb-2">Your library is empty</h2>
            <p className="mb-4">Add some podcasts to get started</p>
            <Button onClick={handleAddRSSFeed} className="bg-[#c32b1a] hover:bg-[#a82315]">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add RSS Feed
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="card" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeds.map((feed) => (
                  <Card key={feed.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="line-clamp-1">{feed.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{feed.author || 'Unknown Author'}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                          {feed.imageUrl ? (
                            <img 
                              src={feed.imageUrl} 
                              alt={feed.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary">
                              <Radio className="h-8 w-8 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {feed.description || 'No description available'}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 p-0 h-auto text-[#c32b1a] hover:text-[#c32b1a] hover:bg-transparent"
                            onClick={() => handleViewEpisodes(feed)}
                          >
                            <ListMusic className="h-3 w-3 mr-1" />
                            View Episodes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <div className="space-y-2">
                {feeds.map((feed) => (
                  <div 
                    key={feed.id} 
                    className="flex items-center p-3 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                      {feed.imageUrl ? (
                        <img 
                          src={feed.imageUrl} 
                          alt={feed.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary">
                          <Radio className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-1">{feed.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{feed.author || 'Unknown Author'}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 text-[#c32b1a] hover:text-[#c32b1a] hover:bg-[#c32b1a]/10"
                      onClick={() => handleViewEpisodes(feed)}
                    >
                      <ListMusic className="h-4 w-4 mr-2" />
                      Episodes
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Episodes Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFeed?.title} - Episodes</DialogTitle>
            <DialogDescription>
              {selectedFeed?.author && `By ${selectedFeed.author}`}
            </DialogDescription>
          </DialogHeader>
          
          {feedEpisodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Clock className="h-10 w-10 mb-3 text-primary" />
              <h3 className="text-lg font-medium mb-1">No episodes found</h3>
              <p className="text-sm">Try refreshing the feed to get the latest episodes</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {feedEpisodes.map((episode) => (
                <Card key={episode.id} className="w-full hover:shadow-sm transition-shadow">
                  <div className="p-4">
                    <h3 className="font-medium text-foreground">{episode.title}</h3>
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
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {episode.description ? episode.description.replace(/<[^>]*>/g, '') : 'No description available'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 text-[#c32b1a] border-[#c32b1a] hover:bg-[#c32b1a]/10 hover:text-[#c32b1a]"
                      onClick={() => window.open(episode.audioUrl, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Episode
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
