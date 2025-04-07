"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeeds } from '@/hooks/useFeeds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AlreadySubscribedDialog } from './already-subscribed-dialog';

export function AddFeedForm() {
  const [feedUrl, setFeedUrl] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlreadySubscribedDialog, setShowAlreadySubscribedDialog] = useState(false);
  const [existingFeedId, setExistingFeedId] = useState<string | undefined>(undefined);
  const { addFeed } = useFeeds();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedUrl.trim()) {
      setError('Please enter a valid RSS feed URL');
      return;
    }
    
    setError(null);
    setValidating(true);
    
    try {
      // Normalize the URL if needed
      let normalizedUrl = feedUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Add the feed
      const result = await addFeed(normalizedUrl);
      
      if (result.success) {
        // Clear the form
        setFeedUrl('');
        
        // Redirect to the feed details page if we have a feedId
        if (result.feedId) {
          router.push(`/feeds/${result.feedId}`);
        } else {
          router.push('/feeds');
        }
      } else {
        // Check if the error is because the user is already subscribed
        if (result.message?.includes('already subscribed')) {
          // Show the already subscribed dialog without logging to console
          setExistingFeedId(result.feedId);
          setShowAlreadySubscribedDialog(true);
        } else {
          // Show other errors in the form
          setError(result.message || 'Failed to add podcast feed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error adding feed:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleTryAgain = () => {
    setFeedUrl('');
    setError(null);
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-[#c32b1a]">Add Podcast</CardTitle>
          <CardDescription>
            Enter the RSS feed URL of the podcast you want to add to your library
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="https://example.com/feed.xml"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  className="w-full"
                  disabled={validating}
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p>Examples of podcast RSS feed URLs:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>https://feeds.megaphone.fm/vergecast</li>
                  <li>https://feeds.simplecast.com/54nAGcIl</li>
                  <li>https://feeds.transistor.fm/syntax</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/feeds')}
              disabled={validating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={validating || !feedUrl.trim()} 
              className="bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]"
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Add Podcast'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlreadySubscribedDialog
        open={showAlreadySubscribedDialog}
        onOpenChange={setShowAlreadySubscribedDialog}
        feedId={existingFeedId}
        onTryAgain={handleTryAgain}
      />
    </>
  );
}
