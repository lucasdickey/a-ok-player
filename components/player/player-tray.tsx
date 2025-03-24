"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ListMusic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePlayer } from "./player-provider"
import { useMobile } from "@/hooks/use-mobile"
import QueueList from "./queue-list"

// Update the formatTime function to handle larger durations better
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00"

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}:${remainingMins < 10 ? "0" : ""}${remainingMins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

export default function PlayerTray() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    playNext,
    setPlaybackRate,
    setVolume,
  } = usePlayer()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const volumeRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Handle clicks outside volume slider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // If no episode is playing, don't show the player
  if (!currentEpisode) {
    return null
  }

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#009BA4] text-white transition-all duration-300 ${isExpanded ? "h-96" : "h-16 md:h-20"}`}
    >
      {/* Collapsed Player */}
      <div className={`flex items-center h-16 md:h-20 px-4 ${isExpanded ? "border-b border-white/20" : ""}`}>
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:bg-white/10 mr-2"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>

        {/* Artwork (always visible on mobile, visible on hover for desktop) */}
        <div className={`h-12 w-12 rounded bg-[#9EDEDA] mr-3 flex-shrink-0 ${isMobile ? "block" : "hidden md:block"}`}>
          {currentEpisode.artwork && (
            <img
              src={currentEpisode.artwork || "/placeholder.svg"}
              alt={currentEpisode.podcastTitle}
              className="h-full w-full object-cover rounded"
            />
          )}
        </div>

        {/* Episode Info */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="font-medium truncate">{currentEpisode.title}</div>
          <div className="text-sm text-white/80 truncate">{currentEpisode.podcastTitle}</div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipBackward(30)}
            className="text-white hover:bg-white/10 hidden md:flex"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-white hover:bg-white/10">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipForward(30)}
            className="text-white hover:bg-white/10 hidden md:flex"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          {/* Volume Control (Desktop Only) */}
          <div className="hidden md:block relative" ref={volumeRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="text-white hover:bg-white/10"
            >
              {getVolumeIcon()}
            </Button>

            {showVolumeSlider && (
              <div className="absolute bottom-full mb-2 p-3 bg-[#007187] rounded-md w-32">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                />
              </div>
            )}
          </div>

          {/* Queue Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hidden md:flex">
                <ListMusic className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 sm:w-96">
              <QueueList />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Progress Bar (always visible) */}
      <div className="absolute -top-2 left-0 right-0 px-4">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={(value) => seekTo(value[0])}
          className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
        />
      </div>

      {/* Time Display */}
      <div className="absolute -top-6 left-0 right-0 px-4 flex justify-between text-xs text-white/80">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      {/* Expanded Player */}
      {isExpanded && (
        <div className="h-[calc(100%-5rem)] p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Large Artwork */}
            <div className="w-48 h-48 bg-[#9EDEDA] rounded-lg flex-shrink-0">
              {currentEpisode.artwork && (
                <img
                  src={currentEpisode.artwork || "/placeholder.svg"}
                  alt={currentEpisode.podcastTitle}
                  className="h-full w-full object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex-1 space-y-6">
              {/* Episode Info */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold">{currentEpisode.title}</h3>
                <p className="text-white/80">{currentEpisode.podcastTitle}</p>
              </div>

              {/* Extended Controls */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">Speed:</span>
                  <div className="flex">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <Button
                        key={rate}
                        variant="ghost"
                        size="sm"
                        onClick={() => setPlaybackRate(rate)}
                        className={`text-xs px-2 py-1 h-auto ${
                          playbackRate === rate ? "bg-white text-[#009BA4]" : "text-white hover:bg-white/10"
                        }`}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mobile Volume Control */}
                {isMobile && (
                  <div className="w-full flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setVolume(0)}
                      className="text-white hover:bg-white/10"
                    >
                      {getVolumeIcon()}
                    </Button>
                    <Slider
                      value={[volume * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      className="flex-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Extended Playback Controls */}
              <div className="flex justify-center md:justify-start items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipBackward(30)}
                  className="text-white hover:bg-white/10"
                >
                  <div className="relative">
                    <SkipBack className="h-6 w-6" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold mt-1">
                      30
                    </span>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/10 h-14 w-14"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipForward(30)}
                  className="text-white hover:bg-white/10"
                >
                  <div className="relative">
                    <SkipForward className="h-6 w-6" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold mt-1">
                      30
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Queue in Expanded View */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">Up Next</h3>
            <QueueList compact />
          </div>
        </div>
      )}
    </div>
  )
}

