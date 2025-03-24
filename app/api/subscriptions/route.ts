import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseFeed } from '@/lib/rss-parser'

// GET handler to fetch all subscriptions for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user's subscribed podcasts
    const { data: subscriptions, error } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ subscriptions })
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
    
    // Check if the subscription already exists
    const { data: existingSubscription } = await supabase
      .from('podcast_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('feed_url', feedUrl)
      .maybeSingle()
    
    if (existingSubscription) {
      return NextResponse.json({ error: 'You are already subscribed to this podcast' }, { status: 400 })
    }
    
    // Parse the feed to get podcast info
    const { podcast } = await parseFeed(feedUrl)
    
    // Add the subscription to the database
    const { data, error } = await supabase
      .from('podcast_subscriptions')
      .insert({
        user_id: session.user.id,
        feed_url: feedUrl,
        title: podcast.title
      })
      .select()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ subscription: data[0], podcast })
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
    
    // Get subscription ID from request body
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }
    
    // Delete the subscription
    const { error } = await supabase
      .from('podcast_subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}