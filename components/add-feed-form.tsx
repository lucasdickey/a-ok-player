"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth/auth-provider'
import { parseFeed } from '@/lib/rss-parser'

export default function AddFeedForm({ onSuccess }: { onSuccess?: () => void }) {
  const [feedUrl, setFeedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a podcast feed.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Parse the RSS feed to get podcast details
      const { podcast } = await parseFeed(feedUrl)
      
      // Add the subscription to the database
      const { error } = await supabase
        .from('podcast_subscriptions')
        .insert({
          user_id: user.id,
          feed_url: feedUrl,
          title: podcast.title
        })
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Podcast added!",
        description: `Successfully added "${podcast.title}" to your library.`
      })
      
      setFeedUrl('')
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Error adding feed:', error)
      toast({
        title: "Failed to add podcast",
        description: "Please check the URL and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Podcast</CardTitle>
        <CardDescription>Enter the RSS feed URL for the podcast you want to add</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col space-y-1.5">
            <Input
              placeholder="https://example.com/podcast/feed.xml"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-[#009BA4] hover:bg-[#007187]"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Podcast"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}