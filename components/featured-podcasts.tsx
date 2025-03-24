"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { podcasts } from "@/lib/podcast-data"

export default function FeaturedPodcasts() {
  // For demo purposes, we'll use the first podcast as featured
  const featuredPodcast = podcasts[0]

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#004977] to-[#009BA4] text-white">
      <div className="flex flex-col md:flex-row items-center">
        <div className="p-6 md:p-8 flex-1 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-white/80">Featured Podcast</h2>
            <h3 className="text-2xl md:text-3xl font-bold">{featuredPodcast.title}</h3>
            <p className="text-sm text-white/80">{featuredPodcast.publisher}</p>
          </div>

          <p className="text-sm md:text-base max-w-md line-clamp-3">{featuredPodcast.description}</p>

          <Link
            href={`/podcast/${featuredPodcast.id}`}
            className="inline-flex items-center text-sm font-medium hover:underline"
          >
            Explore Episodes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="md:w-1/3 lg:w-1/4 p-4 md:p-0">
          <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden">
            <img
              src={featuredPodcast.artwork || "/placeholder.svg?height=400&width=400"}
              alt={featuredPodcast.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

