"use client"

import { usePlayer } from "@/components/player/player-provider"
import { Button } from "@/components/ui/button"
import { Play, ListPlus, Pause } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllEpisodes } from "@/lib/podcast-data"

export function RecentlyPlayed() {
  const { playEpisode, currentEpisode, isPlaying, togglePlayPause } = usePlayer()
  const [recentEpisodes, setRecentEpisodes] = useState<any[]>([])

  useEffect(() => {
    // In a real app, this would be fetched from an API or local storage
    // For demo purposes, we'll use episodes with progress
    const allEpisodes = getAllEpisodes()
    const episodesWithProgress = allEpisodes.filter((ep) => ep.progress > 0)

    // If we don't have enough episodes with progress, add some random ones
    if (episodesWithProgress.length < 5) {
      const randomEpisodes = allEpisodes
        .filter((ep) => ep.progress === 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5 - episodesWithProgress.length)

      setRecentEpisodes([...episodesWithProgress, ...randomEpisodes])
    } else {
      setRecentEpisodes(episodesWithProgress.slice(0, 5))
    }
  }, [])

  const handlePlayPause = (episode: any) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause()
    } else {
      playEpisode(episode)
    }
  }

  if (recentEpisodes.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {recentEpisodes.map((episode) => (
        <div key={episode.id} className="space-y-2">
          <div className="relative aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group">
            <img
              src={episode.artwork || "/placeholder.svg?height=80&width=80"}
              alt={episode.podcastTitle}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                className={`bg-white/20 hover:bg-white/30 text-white ${
                  currentEpisode?.id === episode.id && isPlaying ? "bg-white/40" : ""
                }`}
                onClick={() => handlePlayPause(episode)}
              >
                {currentEpisode?.id === episode.id && isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button size="icon" className="bg-white/20 hover:bg-white/30 text-white">
                <ListPlus className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress bar */}
            {episode.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                <div className="h-full bg-[#00CCCC]" style={{ width: `${episode.progress}%` }}></div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-sm truncate">{episode.title}</h3>
            <Link
              href={`/podcast/${episode.podcastId}`}
              className="text-xs text-muted-foreground hover:text-[#007187] truncate block"
            >
              {episode.podcastTitle}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

