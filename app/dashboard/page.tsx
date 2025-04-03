"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import AddFeedForm from '@/components/add-feed-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { getFeedDetails, refreshFeed } from '@/lib/feed-processor';
import { AlertCircle, Trash2, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('podcast_subscriptions')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setSubscriptions(data || []);
        
        // Get podcast details from our feed processor
        const podcastDetails = await Promise.all(
          (data || []).map(async (feed) => {
            try {
              const result = await getFeedDetails(feed.id);
              return { 
                ...result.podcast,
                feedId: feed.id,
                feedUrl: feed.feed_url,
                lastUpdated: feed.last_checked_at,
                error: false
              };
            } catch (error) {
              console.error(`Error getting feed details for ${feed.feed_url}:`, error);
              return { 
                title: feed.title || 'Error loading podcast',
                author: 'Unknown',
                imageUrl: '/placeholder.svg',
                feedId: feed.id,
                feedUrl: feed.feed_url,
                error: true
              };
            }
          })
        );
        
        setPodcasts(podcastDetails);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        console.error('Failed to load your subscriptions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [user]);
  
  const handleDeleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('podcast_subscriptions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update state
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      setPodcasts(podcasts.filter(podcast => podcast.feedId !== id));
      
      console.log('Success: Podcast removed from your library');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      console.error('Error: Failed to remove podcast');
    }
  };
  
  const handleRefreshFeed = async (feedId: string, feedUrl: string) => {
    try {
      setRefreshingId(feedId);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const result = await refreshFeed(user.id, feedId);
      
      if (result.success) {
        // Update the podcast in the list
        setPodcasts(prevPodcasts => 
          prevPodcasts.map(podcast => 
            podcast.feedId === feedId 
              ? { 
                  ...podcast, 
                  title: result.podcast?.title || podcast.title,
                  author: result.podcast?.author || podcast.author,
                  imageUrl: result.podcast?.imageUrl || podcast.imageUrl,
                  description: result.podcast?.description || podcast.description,
                  lastUpdated: new Date().toISOString(),
                  error: false
                } 
              : podcast
          )
        );
        
        console.log('Success: Podcast feed refreshed successfully');
      } else {
        throw new Error(result.message || 'Failed to refresh feed');
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
      console.error('Error: Failed to refresh podcast feed');
    } finally {
      setRefreshingId(null);
    }
  };
  
  const handleAddSuccess = () => {
    // Reload data
    if (user) {
      setLoading(true);
      const fetchSubscriptions = async () => {
        const { data } = await supabase
          .from('podcast_subscriptions')
          .select('*')
          .eq('user_id', user.id);
          
        setSubscriptions(data || []);
        
        // Get podcast details
        const podcastDetails = await Promise.all(
          (data || []).map(async (feed) => {
            try {
              const result = await getFeedDetails(feed.id);
              return { 
                ...result.podcast,
                feedId: feed.id,
                feedUrl: feed.feed_url,
                lastUpdated: feed.last_checked_at,
                error: false
              };
            } catch (error) {
              return { 
                title: feed.title || 'Error loading podcast',
                author: 'Unknown',
                imageUrl: '/placeholder.svg',
                feedId: feed.id,
                feedUrl: feed.feed_url,
                error: true
              };
            }
          })
        );
        
        setPodcasts(podcastDetails);
        setLoading(false);
      };
      
      fetchSubscriptions();
    }
  };
  
  if (!user) {
    return (
      <div className="container py-10">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <a href="/auth">Log In</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Podcast Library</CardTitle>
              <CardDescription>Manage your podcast subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : podcasts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>You haven't added any podcasts yet.</p>
                  <p>Add your first podcast using the form on the right.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {podcasts.map((podcast) => (
                    <Card key={podcast.feedId} className={`overflow-hidden ${podcast.error ? 'border-red-300' : ''}`}>
                      <div className="flex p-4">
                        <div className="h-16 w-16 rounded bg-muted mr-4 flex-shrink-0">
                          {!podcast.error && (
                            <img
                              src={podcast.imageUrl || "/placeholder.svg"}
                              alt={podcast.title}
                              className="h-full w-full object-cover rounded"
                            />
                          )}
                          {podcast.error && (
                            <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-600">
                              <AlertCircle className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm truncate">{podcast.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{podcast.author}</p>
                          
                          <div className="flex mt-2 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleRefreshFeed(podcast.feedId, podcast.feedUrl)}
                              disabled={refreshingId === podcast.feedId}
                            >
                              {refreshingId === podcast.feedId ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                              )}
                              Refresh
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-100"
                              onClick={() => handleDeleteSubscription(podcast.feedId)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <AddFeedForm onSuccess={handleAddSuccess} />
        </div>
      </div>
    </div>
  );
}