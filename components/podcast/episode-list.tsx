"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PodcastEpisode } from "@/lib/feed-processor";
import { formatDuration, formatDate } from "@/lib/utils";
import { Play, Pause, Bookmark, Plus, Check } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { usePlayer } from "@/components/player/player-provider";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Progress } from "@/components/ui/progress";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
}

export default function EpisodeList({ episodes }: EpisodeListProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [queueingId, setQueueingId] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    playEpisode,
    currentEpisode,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    getEpisodeProgress,
  } = usePlayer();

  const handlePlay = (episode: PodcastEpisode) => {
    // Convert PodcastEpisode to the Episode format expected by PlayerProvider
    const playerEpisode = {
      id: episode.id,
      title: episode.title,
      description: episode.description || "",
      publishDate: episode.published_date || "",
      duration: formatDuration(episode.duration || 0),
      durationSeconds: episode.duration || 0,
      podcastTitle: episode.podcast_title || "Unknown Podcast",
      podcastId: episode.feed_id || "",
      artwork: episode.image_url || "",
      // Use example audio files for demo purposes if no audio_url is available
      audioUrl:
        episode.audio_url ||
        "https://example-samples.netlify.app/audio/podcast-sample.mp3",
      isNew: false,
      isBookmarked: false,
      progress: 0,
    };

    // Check if this is the current episode, if so toggle play/pause
    if (currentEpisode && currentEpisode.id === episode.id) {
      togglePlayPause();
    } else {
      // Otherwise play the new episode
      playEpisode(playerEpisode);
    }

    console.log(`Now playing: ${episode.title}`);
  };

  const handleSave = async (episode: PodcastEpisode) => {
    if (!user) {
      console.log("Authentication Required: Please log in to save episodes");
      return;
    }

    setSavingId(episode.id);

    try {
      // Check if already saved
      const { data: existingSaved } = await supabase
        .from("saved_episodes")
        .select("id")
        .eq("user_id", user.id)
        .eq("episode_id", episode.id)
        .single();

      if (existingSaved) {
        console.log(
          "Already Saved: This episode is already in your saved episodes"
        );
        return;
      }

      // Save the episode
      const { error } = await supabase.from("saved_episodes").insert({
        id: uuidv4(),
        user_id: user.id,
        episode_id: episode.id,
      });

      if (error) throw error;

      console.log("Episode Saved: Added to your saved episodes");
    } catch (error) {
      console.error("Error saving episode:", error);
      console.error("Error: Failed to save episode");
    } finally {
      setSavingId(null);
    }
  };

  const handleAddToQueue = async (episode: PodcastEpisode) => {
    if (!user) {
      console.log(
        "Authentication Required: Please log in to add episodes to your queue"
      );
      return;
    }

    setQueueingId(episode.id);

    try {
      // Check if already in queue
      const { data: existingQueue } = await supabase
        .from("queue_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("episode_id", episode.id)
        .single();

      if (existingQueue) {
        console.log("Already in Queue: This episode is already in your queue");
        return;
      }

      // Get current max position
      const { data: queueItems } = await supabase
        .from("queue_items")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition =
        queueItems && queueItems.length > 0 ? queueItems[0].position + 1 : 1;

      // Add to queue
      const { error } = await supabase.from("queue_items").insert({
        id: uuidv4(),
        user_id: user.id,
        episode_id: episode.id,
        position: nextPosition,
      });

      if (error) throw error;

      console.log("Added to Queue: Episode added to your play queue");
    } catch (error) {
      console.error("Error adding to queue:", error);
      console.error("Error: Failed to add episode to queue");
    } finally {
      setQueueingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {episodes.map((episode) => {
        const isCurrentEpisode = currentEpisode?.id === episode.id;
        const progress = getEpisodeProgress(episode.id);
        const showProgress = isCurrentEpisode || progress;

        return (
          <div
            key={episode.id}
            className="bg-[#040605] rounded-lg overflow-hidden hover:bg-[#040605]/90 transition-all"
          >
            <div className="flex flex-col md:flex-row">
              {episode.image_url && (
                <div className="w-full md:w-24 h-24 flex-shrink-0">
                  <img
                    src={episode.image_url}
                    alt={episode.title || "Episode"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-grow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#f9f0dc] truncate">
                      {episode.title}
                    </h3>

                    <div className="flex items-center text-sm text-[#f9f0dc]/60 mt-1 space-x-3">
                      {episode.published_date && (
                        <span>
                          {formatDate(new Date(episode.published_date))}
                        </span>
                      )}
                      {episode.duration && (
                        <span>{formatDuration(episode.duration)}</span>
                      )}
                    </div>

                    {episode.description && (
                      <p className="text-[#f9f0dc]/70 mt-2 line-clamp-2 text-sm">
                        {episode.description}
                      </p>
                    )}

                    {showProgress && (
                      <div className="mt-2 space-y-1">
                        <Progress
                          value={
                            isCurrentEpisode
                              ? (currentTime / duration) * 100
                              : (progress!.position / progress!.duration) * 100
                          }
                          className="h-1 bg-[#f9f0dc]/20"
                        />
                        <div className="flex justify-between text-xs text-[#f9f0dc]/70">
                          <span>
                            {formatDuration(
                              isCurrentEpisode
                                ? currentTime
                                : progress!.position
                            )}
                          </span>
                          <span>
                            {formatDuration(
                              isCurrentEpisode ? duration : progress!.duration
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePlay(episode)}
                    className="text-[#f9f0dc] hover:text-[#c32b1a] h-10 w-10 rounded-full flex-shrink-0"
                  >
                    {isCurrentEpisode && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center mt-3 space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(episode)}
                    disabled={savingId === episode.id}
                    className="text-[#f9f0dc]/70 hover:text-[#c32b1a] hover:bg-transparent px-2 h-8"
                  >
                    {savingId === episode.id ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Bookmark className="mr-1 h-4 w-4" />
                    )}
                    <span className="text-xs">Save</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddToQueue(episode)}
                    disabled={queueingId === episode.id}
                    className="text-[#f9f0dc]/70 hover:text-[#c32b1a] hover:bg-transparent px-2 h-8"
                  >
                    {queueingId === episode.id ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Plus className="mr-1 h-4 w-4" />
                    )}
                    <span className="text-xs">Queue</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {episodes.length === 0 && (
        <div className="bg-[#040605]/10 rounded-lg p-8 text-center">
          <p className="text-[#040605]/60">No episodes found.</p>
        </div>
      )}
    </div>
  );
}
