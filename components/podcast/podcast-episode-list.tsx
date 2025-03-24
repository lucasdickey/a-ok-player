"use client"

import { useState, useEffect } from "react"
import { Play, ListPlus, MoreHorizontal, Clock, Calendar, Bookmark, BookmarkCheck, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/components/player/player-provider"
import Link from "next/link"
import { getEpisodesByPodcastId } from "@/lib/podcast-data"

interface PodcastEpisodeListProps {
  podcastId: string
}

export default function PodcastEpisodeList({ podcastId }: PodcastEpisodeListProps) {
  const { playEpisode, addToQueue, currentEpisode, isPlaying, togglePlayPause } = usePlayer()
  const [episodes, setEpisodes] = useState<any[]>([])

  useEffect(() => {
    // In a real app, this would be an API call
    const podcastEpisodes = getEpisodesByPodcastId(podcastId)
    setEpisodes(podcastEpisodes)
  }, [podcastId])

  const [bookmarkedEpisodes, setBookmarkedEpisodes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (episodes.length > 0) {
      setBookmarkedEpisodes(
        episodes.reduce(
          (acc, episode) => {
            acc[episode.id] = episode.isBookmarked
            return acc
          },
          {} as Record<string, boolean>,
        ),
      )
    }
  }, [episodes])

  const toggleBookmark = (episodeId: string) => {
    setBookmarkedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }))
  }

  const handlePlayPause = (episode: any) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause()
    } else {
      playEpisode(episode)
    }
  }

  const addAllToQueue = () => {
    episodes.forEach((episode) => {
      addToQueue(episode)
    })
  }

  if (episodes.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start p-4 rounded-lg border">
            <div className="h-20 w-20 bg-muted rounded mr-4"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">All Episodes</h2>
        <Button variant="outline" size="sm" className="text-[#007187]" onClick={addAllToQueue}>
          <ListPlus className="h-4 w-4 mr-2" />
          Add All to Queue
        </Button>
      </div>

      <div className="space-y-4">
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className="flex flex-col md:flex-row md:items-start p-4 rounded-lg border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start flex-1">
              <div className="h-20 w-20 rounded bg-[#9EDEDA] mr-4 flex-shrink-0 overflow-hidden relative">
                <img
                  src={episode.artwork || "/placeholder.svg?height=80&width=80"}
                  alt={episode.podcastTitle}
                  className="h-full w-full object-cover"
                />

                {/* Progress indicator */}
                {episode.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div className="h-full bg-[#00CCCC]" style={{ width: `${episode.progress}%` }}></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {episode.isNew && <Badge className="bg-[#FAE67E] text-[#004977] hover:bg-[#FCEFB9]">New</Badge>}

                  <Link href={`/episode/${episode.id}`} className="font-medium hover:text-[#007187] hover:underline">
                    {episode.title}
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{episode.description}</p>

                <div className="flex items-center flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {episode.publishDate}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {episode.duration}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4">
              <Button
                size="sm"
                onClick={() => handlePlayPause(episode)}
                className={
                  currentEpisode?.id === episode.id && isPlaying
                    ? "bg-[#00CCCC] hover:bg-[#009BA4]"
                    : "bg-[#004977] hover:bg-[#007187]"
                }
              >
                {currentEpisode?.id === episode.id && isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9]"
                  >
                    <ListPlus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => addToQueue(episode, true)}>Play Next</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addToQueue(episode)}>Add to End of Queue</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggleBookmark(episode.id)}
                className={`${
                  bookmarkedEpisodes[episode.id]
                    ? "text-[#CE2090] hover:text-[#CE2090] hover:bg-[#ED9FBA]/20"
                    : "text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9]"
                }`}
              >
                {bookmarkedEpisodes[episode.id] ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9]"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Share Episode</DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/episode/${episode.id}`} className="w-full">
                      View Episode Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Download Episode</DropdownMenuItem>
                  <DropdownMenuItem>Report Issue</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

