import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET handler to fetch the user's queue
export async function GET(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user's queue items ordered by position
    const { data: queueItems, error } = await supabase
      .from('queue_items')
      .select('*')
      .eq('user_id', session.user.id)
      .order('position', { ascending: true })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ queue: queueItems })
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// POST handler to add an item to the queue
export async function POST(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get episode details from request body
    const body = await request.json()
    const { episodeId, position, playNext } = body
    
    if (!episodeId) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 })
    }
    
    // Get current queue to determine position
    const { data: currentQueue, error: queueError } = await supabase
      .from('queue_items')
      .select('*')
      .eq('user_id', session.user.id)
      .order('position', { ascending: true })
    
    if (queueError) {
      throw queueError
    }
    
    // Determine the position for the new item
    let newPosition = 0
    
    if (playNext && currentQueue && currentQueue.length > 0) {
      // If playNext is true, find the current playing item and insert after it
      const currentItem = currentQueue.find(item => item.is_current)
      const currentItemIndex = currentItem ? currentQueue.indexOf(currentItem) : -1
      
      if (currentItemIndex !== -1) {
        newPosition = currentQueue[currentItemIndex].position + 0.5
      } else {
        // If no current item, add to the beginning
        newPosition = currentQueue.length > 0 ? currentQueue[0].position - 1 : 0
      }
    } else if (currentQueue && currentQueue.length > 0) {
      // Otherwise, add to the end
      const lastItem = currentQueue[currentQueue.length - 1]
      newPosition = lastItem.position + 1
    }
    
    // Add the item to the queue
    const { data, error } = await supabase
      .from('queue_items')
      .insert({
        user_id: session.user.id,
        episode_id: episodeId,
        position: position !== undefined ? position : newPosition
      })
      .select()
    
    if (error) {
      throw error
    }
    
    // If playNext and there are items to reorder, update all positions
    if ((playNext || position !== undefined) && currentQueue && currentQueue.length > 0) {
      // Will need to reorder all items to ensure consistent positions
      await reorderQueue(session.user.id)
    }
    
    return NextResponse.json({ queueItem: data[0] })
  } catch (error) {
    console.error('Error adding to queue:', error)
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 })
  }
}

// PUT handler to update queue order
export async function PUT(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get ordered items from request body
    const body = await request.json()
    const { items } = body
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }
    
    // Update each item's position
    const updates = items.map((item, index) => 
      supabase
        .from('queue_items')
        .update({ position: index })
        .eq('id', item.id)
        .eq('user_id', session.user.id)
    )
    
    await Promise.all(updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating queue order:', error)
    return NextResponse.json({ error: 'Failed to update queue order' }, { status: 500 })
  }
}

// DELETE handler to remove an item from the queue
export async function DELETE(request: NextRequest) {
  try {
    // Get user session from cookie
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get item ID from request body
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Queue item ID is required' }, { status: 400 })
    }
    
    // Delete the item
    const { error } = await supabase
      .from('queue_items')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)
    
    if (error) {
      throw error
    }
    
    // Reorder the remaining items
    await reorderQueue(session.user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from queue:', error)
    return NextResponse.json({ error: 'Failed to remove from queue' }, { status: 500 })
  }
}

// Helper function to reorder queue items with sequential positions
async function reorderQueue(userId: string) {
  try {
    // Get current queue ordered by position
    const { data: currentQueue, error: queueError } = await supabase
      .from('queue_items')
      .select('id, position')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    
    if (queueError || !currentQueue) {
      throw queueError
    }
    
    // Update each item's position to be sequential
    const updates = currentQueue.map((item, index) => 
      supabase
        .from('queue_items')
        .update({ position: index })
        .eq('id', item.id)
        .eq('user_id', userId)
    )
    
    await Promise.all(updates)
    return true
  } catch (error) {
    console.error('Error reordering queue:', error)
    return false
  }
}