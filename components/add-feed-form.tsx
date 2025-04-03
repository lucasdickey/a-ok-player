"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth/auth-provider'
import { validateFeed, addFeed } from '@/lib/feed-processor'

export default function AddFeedForm({ onSuccess }: { onSuccess?: () => void }) {
  const [feedUrl, setFeedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) {
      console.log("Authentication required")
      return
    }
    
    if (!feedUrl.trim()) {
      console.log("Empty URL")
      return
    }
    
    setIsLoading(true)

    try {
      // Validate the feed first
      const validationResult = await validateFeed(feedUrl)
      
      if (!validationResult.isValid) {
        console.log("Invalid feed:", validationResult.message || "Please check the URL and try again.")
        setIsLoading(false)
        return
      }
      
      // Add the feed to the user's subscriptions
      const result = await addFeed(user.id, feedUrl)
      
      if (!result.success) {
        throw new Error(result.message || "Failed to add podcast")
      }
      
      console.log(`Successfully added "${validationResult.metadata?.title}" to your library.`)
      
      setFeedUrl('')
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Error adding feed:', error)
      console.error("Failed to add podcast:", error instanceof Error ? error.message : "Please check the URL and try again.")
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
            className="w-full bg-[#c32b1a] hover:bg-[#a82315]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : "Add Podcast"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}