import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PodcastGrid from "@/components/podcast-grid"
import EpisodeList from "@/components/episode-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function LibraryPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
        <Button className="bg-[#004977] hover:bg-[#007187]">
          <PlusCircle className="h-4 w-4 mr-2" />
          Discover New Podcasts
        </Button>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="saved">Saved Episodes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="space-y-6">
          <PodcastGrid title="Your Subscribed Podcasts" />
        </TabsContent>
        <TabsContent value="saved" className="space-y-6">
          <EpisodeList title="Your Saved Episodes" />
        </TabsContent>
        <TabsContent value="history" className="space-y-6">
          <EpisodeList title="Recently Played" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

