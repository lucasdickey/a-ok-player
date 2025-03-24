"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Share2, Rss, Bell, Info, ExternalLink } from "lucide-react"
import PodcastEpisodeList from "@/components/podcast/podcast-episode-list"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPodcastById } from "@/lib/podcast-data"
import { usePlayer } from "@/components/player/player-provider"

interface PodcastPageProps {
  params: {
    id: string
  }
}

export default function PodcastPage({ params }: PodcastPageProps) {
  const { id } = params
  const [podcast, setPodcast] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { currentEpisode } = usePlayer()

  useEffect(() => {
    // In a real app, this would be an API call
    const podcastData = getPodcastById(id)
    setPodcast(podcastData)
  }, [id])

  if (!podcast) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="h-64 bg-muted rounded max-w-md mx-auto"></div>
          <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="h-8 bg-muted rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  const toggleSubscribe = () => {
    setIsSubscribed(!isSubscribed)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-48 h-48 bg-[#9EDEDA] rounded-lg flex-shrink-0 mx-auto md:mx-0 overflow-hidden">
          <img
            src={podcast.artwork || "/placeholder.svg?height=400&width=400"}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#007187]">
              <span>{podcast.publisher}</span>
              {podcast.explicit && (
                <Badge variant="outline" className="text-xs bg-[#ED9FBA]/20 text-[#CE2090] border-[#CE2090]">
                  Explicit
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground">{podcast.title}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={isSubscribed ? "bg-[#00CCCC] hover:bg-[#009BA4]" : "bg-[#004977] hover:bg-[#007187]"}
                    onClick={toggleSubscribe}
                  >
                    <Rss className="h-4 w-4 mr-2" />
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get notified of new episodes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="border-[#007187] text-[#007187] hover:bg-[#D8EFE9]">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Customize notification settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              className={`border-[#007187] ${isFavorite ? "text-[#CE2090]" : "text-[#007187]"} hover:bg-[#D8EFE9]`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-[#CE2090]" : ""}`} />
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>

            <Button variant="outline" className="border-[#007187] text-[#007187] hover:bg-[#D8EFE9]">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{podcast.episodeCount}</span> episodes
            </div>
            <div>
              <span className="font-medium text-foreground">{podcast.frequency}</span> frequency
            </div>
            <div>
              <span className="font-medium text-foreground">Last updated:</span> {podcast.lastUpdated}
            </div>
            <div>
              <span className="font-medium text-foreground">{podcast.language}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {podcast.categories.map((category: any, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <Badge className="bg-[#D8EFE9] text-[#004977] hover:bg-[#9EDEDA]">{category.main}</Badge>
                {category.sub.map((sub: string, subIndex: number) => (
                  <Badge key={subIndex} variant="outline" className="border-[#9EDEDA] text-[#007187]">
                    {sub}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="prose max-w-none text-muted-foreground">
        <p>{podcast.description}</p>
      </div>

      <Separator />

      <Tabs defaultValue="episodes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="similar">Similar Podcasts</TabsTrigger>
        </TabsList>
        <TabsContent value="episodes" className="space-y-6">
          <PodcastEpisodeList podcastId={id} />
        </TabsContent>
        <TabsContent value="about" className="space-y-6">
          <div className="prose max-w-none">
            <h2>About {podcast.title}</h2>
            <p>{podcast.description}</p>

            <h3>Publisher Information</h3>
            <p>
              <strong>Publisher:</strong> {podcast.publisher}
              <br />
              <strong>Website:</strong>{" "}
              <a
                href={podcast.website}
                className="text-[#007187] hover:text-[#00CCCC]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {podcast.website} <ExternalLink className="h-3 w-3 inline" />
              </a>
              <br />
              <strong>Language:</strong> {podcast.language}
              <br />
              <strong>Update Frequency:</strong> {podcast.frequency}
              <br />
              <strong>Categories:</strong> {podcast.categories.map((c: any) => c.main).join(", ")}
            </p>

            <div className="flex items-center gap-2 mt-6">
              <Info className="h-5 w-5 text-[#007187]" />
              <p className="text-sm text-muted-foreground italic">
                Podcast information is sourced from the publisher's RSS feed at{" "}
                <a
                  href={podcast.feedUrl}
                  className="text-[#007187] hover:text-[#00CCCC]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {podcast.feedUrl}
                </a>
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="similar" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {podcasts
              .filter((p: any) => p.id !== id)
              .slice(0, 4)
              .map((similarPodcast: any) => (
                <a key={similarPodcast.id} href={`/podcast/${similarPodcast.id}`} className="space-y-2 group">
                  <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group-hover:ring-2 ring-[#00CCCC]">
                    <img
                      src={similarPodcast.artwork || "/placeholder.svg?height=200&width=200"}
                      alt={similarPodcast.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-[#007187]">{similarPodcast.title}</h3>
                  <p className="text-xs text-muted-foreground">{similarPodcast.publisher}</p>
                </a>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data for similar podcasts
const podcasts = [
  {
    id: "indie-hackers",
    title: "Indie Hackers",
    publisher: "Courtland Allen",
    artwork: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "my-first-million",
    title: "My First Million",
    publisher: "Shaan Puri & Sam Parr",
    artwork: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "software-social",
    title: "Software Social",
    publisher: "Michele Hansen & Colleen Schnettger",
    artwork: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "startups-for-the-rest-of-us",
    title: "Startups For the Rest of Us",
    publisher: "Rob Walling",
    artwork: "/placeholder.svg?height=200&width=200",
  },
]

