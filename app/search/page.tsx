"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMockAuth } from "@/components/auth/mock-auth-provider"
import { fetchRSSFeed, saveRSSFeed, RSSFeedMetadata } from "@/lib/rss-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AddRSSFeedPage() {
  const [feedUrl, setFeedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [feedPreview, setFeedPreview] = useState<RSSFeedMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { user } = useMockAuth()

  const handleFetchFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedUrl.trim()) {
      setError("Please enter a valid RSS feed URL")
      return
    }

    setIsLoading(true)
    setError(null)
    setFeedPreview(null)
    setSuccess(false)

    try {
      // Validate URL format
      new URL(feedUrl)
      
      const feedData = await fetchRSSFeed(feedUrl)
      
      if (!feedData) {
        setError("Unable to fetch podcast data from this URL. Please check the URL and try again.")
        return
      }
      
      setFeedPreview(feedData)
    } catch (err) {
      setError("Please enter a valid URL (including http:// or https://)")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToLibrary = async () => {
    if (!user || !feedPreview) return
    
    setIsLoading(true)
    
    try {
      const { error } = await saveRSSFeed(user.id, feedUrl, feedPreview)
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        })
        return
      }
      
      setSuccess(true)
      toast({
        title: "Success!",
        description: `"${feedPreview.title}" has been added to your library.`,
      })
    } catch (err) {
      toast({
        title: "An error occurred",
        description: "Unable to add podcast to your library. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Add RSS Feed</h1>
      <p className="text-muted-foreground">
        Enter the URL of a podcast RSS feed to add it to your library
      </p>

      <form onSubmit={handleFetchFeed} className="flex w-full gap-2">
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
          className="bg-[#004977] hover:bg-[#007187]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
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
              className="bg-[#009BA4] hover:bg-[#007A82] w-full"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding to Library...
                </>
              ) : success ? (
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
            onSelect={(url) => setFeedUrl(url)}
          />
          <FeedSuggestion 
            title="The Daily (New York Times)" 
            url="https://feeds.simplecast.com/54nAGcIl" 
            onSelect={(url) => setFeedUrl(url)}
          />
          <FeedSuggestion 
            title="Planet Money (NPR)" 
            url="https://feeds.npr.org/510289/podcast.xml" 
            onSelect={(url) => setFeedUrl(url)}
          />
          <FeedSuggestion 
            title="TED Talks Daily" 
            url="https://feeds.megaphone.fm/HSW7591467563" 
            onSelect={(url) => setFeedUrl(url)}
          />
        </div>
      </div>
    </div>
  )
}

interface FeedSuggestionProps {
  title: string
  url: string
  onSelect: (url: string) => void
}

function FeedSuggestion({ title, url, onSelect }: FeedSuggestionProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground truncate max-w-md">{url}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onSelect(url)}
      >
        Use
      </Button>
    </div>
  )
}
