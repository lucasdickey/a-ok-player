"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Check, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { validateFeed, addFeed } from "@/lib/feed-processor"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

type FeedValidationStatus = "idle" | "validating" | "valid" | "invalid"

interface FeedMetadata {
  title: string
  description?: string
  author?: string
  imageUrl?: string
  websiteUrl?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [feedValidationStatus, setFeedValidationStatus] = useState<FeedValidationStatus>("idle")
  const [feedMetadata, setFeedMetadata] = useState<FeedMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const handleSaveFeedUrl = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a podcast feed",
        variant: "destructive"
      })
      return
    }

    if (!query) {
      toast({
        title: "Error",
        description: "Please enter a valid RSS feed URL",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    setError(null)
    
    try {
      // First validate the feed
      const validationResult = await validateFeed(query)
      
      if (!validationResult.isValid) {
        setFeedValidationStatus("invalid")
        setError(validationResult.message)
        toast({
          title: "Invalid Feed",
          description: validationResult.message,
          variant: "destructive"
        })
        return
      }
      
      setFeedValidationStatus("valid")
      setFeedMetadata({
        title: validationResult.metadata?.title || "Unknown Podcast",
        description: validationResult.metadata?.description,
        author: validationResult.metadata?.author,
        imageUrl: validationResult.metadata?.imageUrl,
        websiteUrl: validationResult.metadata?.websiteUrl
      })
      
      // Add the feed
      const result = await addFeed(user.id, query)
      
      if (result.success) {
        setSuccess(true)
        toast({
          title: "Success",
          description: "Podcast added to your library",
        })
        
        // Redirect to library after a short delay
        setTimeout(() => {
          router.push("/library")
        }, 1500)
      } else {
        setError(result.message)
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error adding feed:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "Failed to add podcast feed",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container py-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Add RSS Feed</h1>
      <p className="text-muted-foreground">
        Enter the URL of a podcast RSS feed to add it to your library
      </p>

      <div className="flex space-x-2">
        <Input
          placeholder="Enter podcast RSS feed URL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSaveFeedUrl} 
          disabled={isSearching || !query || success}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : feedValidationStatus === "valid" ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Add Feed
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feed
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feedValidationStatus === "valid" && feedMetadata && (
        <Card>
          <CardHeader>
            <CardTitle>{feedMetadata.title}</CardTitle>
            <CardDescription>{feedMetadata.author}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {feedMetadata.imageUrl && (
                <img 
                  src={feedMetadata.imageUrl} 
                  alt={feedMetadata.title} 
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  {feedMetadata.description || "No description available"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {success ? (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Podcast added to your library. Redirecting...
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "Add Feed" to add this podcast to your library
              </p>
            )}
          </CardFooter>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Popular Podcast RSS Feeds</h2>
        <div className="grid gap-4">
          <FeedSuggestion 
            title="This American Life" 
            url="https://www.thisamericanlife.org/podcast/rss.xml" 
            onSelect={(url) => setQuery(url)}
          />
          <FeedSuggestion 
            title="The Daily (New York Times)" 
            url="https://feeds.simplecast.com/54nAGcIl" 
            onSelect={(url) => setQuery(url)}
          />
          <FeedSuggestion 
            title="Planet Money (NPR)" 
            url="https://feeds.npr.org/510289/podcast.xml" 
            onSelect={(url) => setQuery(url)}
          />
          <FeedSuggestion 
            title="TED Talks Daily" 
            url="https://feeds.megaphone.fm/TPG6175046888" 
            onSelect={(url) => setQuery(url)}
          />
          <FeedSuggestion 
            title="Radiolab" 
            url="https://feeds.simplecast.com/DGRPxE8O" 
            onSelect={(url) => setQuery(url)}
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
        onClick={() => onSelect(url)}
      >
        Use
      </Button>
    </div>
  )
}
