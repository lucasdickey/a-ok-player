"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, ListPlus, Play, Clock, Calendar, Bookmark, BookmarkCheck, Pause } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getEpisodeById } from "@/lib/podcast-data"
import { usePlayer } from "@/components/player/player-provider"
import Link from "next/link"

interface EpisodePageProps {
  params: {
    id: string
  }
}

export default function EpisodePage({ params }: EpisodePageProps) {
  const { id } = params
  const [episode, setEpisode] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { playEpisode, addToQueue, currentEpisode, isPlaying, togglePlayPause } = usePlayer()

  useEffect(() => {
    // In a real app, this would be an API call
    const episodeData = getEpisodeById(id)
    setEpisode(episodeData)

    if (episodeData) {
      setIsBookmarked(episodeData.isBookmarked)
    }
  }, [id])

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handlePlayPause = () => {
    if (episode) {
      if (currentEpisode?.id === episode.id) {
        togglePlayPause()
      } else {
        playEpisode(episode)
      }
    }
  }

  if (!episode) {
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

  // Mock show notes and transcript availability
  const showNotes = [
    "This episode features a discussion on bootstrapping businesses.",
    "Resources mentioned in this episode can be found on our website.",
    "Follow the host on Twitter for more insights and updates.",
  ]

  const hasTranscript = true

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-48 h-48 bg-[#9EDEDA] rounded-lg flex-shrink-0 mx-auto md:mx-0 overflow-hidden">
          <img
            src={episode.artwork || "/placeholder.svg?height=400&width=400"}
            alt={episode.podcastTitle}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-[#007187]">
              <Link href={`/podcast/${episode.podcastId}`} className="hover:underline">
                {episode.podcastTitle}
              </Link>
            </h2>
            <h1 className="text-3xl font-bold text-foreground">{episode.title}</h1>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {episode.publishDate}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {episode.duration}
            </div>
            {hasTranscript && (
              <Badge variant="outline" className="border-[#9EDEDA] text-[#007187]">
                Transcript Available
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className={
                currentEpisode?.id === episode.id && isPlaying
                  ? "bg-[#00CCCC] hover:bg-[#009BA4]"
                  : "bg-[#004977] hover:bg-[#007187]"
              }
              onClick={handlePlayPause}
            >
              {currentEpisode?.id === episode.id && isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Episode
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play Episode
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#007187] text-[#007187] hover:bg-[#D8EFE9]">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add to Queue
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addToQueue(episode, true)}>Play Next</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addToQueue(episode)}>Add to End of Queue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className={`border-[#007187] ${isBookmarked ? "text-[#CE2090]" : "text-[#007187]"} hover:bg-[#D8EFE9]`}
              onClick={toggleBookmark}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2 fill-[#CE2090]" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>

            <Button variant="outline" className="border-[#007187] text-[#007187] hover:bg-[#D8EFE9]">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="prose max-w-none">
        <h2>Episode Description</h2>
        <p>{episode.description}</p>

        <h3>Show Notes</h3>
        <ul>
          {showNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>

        {hasTranscript && (
          <>
            <h3>Transcript</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                [This is a sample transcript for demonstration purposes. In a real application, this would contain the
                full transcript of the episode.]
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Host:</strong> Welcome to another episode of {episode.podcastTitle}. Today we're discussing...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Guest:</strong> Thanks for having me. I'm excited to share my thoughts on...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Host:</strong> Let's start by talking about the main challenges entrepreneurs face when...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

