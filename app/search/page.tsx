"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Check, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchRSSFeed, saveRSSFeedUrl, updateRSSFeedMetadata, SavedRSSFeed } from "../../lib/rss-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function AddRSSFeedPage() {
  const [feedUrl, setFeedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [feedPreview, setFeedPreview] = useState<any | null>(null)
  const [savedFeed, setSavedFeed] = useState<SavedRSSFeed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const handleSaveFeedUrl = async () => {
    if (!feedUrl.trim()) {
      setError("Please enter a valid RSS feed URL")
      return
    }

    if (!user) {
      setError("You must be logged in to add feeds")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate URL format
      try {
        new URL(feedUrl)
      } catch (urlError) {
        setError("Please enter a valid URL (including http:// or https://)")
        setIsLoading(false)
        return
      }
      
      // Save the feed URL first
      const saveResult = await saveRSSFeedUrl(user.id, feedUrl)
      
      if (saveResult.error) {
        setError(saveResult.error.message || "Error saving feed URL")
        setIsLoading(false)
        return
      }
      
      // Store the saved feed
      setSavedFeed(saveResult.data)
      
      toast({
        title: "Feed URL saved",
        description: "The feed URL has been saved to your library. Fetching metadata...",
      })
      
      // Now fetch the metadata
      setIsFetching(true)
      fetchFeedMetadata(feedUrl, saveResult.data?.id)
    } catch (err: any) {
      console.error("Error saving feed URL:", err)
      setError(err.message || "Error saving feed URL. Please try again.")
      setIsLoading(false)
    }
  }
  
  const fetchFeedMetadata = async (url: string, feedId?: string) => {
    try {
      // Set a timeout to prevent infinite loading
      const fetchTimeout = setTimeout(() => {
        if (isFetching) {
          setIsFetching(false)
          setIsLoading(false)
          toast({
            title: "Feed saved but metadata fetch timed out",
            description: "Your feed was saved but we couldn't fetch the details. You can try refreshing later.",
          })
        }
      }, 20000) // 20 second timeout
      
      const feedData = await fetchRSSFeed(url)
      
      clearTimeout(fetchTimeout)
      
      if (feedData) {
        setFeedPreview(feedData)
        
        // Update the feed metadata if we have a feed ID
        if (feedId) {
          await updateRSSFeedMetadata(feedId, feedData)
        }
        
        toast({
          title: "Feed fetched successfully",
          description: `Found podcast: ${feedData.title}`,
        })
      } else {
        toast({
          title: "Feed saved with errors",
          description: "The feed URL was saved but we couldn't fetch the podcast details. You can try refreshing later.",
        })
        
        if (feedId) {
          await updateRSSFeedMetadata(feedId, null, "Failed to fetch feed metadata")
        }
      }
    } catch (err: any) {
      console.error("Error fetching feed metadata:", err)
      toast({
        title: "Feed saved with errors",
        description: err.message || "Error fetching podcast details. The URL was saved but details couldn't be loaded.",
      })
      
      if (feedId) {
        await updateRSSFeedMetadata(feedId, null, err.message || "Error fetching feed")
      }
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }

  const handleAddToLibrary = async () => {
    // If we've already saved the feed URL and have a feed ID, just navigate to library
    if (savedFeed) {
      toast({
        title: "Success!",
        description: "The podcast has been added to your library.",
      })
      
      // Navigate to library after a short delay
      setTimeout(() => {
        router.push('/library')
      }, 1500)
      return
    }
    
    // Otherwise, save the feed URL and fetch metadata
    handleSaveFeedUrl()
  }

  const handleTryPopularFeed = (url: string) => {
    setFeedUrl(url)
    // Auto-submit the form
    const fetchFeed = async () => {
      setIsLoading(true)
      setIsFetching(true)
      setError(null)
      setFeedPreview(null)
      setSuccess(false)
      setSavedFeed(null)
      
      try {
        const feedData = await fetchRSSFeed(url)
        
        if (!feedData) {
          setError("Unable to fetch podcast data from this URL. Please try another feed.")
          setIsLoading(false)
          setIsFetching(false)
          return
        }
        
        setFeedPreview(feedData)
        toast({
          title: "Feed fetched successfully",
          description: `Found podcast: ${feedData.title}`,
        })
      } catch (err: any) {
        console.error("Error fetching feed:", err)
        setError(err.message || "Error fetching feed. Please try a different URL.")
      } finally {
        setIsLoading(false)
        setIsFetching(false)
      }
    }
    
    fetchFeed()
  }

  return (
    <div className="container py-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Add RSS Feed</h1>
      <p className="text-muted-foreground">
        Enter the URL of a podcast RSS feed to add it to your library
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveFeedUrl(); }} className="flex w-full gap-2">
        <Input
          type="text"
          placeholder="https://feeds.example.com/podcast.xml"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-[#c32b1a] hover:bg-[#a82315]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isFetching ? "Fetching..." : "Saving..."}
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Fetch Feed
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {savedFeed && !feedPreview && !error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Feed URL Saved</AlertTitle>
          <AlertDescription>
            The feed URL has been saved to your library. We're still trying to fetch the podcast details.
          </AlertDescription>
        </Alert>
      )}

      {feedPreview && (
        <Card>
          <CardHeader>
            <CardTitle>{feedPreview.title}</CardTitle>
            <CardDescription>{feedPreview.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {feedPreview.imageUrl && (
                <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={feedPreview.imageUrl} 
                    alt={feedPreview.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{feedPreview.description}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddToLibrary} 
              className="bg-[#c32b1a] hover:bg-[#a82315] w-full"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isFetching ? "Fetching Details..." : "Adding to Library..."}
                </>
              ) : savedFeed ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to Library
                </>
              ) : (
                "Add to Library"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Popular Podcast RSS Feeds</h2>
        <div className="grid gap-4">
          <FeedSuggestion 
            title="This American Life" 
            url="https://www.thisamericanlife.org/podcast/rss.xml" 
            onSelect={handleTryPopularFeed}
          />
          <FeedSuggestion 
            title="The Daily (New York Times)" 
            url="https://feeds.simplecast.com/54nAGcIl" 
            onSelect={handleTryPopularFeed}
          />
          <FeedSuggestion 
            title="Planet Money (NPR)" 
            url="https://feeds.npr.org/510289/podcast.xml" 
            onSelect={handleTryPopularFeed}
          />
          <FeedSuggestion 
            title="TED Talks Daily" 
            url="https://feeds.megaphone.fm/TPG6175046888" 
            onSelect={handleTryPopularFeed}
          />
          <FeedSuggestion 
            title="Radiolab" 
            url="https://feeds.simplecast.com/DGRPxE8O" 
            onSelect={handleTryPopularFeed}
          />
        </div>
      </div>
    </div>
  )
}

interface FeedSuggestionProps {
  title: string;
  url: string;
  onSelect: (url: string) => void;
}

function FeedSuggestion({ title, url, onSelect }: FeedSuggestionProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground truncate max-w-md">{url}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="bg-[#c32b1a] hover:bg-[#a82315]"
        onClick={() => onSelect(url)}
      >
        Use
      </Button>
    </div>
  )
}
