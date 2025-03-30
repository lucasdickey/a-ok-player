-- A-OK Player Database Schema Fix
-- This script fixes the database schema to match what the application expects

-- Create the missing episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL,
  guid TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  is_played BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(feed_id, guid)
);

-- Add foreign key constraint to episodes table
-- Note: This assumes podcast_subscriptions table already exists
ALTER TABLE public.episodes 
  ADD CONSTRAINT fk_episodes_podcast_subscriptions 
  FOREIGN KEY (feed_id) 
  REFERENCES public.podcast_subscriptions(id) 
  ON DELETE CASCADE;

-- Add missing description and author columns to podcast_subscriptions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'podcast_subscriptions' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'podcast_subscriptions' AND column_name = 'author'
  ) THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN author TEXT;
  END IF;
END $$;

-- Fix queue_items table - add added_at column if it doesn't exist
-- and remove created_at column if it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'queue_items' AND column_name = 'added_at'
  ) THEN
    ALTER TABLE public.queue_items ADD COLUMN added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'queue_items' AND column_name = 'created_at'
  ) THEN
    -- Copy data from created_at to added_at if both columns exist
    UPDATE public.queue_items SET added_at = created_at;
    -- Then drop the created_at column
    ALTER TABLE public.queue_items DROP COLUMN created_at;
  END IF;
END $$;

-- Fix playback_states table - rename position to last_position if needed
-- and add playback_rate column if it doesn't exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'playback_states' AND column_name = 'position'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'playback_states' AND column_name = 'last_position'
  ) THEN
    ALTER TABLE public.playback_states RENAME COLUMN position TO last_position;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'playback_states' AND column_name = 'playback_rate'
  ) THEN
    ALTER TABLE public.playback_states ADD COLUMN playback_rate REAL DEFAULT 1.0 NOT NULL;
  END IF;
END $$;

-- Enable Row Level Security for episodes table
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for episodes table
CREATE POLICY "Users can view episodes from their feeds"
  ON public.episodes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.podcast_subscriptions
    WHERE public.podcast_subscriptions.id = public.episodes.feed_id
    AND public.podcast_subscriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert episodes for their feeds"
  ON public.episodes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.podcast_subscriptions
    WHERE public.podcast_subscriptions.id = public.episodes.feed_id
    AND public.podcast_subscriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update episodes from their feeds"
  ON public.episodes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.podcast_subscriptions
    WHERE public.podcast_subscriptions.id = public.episodes.feed_id
    AND public.podcast_subscriptions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete episodes from their feeds"
  ON public.episodes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.podcast_subscriptions
    WHERE public.podcast_subscriptions.id = public.episodes.feed_id
    AND public.podcast_subscriptions.user_id = auth.uid()
  ));
