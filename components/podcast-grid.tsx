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
      {title && <h2 className="text-xl font-bold text-[#040605]">{title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPodcasts.map((podcast) => (
          <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group">
            <div className="flex items-center bg-[#040605] rounded-lg overflow-hidden hover:bg-[#040605]/90 transition-all p-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                <img
                  src={podcast.artwork || "/placeholder.svg?height=200&width=200"}
                  alt={podcast.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#f9f0dc] truncate">{podcast.title}</h3>
                <p className="text-sm text-[#f9f0dc]/70 truncate">{podcast.publisher}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-[#f9f0dc]/50 mr-2">11 minutes ago</span>
                </div>
              </div>
              
              <div className="ml-2">
                <button className="text-[#f9f0dc] hover:text-[#c32b1a] focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
