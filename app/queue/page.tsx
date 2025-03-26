"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Play, Trash2, GripVertical, Clock, Save } from "lucide-react"
import { usePlayer } from "@/components/player/player-provider"

export default function QueuePage() {
  const { queue, currentEpisode, playEpisode, removeFromQueue, reorderQueue } = usePlayer()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    reorderQueue(sourceIndex, destinationIndex)
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Your Queue</h1>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mb-4 text-primary" />
          <h2 className="text-xl font-medium mb-2">Your queue is empty</h2>
          <p className="mb-4">Add episodes from podcasts to start building your queue</p>
          <Button>Discover Podcasts</Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="queue">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {queue.map((episode, index) => (
                  <Draggable key={episode.id} draggableId={episode.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center p-3 ${
                          currentEpisode?.id === episode.id ? "border-accent bg-accent/10" : ""
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="mr-3 text-muted-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="h-12 w-12 rounded bg-muted mr-3 flex-shrink-0">
                          {episode.artwork && (
                            <img
                              src={episode.artwork || "/placeholder.svg"}
                              alt={episode.podcastTitle}
                              className="h-full w-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{episode.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{episode.podcastTitle}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => playEpisode(episode)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromQueue(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
