"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import PodcastGrid from "@/components/podcast-grid"
import EpisodeList from "@/components/episode-list"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setHasSearched(true)
      // In a real app, this would trigger an API call
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Search</h1>

      <form onSubmit={handleSearch} className="flex w-full max-w-3xl gap-2">
        <Input
          type="text"
          placeholder="Search podcasts, episodes, or transcripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="bg-[#004977] hover:bg-[#007187]">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {hasSearched && (
        <Tabs defaultValue="podcasts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          </TabsList>
          <TabsContent value="podcasts" className="space-y-6">
            <PodcastGrid title={`Results for "${searchQuery}"`} />
          </TabsContent>
          <TabsContent value="episodes" className="space-y-6">
            <EpisodeList title={`Episode results for "${searchQuery}"`} />
          </TabsContent>
          <TabsContent value="transcripts" className="space-y-6">
            <EpisodeList title={`Transcript matches for "${searchQuery}"`} />
          </TabsContent>
        </Tabs>
      )}

      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Search className="h-12 w-12 mb-4 text-[#009BA4]" />
          <h2 className="text-xl font-medium mb-2">Search for podcasts and episodes</h2>
          <p>Find content by podcast name, episode title, or even words in transcripts</p>
        </div>
      )}
    </div>
  )
}

