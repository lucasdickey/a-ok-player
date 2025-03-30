"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PodcastEpisode } from '@/lib/feed-processor';
import { formatDuration, formatDate } from '@/lib/utils';
import { Play, Bookmark, Plus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface EpisodeListProps {
  episodes: PodcastEpisode[];
}

export default function EpisodeList({ episodes }: EpisodeListProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [queueingId, setQueueingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePlay = (episode: PodcastEpisode) => {
    // In a real app, this would play the episode
    setPlayingId(episode.id);
    
    toast({
      title: "Playing Episode",
      description: `Now playing: ${episode.title}`,
    });
    
    // Reset after a moment to simulate the action
    setTimeout(() => setPlayingId(null), 1000);
  };
  
  const handleSave = async (episode: PodcastEpisode) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save episodes",
        variant: "destructive",
      });
      return;
    }
    
    setSavingId(episode.id);
    
    try {
      // Check if already saved
      const { data: existingSaved } = await supabase
        .from('saved_episodes')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .single();
      
      if (existingSaved) {
        toast({
          title: "Already Saved",
          description: "This episode is already in your saved episodes",
        });
        return;
      }
      
      // Save the episode
      const { error } = await supabase
        .from('saved_episodes')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          episode_id: episode.id
        });
      
      if (error) throw error;
      
      toast({
        title: "Episode Saved",
        description: "Added to your saved episodes",
      });
    } catch (error) {
      console.error('Error saving episode:', error);
      toast({
        title: "Error",
        description: "Failed to save episode",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };
  
  const handleAddToQueue = async (episode: PodcastEpisode) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add episodes to your queue",
        variant: "destructive",
      });
      return;
    }
    
    setQueueingId(episode.id);
    
    try {
      // Check if already in queue
      const { data: existingQueue } = await supabase
        .from('queue_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episode.id)
        .single();
      
      if (existingQueue) {
        toast({
          title: "Already in Queue",
          description: "This episode is already in your queue",
        });
        return;
      }
      
      // Get current max position
      const { data: queueItems } = await supabase
        .from('queue_items')
        .select('position')
        .eq('user_id', user.id)
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = queueItems && queueItems.length > 0 ? queueItems[0].position + 1 : 1;
      
      // Add to queue
      const { error } = await supabase
        .from('queue_items')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          episode_id: episode.id,
          position: nextPosition
        });
      
      if (error) throw error;
      
      toast({
        title: "Added to Queue",
        description: "Episode added to your play queue",
      });
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add episode to queue",
        variant: "destructive",
      });
    } finally {
      setQueueingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {episodes.map((episode) => (
        <Card key={episode.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {episode.image_url && (
              <div className="w-full md:w-32 h-32 flex-shrink-0">
                <img 
                  src={episode.image_url} 
                  alt={episode.title || 'Episode'} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-grow p-4">
              <h3 className="text-lg font-semibold">{episode.title}</h3>
              
              <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                {episode.published_date && (
                  <span>{formatDate(new Date(episode.published_date))}</span>
                )}
                {episode.duration && (
                  <span>{formatDuration(episode.duration)}</span>
                )}
              </div>
              
              {episode.description && (
                <p className="text-gray-600 mt-2 line-clamp-2">{episode.description}</p>
              )}
              
              <div className="flex items-center mt-4 space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handlePlay(episode)}
                  disabled={playingId === episode.id}
                  className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]"
                >
                  {playingId === episode.id ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : (
                    <Play className="mr-1 h-4 w-4" />
                  )}
                  Play
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSave(episode)}
                  disabled={savingId === episode.id}
                >
                  {savingId === episode.id ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : (
                    <Bookmark className="mr-1 h-4 w-4" />
                  )}
                  Save
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAddToQueue(episode)}
                  disabled={queueingId === episode.id}
                >
                  {queueingId === episode.id ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : (
                    <Plus className="mr-1 h-4 w-4" />
                  )}
                  Queue
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {episodes.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No episodes found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
