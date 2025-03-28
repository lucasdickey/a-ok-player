"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFeeds, type Feed } from '@/hooks/useFeeds';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, PlusCircle } from 'lucide-react';

export function FeedList() {
  const { feeds, loading, error, refreshAllFeeds } = useFeeds();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAllFeeds();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#c32b1a]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-semibold mb-4">No podcasts yet</h3>
        <p className="text-gray-500 mb-6">
          Add your favorite podcasts to get started
        </p>
        <Link href="/feeds/add">
          <Button className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Podcast
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#c32b1a]">Your Podcasts</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/feeds/add">
            <Button className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Podcast
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeds.map((feed) => (
          <FeedCard key={feed.id} feed={feed} />
        ))}
      </div>
    </div>
  );
}

interface FeedCardProps {
  feed: Feed;
}

function FeedCard({ feed }: FeedCardProps) {
  return (
    <Link href={`/feeds/${feed.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0">
          <div className="flex items-center p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              {feed.imageUrl ? (
                <Image
                  src={feed.imageUrl}
                  alt={feed.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#c32b1a] text-[#f9f0dc] text-xl font-bold">
                  {feed.title.charAt(0)}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
              <h3 className="font-semibold line-clamp-1">{feed.title}</h3>
              {feed.author && (
                <p className="text-sm text-gray-500 line-clamp-1">{feed.author}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {feed.lastCheckedAt
                  ? `Updated ${new Date(feed.lastCheckedAt).toLocaleDateString()}`
                  : 'Recently added'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
