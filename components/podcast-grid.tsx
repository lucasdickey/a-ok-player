"use client"

import Link from "next/link"
import { podcasts } from "@/lib/podcast-data"

interface PodcastGridProps {
  title?: string
  podcastIds?: string[]
}

export default function PodcastGrid({ title, podcastIds }: PodcastGridProps) {
  // Filter podcasts if podcastIds is provided
  const displayPodcasts = podcastIds
    ? podcasts.filter((podcast) => podcastIds.includes(podcast.id))
    : podcasts.slice(0, 8) // Just show first 8 if no filter

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayPodcasts.map((podcast) => (
          <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group space-y-2">
            <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group-hover:ring-2 ring-[#00CCCC] transition-all">
              <img
                src={podcast.artwork || "/placeholder.svg?height=200&width=200"}
                alt={podcast.title}
                className="h-full w-full object-cover"
              />
            </div>

            <h3 className="font-medium text-sm truncate">{podcast.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{podcast.publisher}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

