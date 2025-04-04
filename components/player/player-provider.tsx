"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { Episode } from "@/lib/podcast-data";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";

interface PlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  queue: Episode[];
  playEpisode: (episode: Episode) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  skipForward: (seconds: number) => void;
  skipBackward: (seconds: number) => void;
  playNext: () => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (episode: Episode, playNext?: boolean) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (sourceIndex: number, destinationIndex: number) => void;
}

// Create context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export default function PlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Episode[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener("timeupdate", () =>
      setCurrentTime(audio.currentTime)
    );
    audio.addEventListener("durationchange", () => setDuration(audio.duration));
    audio.addEventListener("ended", handleEpisodeEnd);

    return () => {
      audio.removeEventListener("timeupdate", () =>
        setCurrentTime(audio.currentTime)
      );
      audio.removeEventListener("durationchange", () =>
        setDuration(audio.duration)
      );
      audio.removeEventListener("ended", handleEpisodeEnd);
      audio.pause();
    };
  }, []);

  // Update audio when currentEpisode changes
  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return;

    const audioUrl = currentEpisode.audioUrl || "";
    if (!audioUrl) {
      console.error("Error: No audio URL available for this episode");
      setIsPlaying(false);
      return;
    }

    if (audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
    }

    audioRef.current.playbackRate = playbackRate;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    }
  }, [currentEpisode, playbackRate, volume, isPlaying]);

  // Update audio when playback state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Update audio when playback rate changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Update audio when volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const playEpisode = (episode: Episode) => {
    // Add to queue if not already in queue
    if (!queue.some((ep) => ep.id === episode.id)) {
      setQueue((prev) => [...prev, episode]);
    }

    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipForward = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + seconds,
      audioRef.current.duration
    );
  };

  const skipBackward = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      audioRef.current.currentTime - seconds,
      0
    );
  };

  const playNext = () => {
    if (!currentEpisode || queue.length === 0) return;

    const currentIndex = queue.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      // If current episode is not in queue or is the last one, play the first in queue
      playEpisode(queue[0]);
    } else {
      // Play next episode in queue
      playEpisode(queue[currentIndex + 1]);
    }
  };

  const addToQueue = (episode: Episode, playNext = false) => {
    if (playNext && currentEpisode) {
      const currentIndex = queue.findIndex((ep) => ep.id === currentEpisode.id);
      if (currentIndex !== -1) {
        const newQueue = [...queue];
        newQueue.splice(currentIndex + 1, 0, episode);
        setQueue(newQueue);
        return;
      }
    }

    // Add to end of queue
    setQueue((prev) => [...prev, episode]);
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...queue];
    const removedEpisode = newQueue[index];

    newQueue.splice(index, 1);
    setQueue(newQueue);

    // If we removed the current episode, play the next one
    if (currentEpisode && removedEpisode.id === currentEpisode.id) {
      if (newQueue.length > 0) {
        const nextIndex = Math.min(index, newQueue.length - 1);
        playEpisode(newQueue[nextIndex]);
      } else {
        setCurrentEpisode(null);
        setIsPlaying(false);
      }
    }
  };

  const reorderQueue = (sourceIndex: number, destinationIndex: number) => {
    const newQueue = [...queue];
    const [removed] = newQueue.splice(sourceIndex, 1);
    newQueue.splice(destinationIndex, 0, removed);
    setQueue(newQueue);
  };

  const handleEpisodeEnd = () => {
    playNext();
  };

  return (
    <PlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        volume,
        queue,
        playEpisode,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        playNext,
        setPlaybackRate,
        setVolume,
        addToQueue,
        removeFromQueue,
        reorderQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
