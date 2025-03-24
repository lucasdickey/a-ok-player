"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { podcasts } from "@/lib/podcast-data"
import FeaturedPodcasts from "@/components/featured-podcasts"
import { RecentlyPlayed } from "@/components/recently-played"
import Link from "next/link"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container py-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Discover Podcasts</h1>
        <FeaturedPodcasts />
      </section>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New Releases</TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              : // Actual podcast data
                podcasts.map((podcast) => (
                  <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group space-y-2">
                    <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group-hover:ring-2 ring-[#00CCCC] transition-all">
                      <img
                        src={podcast.artwork || "/placeholder.svg?height=200&width=200"}
                        alt={podcast.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm truncate group-hover:text-[#007187]">{podcast.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{podcast.publisher}</p>
                  </Link>
                ))}
          </div>
        </TabsContent>
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Technology",
              "Business",
              "News",
              "Comedy",
              "True Crime",
              "Health",
              "Education",
              "Entertainment",
              "Society & Culture",
              "Arts",
              "Science",
              "Sports",
              "Music",
              "History",
              "Religion & Spirituality",
              "Government",
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="h-24 text-lg font-medium bg-[#D8EFE9] hover:bg-[#9EDEDA] text-[#004977] border-none"
              >
                {category}
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              : // Trending podcasts (using the same data for demo)
                podcasts
                  .slice(0, 5)
                  .map((podcast) => (
                    <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group space-y-2">
                      <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group-hover:ring-2 ring-[#00CCCC] transition-all">
                        <img
                          src={podcast.artwork || "/placeholder.svg?height=200&width=200"}
                          alt={podcast.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate group-hover:text-[#007187]">{podcast.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{podcast.publisher}</p>
                    </Link>
                  ))}
          </div>
        </TabsContent>
        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading
              ? // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              : // New releases (using reversed order for demo)
                [...podcasts]
                  .reverse()
                  .slice(0, 5)
                  .map((podcast) => (
                    <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="group space-y-2">
                      <div className="aspect-square bg-[#9EDEDA] rounded-lg overflow-hidden group-hover:ring-2 ring-[#00CCCC] transition-all">
                        <img
                          src={podcast.artwork || "/placeholder.svg?height=200&width=200"}
                          alt={podcast.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate group-hover:text-[#007187]">{podcast.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{podcast.publisher}</p>
                    </Link>
                  ))}
          </div>
        </TabsContent>
      </Tabs>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recently Played</h2>
        <RecentlyPlayed />
      </section>
    </div>
  )
}

