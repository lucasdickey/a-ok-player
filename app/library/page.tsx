"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PodcastGrid from "@/components/podcast-grid"
import EpisodeList from "@/components/episode-list"
import { Button } from "@/components/ui/button"
import { PlusCircle, Rss } from "lucide-react"
import { useMockAuth } from "@/components/auth/mock-auth-provider"
import { getUserRSSFeeds } from "@/lib/rss-service"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface RSSFeed {
  id: string;
  userId: string;
  feedUrl: string;
  title: string;
  description?: string;
  imageUrl?: string;
  author?: string;
  addedAt: string;
}

export default function LibraryPage() {
  const { user } = useMockAuth()
  const router = useRouter()
  const [feeds, setFeeds] = useState<RSSFeed[]>([])

  useEffect(() => {
    if (user) {
      const userFeeds = getUserRSSFeeds(user.id)
      setFeeds(userFeeds)
    }
  }, [user])

  const handleAddRSSFeed = () => {
    router.push('/search')
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
        <Button className="bg-[#004977] hover:bg-[#007187]" onClick={handleAddRSSFeed}>
          <Rss className="h-4 w-4 mr-2" />
          Add RSS Feed
        </Button>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="saved">Saved Episodes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="space-y-6">
          {feeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeds.map((feed) => (
                <FeedCard key={feed.id} feed={feed} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Rss className="h-12 w-12 mb-4 text-[#009BA4]" />
              <h2 className="text-xl font-medium mb-2">No RSS feeds yet</h2>
              <p className="mb-4">Add your first podcast RSS feed to get started</p>
              <Button onClick={handleAddRSSFeed} className="bg-[#009BA4] hover:bg-[#007A82]">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add RSS Feed
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="saved" className="space-y-6">
          <EpisodeList title="Your Saved Episodes" />
        </TabsContent>
        <TabsContent value="history" className="space-y-6">
          <EpisodeList title="Recently Played" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface FeedCardProps {
  feed: RSSFeed;
}

function FeedCard({ feed }: FeedCardProps) {
  const router = useRouter()
  
  const handleOpenFeed = () => {
    // In a real implementation, this would navigate to a podcast detail page
    // For now, we'll just log the feed URL
    console.log('Opening feed:', feed.feedUrl)
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {feed.imageUrl ? (
          <img 
            src={feed.imageUrl} 
            alt={feed.title} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#004977]">
            <Rss className="h-12 w-12 text-white" />
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg line-clamp-1">{feed.title}</CardTitle>
        <CardDescription className="line-clamp-1">{feed.author || 'Unknown author'}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {feed.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleOpenFeed}
        >
          View Episodes
        </Button>
      </CardFooter>
    </Card>
  )
}
