"use client"
import { Play, ListPlus, Heart, MoreHorizontal, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/components/player/player-provider"

interface EpisodeListProps {
  title?: string
  podcastId?: string
}

export default function EpisodeList({ title, podcastId }: EpisodeListProps) {
  const { playEpisode, addToQueue } = usePlayer()

  // In a real app, you would fetch episodes based on podcastId
  // For now, we'll use mock data
  const episodes = Array.from({ length: 10 }, (_, i) => ({
    id: `episode-${i + 1}`,
    title: `Episode ${i + 1}: The one about podcasting and technology`,
    description: "This is a sample episode description that would typically be much longer and more detailed.",
    publishDate: new Date(2023, 2, 20 - i).toLocaleDateString(),
    duration: `${Math.floor(Math.random() * 60) + 20}:${Math.floor(Math.random() * 60)
      .toString()
      .padStart(2, "0")}`,
    podcastTitle: "The Daily",
    artwork: `/placeholder.svg?height=80&width=80`,
    audio: "https://example.com/episode.mp3",
  }))

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}

      <div className="space-y-2">
        {episodes.map((episode) => (
          <div key={episode.id} className="flex items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="h-16 w-16 rounded bg-[#9EDEDA] mr-4 flex-shrink-0">
              <img
                src={episode.artwork || "/placeholder.svg"}
                alt={episode.podcastTitle}
                className="h-full w-full object-cover rounded"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{episode.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{episode.description}</p>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {episode.duration}
                </div>
                <div>{episode.publishDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  playEpisode({
                    id: episode.id,
                    title: episode.title,
                    podcastTitle: episode.podcastTitle,
                    artwork: episode.artwork,
                    audio: episode.audio,
                    duration: 1800, // Mock duration in seconds
                  })
                }
                className="text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9]"
              >
                <Play className="h-4 w-4" />
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
                  <DropdownMenuItem
                    onClick={() =>
                      addToQueue(
                        {
                          id: episode.id,
                          title: episode.title,
                          podcastTitle: episode.podcastTitle,
                          artwork: episode.artwork,
                          audio: episode.audio,
                          duration: 1800, // Mock duration in seconds
                        },
                        true,
                      )
                    }
                  >
                    Play Next
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      addToQueue({
                        id: episode.id,
                        title: episode.title,
                        podcastTitle: episode.podcastTitle,
                        artwork: episode.artwork,
                        audio: episode.audio,
                        duration: 1800, // Mock duration in seconds
                      })
                    }
                  >
                    Add to End of Queue
                  </DropdownMenuItem>
                  <DropdownMenuItem>Save for Later</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" variant="ghost" className="text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9]">
                <Heart className="h-4 w-4" />
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
                  <DropdownMenuItem>View Episode Details</DropdownMenuItem>
                  <DropdownMenuItem>View Podcast</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

