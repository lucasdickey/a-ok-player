import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateFeed, addFeed, getUserFeeds, removeFeed } from '@/lib/feed-processor'

// GET handler to fetch all subscriptions for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user's subscribed podcasts
    const feeds = await getUserFeeds(session.user.id)
    
    return NextResponse.json({ feeds })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

// POST handler to add a new subscription
export async function POST(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get feed URL from request body
    const body = await request.json()
    const { feedUrl } = body
    
    if (!feedUrl) {
      return NextResponse.json({ error: 'Feed URL is required' }, { status: 400 })
    }
    
    // Validate the feed first
    const validationResult = await validateFeed(feedUrl)
    
    if (!validationResult.isValid) {
      return NextResponse.json({ 
        error: validationResult.message || 'Invalid podcast feed' 
      }, { status: 400 })
    }
    
    // Add the feed to the user's subscriptions
    const result = await addFeed(session.user.id, feedUrl)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true,
      feedId: result.feedId,
      message: result.message,
      metadata: validationResult.metadata
    })
  } catch (error) {
    console.error('Error adding subscription:', error)
    return NextResponse.json({ error: 'Failed to add subscription' }, { status: 500 })
  }
}

// DELETE handler to remove a subscription
export async function DELETE(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get feed ID from request body
    const body = await request.json()
    const { feedId } = body
    
    if (!feedId) {
      return NextResponse.json({ error: 'Feed ID is required' }, { status: 400 })
    }
    
    // Remove the feed
    const result = await removeFeed(session.user.id, feedId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}