"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserFeeds,
  getRecentEpisodes,
  refreshAllFeeds,
} from "@/lib/feed-processor";
import { PodcastFeed } from "@/lib/feed-processor";
import { useAuth } from "@/components/auth/auth-provider";
import { RecentlyPlayed } from "@/components/recently-played";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Headphones,
  Play,
  Pause,
  PlusCircle,
  Radio,
  RefreshCw,
} from "lucide-react";
import { usePlayer } from "@/components/player/player-provider";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";

// Define types for episodes
interface Episode {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  description: string | null;
  published_date: string | null;
  duration: number | null;
  duration_formatted?: string;
  audio_url: string;
  image_url: string | null;
  is_played: boolean;
  podcast_subscriptions?: {
    id: string;
    title: string | null;
    image_url: string | null;
    author: string | null;
  };
}

export default function StreamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    playEpisode,
    currentEpisode,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
  } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feeds, setFeeds] = useState<PodcastFeed[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([]);

  // Load content when the component mounts or user changes
  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);

      try {
        // Get user's feeds
        const userFeeds = await getUserFeeds(user.id);
        setFeeds(userFeeds);

        // Get recent episodes
        const episodes = await getRecentEpisodes(user.id);
        setRecentEpisodes(episodes);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [user, router]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;

    setIsRefreshing(true);

    try {
      await refreshAllFeeds(user.id);

      // Reload content after refresh
      const userFeeds = await getUserFeeds(user.id);
      setFeeds(userFeeds);

      const episodes = await getRecentEpisodes(user.id);
      setRecentEpisodes(episodes);

      console.log("Content refreshed successfully");
    } catch (error) {
      console.error("Error refreshing content:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Home</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentEpisodes.length > 0 ? (
              recentEpisodes.slice(0, 8).map((episode) => (
                <Link key={episode.id} href={`/episode/${episode.id}`}>
                  <Card className="overflow-hidden w-[150px] h-[150px]">
                    <div className="relative h-[150px] w-[150px]">
                      <img
                        src={
                          episode.image_url || "/images/placeholder-podcast.png"
                        }
                        alt={episode.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1">
                        <h3 className="text-xs font-semibold text-white truncate">{episode.title}</h3>
                      </div>
                      <Button
                        variant="default"
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          // Create a player episode from the episode object
                          const playerEpisode = {
                            id: episode.id,
                            title: episode.title,
                            description: episode.description || "",
                            publishDate: episode.published_date || "",
                            duration: episode.duration_formatted || "0:00",
                            durationSeconds: episode.duration || 0,
                            podcastTitle:
                              episode.podcast_subscriptions?.title ||
                              "Unknown Podcast",
                            podcastId: episode.feed_id,
                            artwork: episode.image_url || "",
                            audioUrl:
                              episode.audio_url ||
                              "https://example-samples.netlify.app/audio/podcast-sample.mp3",
                            isNew: false,
                            isBookmarked: false,
                            progress: 0,
                          };

                          // Check if this is the current episode
                          if (
                            currentEpisode &&
                            currentEpisode.id === episode.id
                          ) {
                            togglePlayPause();
                          } else {
                            playEpisode(playerEpisode);
                          }
                          console.log(`Now playing ${episode.title}`);
                        }}
                      >
                        {currentEpisode &&
                          currentEpisode.id === episode.id &&
                          isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium">No Recent Episodes</h3>
                <p className="text-muted-foreground mt-2">
                  Subscribe to podcasts to see recent episodes here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/feeds/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Podcast
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {recentEpisodes.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/library">
                  <Headphones className="mr-2 h-4 w-4" />
                  View All Episodes
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {feeds.length > 0 ? (
              feeds.map((feed) => (
                <Card key={feed.id} className="overflow-hidden w-[150px] h-[150px]">
                  <Link href={`/feeds/${feed.id}`}>
                    <div className="relative h-[150px] w-[150px]">
                      <img
                        src={feed.image_url || "/images/placeholder-podcast.png"}
                        alt={feed.title || "Podcast"}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1">
                        <h3 className="text-xs font-semibold text-white truncate">{feed.title}</h3>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium">No Subscriptions</h3>
                <p className="text-muted-foreground mt-2">
                  Add podcast feeds to see them here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/feeds/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Podcast
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {feeds.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/feeds">
                  <Radio className="mr-2 h-4 w-4" />
                  View All Podcasts
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
