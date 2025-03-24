"use client"

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Play, Trash2, GripVertical, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlayer } from "./player-provider"

interface QueueListProps {
  compact?: boolean
}

export default function QueueList({ compact = false }: QueueListProps) {
  const { queue, currentEpisode, playEpisode, removeFromQueue, reorderQueue, isPlaying, togglePlayPause } = usePlayer()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    reorderQueue(sourceIndex, destinationIndex)
  }

  const handlePlayPause = (episode: any) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause()
    } else {
      playEpisode(episode)
    }
  }

  if (queue.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">Your queue is empty</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="queue">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {queue.map((episode, index) => (
              <Draggable key={episode.id} draggableId={episode.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center p-2 rounded-md ${
                      currentEpisode?.id === episode.id
                        ? compact
                          ? "bg-white/10 text-white"
                          : "bg-[#D8EFE9]/20 border-[#00CCCC]"
                        : compact
                          ? "text-white/80"
                          : ""
                    }`}
                  >
                    <div {...provided.dragHandleProps} className="mr-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {!compact && (
                      <div className="h-10 w-10 rounded bg-[#9EDEDA] mr-3 flex-shrink-0">
                        {episode.artwork && (
                          <img
                            src={episode.artwork || "/placeholder.svg"}
                            alt={episode.podcastTitle}
                            className="h-full w-full object-cover rounded"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${compact ? "text-white" : ""}`}>
                        {episode.title}
                      </div>
                      <div className={`text-xs truncate ${compact ? "text-white/70" : "text-muted-foreground"}`}>
                        {episode.podcastTitle}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="icon"
                        variant={compact ? "ghost" : "ghost"}
                        onClick={() => handlePlayPause(episode)}
                        className={
                          compact
                            ? "text-white hover:bg-white/10 h-8 w-8"
                            : "text-[#004977] hover:text-[#007187] hover:bg-[#D8EFE9] h-8 w-8"
                        }
                      >
                        {currentEpisode?.id === episode.id && isPlaying ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant={compact ? "ghost" : "ghost"}
                        className={
                          compact
                            ? "text-white hover:bg-white/10 h-8 w-8"
                            : "text-[#CE2090] hover:text-[#CE2090] hover:bg-[#ED9FBA]/20 h-8 w-8"
                        }
                        onClick={() => removeFromQueue(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

