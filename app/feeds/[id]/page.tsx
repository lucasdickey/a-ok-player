"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeedDetails } from '@/lib/feed-processor';
import { PodcastFeed, PodcastEpisode } from '@/lib/feed-processor';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import EpisodeList from '../../../components/podcast/episode-list';
import { use } from 'react';

export default function FeedPage({ params }: { params: { id: string } }) {
  // Use React.use() to properly unwrap the params object
  const feedId = use(Promise.resolve(params.id));
  const [feed, setFeed] = useState<PodcastFeed | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const fetchFeedDetails = async () => {
      try {
        setLoading(true);
        const result = await getFeedDetails(feedId);
        
        if (result.podcast) {
          setFeed(result.podcast as PodcastFeed);
        }
        
        if (result.episodes) {
          setEpisodes(result.episodes as PodcastEpisode[]);
        }
      } catch (error) {
        console.error('Error fetching feed details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedDetails();
  }, [feedId, user, router]);
  
  const handleRefresh = async () => {
    if (!feed || refreshing) return;
    
    try {
      setRefreshing(true);
      const result = await getFeedDetails(feedId);
      
      if (result.podcast) {
        setFeed(result.podcast as PodcastFeed);
      }
      
      if (result.episodes) {
        setEpisodes(result.episodes as PodcastEpisode[]);
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.push('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : feed ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {feed.image_url && (
              <div className="w-full md:w-48 flex-shrink-0">
                <img 
                  src={feed.image_url} 
                  alt={feed.title || 'Podcast'} 
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
            
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-[#c32b1a]">{feed.title}</h1>
              {feed.author && (
                <p className="text-lg text-gray-600 mt-1">{feed.author}</p>
              )}
              
              <div className="flex items-center mt-4 space-x-2">
                <Button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                >
                  {refreshing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Feed
                    </>
                  )}
                </Button>
              </div>
              
              {feed.description && (
                <div className="mt-6 prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: feed.description }} />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            {episodes.length > 0 ? (
              <EpisodeList episodes={episodes} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No episodes found for this podcast.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Podcast not found or you don't have access to it.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
