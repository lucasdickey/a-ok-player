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

  // If no episode is playing, show a skeleton player
  if (!currentEpisode) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#040605] text-[#f9f0dc] h-20 border-t border-[#c32b1a]/20">
        <div className="flex items-center h-full px-4">
          <div className="h-10 w-10 rounded bg-[#f9f0dc]/10 mr-3 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 mr-4">
            <div className="h-4 w-48 bg-[#f9f0dc]/10 rounded mb-2"></div>
            <div className="h-3 w-32 bg-[#f9f0dc]/10 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#f9f0dc]/10"></div>
            <div className="h-10 w-10 rounded-full bg-[#c32b1a] flex items-center justify-center">
              <Play className="h-5 w-5 text-[#f9f0dc]" />
            </div>
            <div className="h-8 w-8 rounded-full bg-[#f9f0dc]/10"></div>
          </div>
        </div>
      </div>
    )
  }

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#040605] text-[#f9f0dc] transition-all duration-300 ${
        isExpanded ? "h-96" : "h-20"
      } border-t border-[#c32b1a]/20 overflow-hidden z-50 shadow-lg`}
    >
      {/* Progress Bar Slider (always visible but positioned differently based on mode) */}
      <div className={`${isExpanded ? "hidden" : "block"} absolute top-0 left-0 right-0 px-1 py-1 z-10`}>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={(value) => seekTo(value[0])}
          className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[#f9f0dc]/20 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:opacity-80 [&_[role=slider]]:bg-[#c32b1a] [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#f9f0dc] [&>span:first-child_span]:bg-[#c32b1a]"
        />
      </div>
      
      {/* Collapsed Player */}
      <div className={`flex items-center h-20 px-4 ${isExpanded ? "border-b border-[#c32b1a]/20" : ""}`}>
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log("Current expanded state:", isExpanded);
            setIsExpanded(prev => !prev);
            console.log("New expanded state:", !isExpanded);
          }}
          className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 mr-2 border border-[#f9f0dc]/30 rounded-full h-8 w-8"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center flex-1 min-w-0">
          {/* Artwork */}
          <div className="h-12 w-12 rounded-lg bg-[#f9f0dc]/10 mr-3 flex-shrink-0 overflow-hidden">
            {currentEpisode.artwork && (
              <img
                src={currentEpisode.artwork || "/placeholder.svg"}
                alt={currentEpisode.podcastTitle}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0 mr-4">
            <div className="font-medium truncate text-[#f9f0dc]">{currentEpisode.title}</div>
            <div className="text-sm text-[#f9f0dc]/80 truncate">{currentEpisode.podcastTitle}</div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipBackward(15)}
            className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-8 w-8 rounded-full hidden md:flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <SkipBack className="h-4 w-4 absolute" />
              <span className="text-[7px] font-bold">15</span>
            </div>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePlayPause} 
            className="text-[#f9f0dc] bg-[#c32b1a] hover:bg-[#a82315] h-10 w-10 rounded-full flex items-center justify-center p-0"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipForward(15)}
            className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-8 w-8 rounded-full hidden md:flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <SkipForward className="h-4 w-4 absolute" />
              <span className="text-[7px] font-bold">15</span>
            </div>
          </Button>
        </div>
        
        {/* Additional Controls */}
        <div className="flex items-center gap-2 ml-4">
          {/* Volume Control (Desktop Only) */}
          <div className="hidden md:block relative" ref={volumeRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-8 w-8 rounded-full"
            >
              {getVolumeIcon()}
            </Button>

            {showVolumeSlider && (
              <div className="absolute bottom-full mb-2 p-3 bg-[#040605] border border-[#c32b1a]/20 rounded-md w-32">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  className="[&>span:first-child]:bg-[#f9f0dc]/30 [&_[role=slider]]:bg-[#c32b1a] [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-[#c32b1a]"
                />
              </div>
            )}
          </div>

          {/* Queue Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-8 w-8 rounded-full">
                <ListMusic className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 sm:w-96 bg-[#040605] text-[#f9f0dc] border-l border-[#c32b1a]/20">
              <QueueList />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Time Display for collapsed view */}
      {!isExpanded && (
        <div className="absolute bottom-1 left-0 right-0 px-4 flex justify-between text-xs text-[#f9f0dc]/60 pointer-events-none">
          <div>{formatTime(currentTime)}</div>
          <div>-{formatTime(duration - currentTime)}</div>
        </div>
      )}
      
      {/* Expanded Player Content */}
      {isExpanded && (
        <div className="p-4 overflow-y-auto h-[calc(100%-5rem)] block">
          <div className="flex flex-col items-center">
            {/* Large Artwork */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-[#f9f0dc]/10 rounded-lg mb-4 overflow-hidden">
              {currentEpisode.artwork && (
                <img
                  src={currentEpisode.artwork}
                  alt={currentEpisode.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Episode Title and Podcast */}
            <h3 className="text-lg font-semibold text-center mb-1">{currentEpisode.title}</h3>
            <p className="text-sm text-[#f9f0dc]/80 mb-4">{currentEpisode.podcastTitle}</p>
            
            {/* Detailed Progress Bar */}
            <div className="w-full max-w-md mb-4">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={(value) => seekTo(value[0])}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-[#f9f0dc]/20 [&_[role=slider]]:bg-[#c32b1a] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#f9f0dc] [&>span:first-child_span]:bg-[#c32b1a]"
              />
              <div className="flex justify-between text-xs text-[#f9f0dc]/70 mt-1">
                <div>{formatTime(currentTime)}</div>
                <div>{formatTime(duration)}</div>
              </div>
            </div>

            {/* Extended Playback Controls */}
            <div className="flex items-center gap-6 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skipBackward(15)}
                className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-10 w-10 rounded-full flex items-center justify-center"
              >
                <div className="relative flex items-center justify-center w-full h-full">
                  <SkipBack className="h-5 w-5 absolute" />
                  <span className="text-[9px] font-bold">15</span>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePlayPause} 
                className="text-[#f9f0dc] bg-[#c32b1a] hover:bg-[#a82315] h-14 w-14 rounded-full flex items-center justify-center p-0"
              >
                {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skipForward(15)}
                className="text-[#f9f0dc] hover:bg-[#f9f0dc]/10 h-10 w-10 rounded-full flex items-center justify-center"
              >
                <div className="relative flex items-center justify-center w-full h-full">
                  <SkipForward className="h-5 w-5 absolute" />
                  <span className="text-[9px] font-bold">15</span>
                </div>
              </Button>
            </div>

            {/* Playback Rate Control */}
            <h4 className="text-sm font-medium mb-2">Playback Speed</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaybackRate(rate)}
                  className={`
                    ${playbackRate === rate ? 'bg-[#c32b1a] text-[#f9f0dc] border-[#c32b1a]' : 'bg-transparent text-[#f9f0dc] border-[#f9f0dc]/20'}
                    hover:bg-[#c32b1a] hover:text-[#f9f0dc] min-w-[46px]
                  `}
                >
                  {rate}x
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
