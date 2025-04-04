"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserFeeds,
  getFeedEpisodes,
  refreshFeed,
} from "@/lib/feed-processor";
import { PodcastFeed } from "@/lib/feed-processor";
import { useAuth } from "@/components/auth/auth-provider";
import { usePlayer } from "@/components/player/player-provider";
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
}

export default function LibraryPage() {
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
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<PodcastFeed[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  // Load feeds when the component mounts or user changes
  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const loadFeeds = async () => {
      setIsLoading(true);

      try {
        const userFeeds = await getUserFeeds(user.id);
        setFeeds(userFeeds);

        // If there are feeds, select the first one by default
        if (userFeeds.length > 0) {
          setSelectedFeed(userFeeds[0].id);
          const feedEpisodes = await getFeedEpisodes(userFeeds[0].id);
          setEpisodes(feedEpisodes);
        }
      } catch (error) {
        console.error("Error loading feeds:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeeds();
  }, [user, router]);

  // Load episodes when the selected feed changes
  useEffect(() => {
    if (!selectedFeed) return;

    const loadEpisodes = async () => {
      setIsLoading(true);

      try {
        const feedEpisodes = await getFeedEpisodes(selectedFeed);
        setEpisodes(feedEpisodes);
      } catch (error) {
        console.error("Error loading episodes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();
  }, [selectedFeed]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user || !selectedFeed) return;

    setIsRefreshing(true);

    try {
      await refreshFeed(user.id, selectedFeed);

      // Reload episodes after refresh
      const feedEpisodes = await getFeedEpisodes(selectedFeed);
      setEpisodes(feedEpisodes);

      console.log("Podcast refreshed successfully");
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading && feeds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedPodcast = feeds.find((feed) => feed.id === selectedFeed);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#040605]">Library</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || !selectedFeed}
            className="text-[#040605] border-[#040605]/20 hover:bg-[#f9f0dc]"
          >
            {isRefreshing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#c32b1a] border-t-transparent"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]"
          >
            <Link href="/feeds/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Podcast
            </Link>
          </Button>
        </div>
      </div>

      {feeds.length === 0 ? (
        <div className="text-center py-12 bg-[#f8f0db]/50 rounded-lg">
          <Radio className="h-12 w-12 text-[#c32b1a] mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#040605]">
            Your library is empty
          </h2>
          <p className="text-[#040605]/70 mt-2 mb-6">
            Add podcast feeds to start building your library
          </p>
          <Button
            asChild
            className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]"
          >
            <Link href="/feeds/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Podcast
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#040605] mb-3">
              Your Podcasts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFeed === feed.id
                      ? "bg-[#040605] text-[#f9f0dc]"
                      : "bg-[#f8f0db] text-[#040605] hover:bg-[#f8f0db]/80"
                  }`}
                  onClick={() => setSelectedFeed(feed.id)}
                >
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg mr-3 overflow-hidden flex-shrink-0">
                      <img
                        src={feed.image_url || "/images/a-ok-player-logo.png"}
                        alt={feed.title || "Podcast"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{feed.title}</h3>
                      <p
                        className={`text-sm truncate ${
                          selectedFeed === feed.id
                            ? "text-[#f9f0dc]/70"
                            : "text-[#040605]/70"
                        }`}
                      >
                        {feed.author || "Unknown publisher"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPodcast && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-[#f8f0db]/30 rounded-lg">
                <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      selectedPodcast.image_url ||
                      "/images/a-ok-player-logo.png"
                    }
                    alt={selectedPodcast.title || "Podcast"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-[#040605]">
                    {selectedPodcast.title}
                  </h2>
                  <p className="text-[#040605]/70">{selectedPodcast.author}</p>
                  <p className="text-sm mt-2 text-[#040605]/80 line-clamp-3">
                    {selectedPodcast.description}
                  </p>
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-[#f8f0db]/50 text-[#040605]">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-[#c32b1a] data-[state=active]:text-[#f9f0dc]"
                  >
                    All Episodes
                  </TabsTrigger>
                  <TabsTrigger
                    value="unplayed"
                    className="data-[state=active]:bg-[#c32b1a] data-[state=active]:text-[#f9f0dc]"
                  >
                    Unplayed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c32b1a]"></div>
                    </div>
                  ) : episodes.length === 0 ? (
                    <div className="text-center py-12 bg-[#f8f0db]/30 rounded-lg">
                      <p className="text-[#040605]/70">No episodes found</p>
                    </div>
                  ) : (
                    episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="bg-[#040605] rounded-lg overflow-hidden hover:bg-[#040605]/90 transition-all"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1 min-w-0 mr-4">
                              <h3 className="font-medium text-[#f9f0dc] truncate">
                                {episode.title}
                              </h3>
                              <div className="flex items-center text-xs text-[#f9f0dc]/60">
                                <span>
                                  {episode.published_date
                                    ? new Date(
                                        episode.published_date
                                      ).toLocaleDateString()
                                    : "Unknown date"}
                                </span>
                                <span className="mx-2">•</span>
                                <span>
                                  {episode.duration_formatted || "0:00"}
                                </span>
                              </div>
                              <p className="text-sm text-[#f9f0dc]/70 line-clamp-2 mt-2">
                                {episode.description ||
                                  "No description available"}
                              </p>

                              {currentEpisode &&
                                currentEpisode.id === episode.id && (
                                  <div className="mt-2 space-y-1">
                                    <Progress
                                      value={(currentTime / duration) * 100}
                                      className="h-1 bg-[#f9f0dc]/20"
                                    />
                                    <div className="flex justify-between text-xs text-[#f9f0dc]/70">
                                      <span>{formatDuration(currentTime)}</span>
                                      <span>{formatDuration(duration)}</span>
                                    </div>
                                  </div>
                                )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#f9f0dc] hover:text-[#c32b1a] hover:bg-transparent h-10 w-10 rounded-full flex-shrink-0"
                              onClick={() => {
                                // Create a player episode from the episode object
                                const playerEpisode = {
                                  id: episode.id,
                                  title: episode.title,
                                  description: episode.description || "",
                                  publishDate: episode.published_date || "",
                                  duration:
                                    episode.duration_formatted || "0:00",
                                  durationSeconds: episode.duration || 0,
                                  podcastTitle:
                                    selectedPodcast?.title || "Unknown Podcast",
                                  podcastId: episode.feed_id,
                                  artwork:
                                    episode.image_url ||
                                    selectedPodcast?.image_url ||
                                    "",
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
                                <Pause className="h-5 w-5" />
                              ) : (
                                <Play className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="unplayed" className="space-y-4 mt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c32b1a]"></div>
                    </div>
                  ) : episodes.filter((e) => !e.is_played).length === 0 ? (
                    <div className="text-center py-12 bg-[#f8f0db]/30 rounded-lg">
                      <p className="text-[#040605]/70">No unplayed episodes</p>
                    </div>
                  ) : (
                    episodes
                      .filter((episode) => !episode.is_played)
                      .map((episode) => (
                        <div
                          key={episode.id}
                          className="bg-[#040605] rounded-lg overflow-hidden hover:bg-[#040605]/90 transition-all"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1 flex-1 min-w-0 mr-4">
                                <h3 className="font-medium text-[#f9f0dc] truncate">
                                  {episode.title}
                                </h3>
                                <div className="flex items-center text-xs text-[#f9f0dc]/60">
                                  <span>
                                    {episode.published_date
                                      ? new Date(
                                          episode.published_date
                                        ).toLocaleDateString()
                                      : "Unknown date"}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>
                                    {episode.duration_formatted || "0:00"}
                                  </span>
                                </div>
                                <p className="text-sm text-[#f9f0dc]/70 line-clamp-2 mt-2">
                                  {episode.description ||
                                    "No description available"}
                                </p>

                                {currentEpisode &&
                                  currentEpisode.id === episode.id && (
                                    <div className="mt-2 space-y-1">
                                      <Progress
                                        value={(currentTime / duration) * 100}
                                        className="h-1 bg-[#f9f0dc]/20"
                                      />
                                      <div className="flex justify-between text-xs text-[#f9f0dc]/70">
                                        <span>
                                          {formatDuration(currentTime)}
                                        </span>
                                        <span>{formatDuration(duration)}</span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#f9f0dc] hover:text-[#c32b1a] hover:bg-transparent h-10 w-10 rounded-full flex-shrink-0"
                                onClick={() => {
                                  // Create a player episode from the episode object
                                  const playerEpisode = {
                                    id: episode.id,
                                    title: episode.title,
                                    description: episode.description || "",
                                    publishDate: episode.published_date || "",
                                    duration:
                                      episode.duration_formatted || "0:00",
                                    durationSeconds: episode.duration || 0,
                                    podcastTitle:
                                      selectedPodcast?.title ||
                                      "Unknown Podcast",
                                    podcastId: episode.feed_id,
                                    artwork:
                                      episode.image_url ||
                                      selectedPodcast?.image_url ||
                                      "",
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
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!selectedPodcast && (
            <div className="flex items-center justify-center h-64 bg-[#f8f0db]/30 rounded-lg">
              <div className="text-center">
                <Headphones className="h-12 w-12 text-[#c32b1a]/70 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#040605]">
                  Select a podcast
                </h3>
                <p className="text-[#040605]/70 mt-2">
                  Choose a podcast from your library to view episodes
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
