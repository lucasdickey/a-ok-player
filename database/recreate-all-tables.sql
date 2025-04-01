-- Recreate all tables for A-OK Player from scratch
-- This script will drop all existing tables and recreate them with the correct schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.playback_states CASCADE;
DROP TABLE IF EXISTS public.saved_episodes CASCADE;
DROP TABLE IF EXISTS public.queue_items CASCADE;
DROP TABLE IF EXISTS public.episodes CASCADE;
DROP TABLE IF EXISTS public.podcast_subscriptions CASCADE;

-- Create podcast_subscriptions table
CREATE TABLE public.podcast_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  author TEXT,
  image_url TEXT,
  feed_url TEXT NOT NULL,
  website_url TEXT,
  language TEXT DEFAULT 'en',
  explicit BOOLEAN DEFAULT false,
  categories TEXT[] DEFAULT '{}',
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  episode_count INTEGER DEFAULT 0
);

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.podcast_subscriptions(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  duration_formatted TEXT,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  chapters_url TEXT,
  transcript_url TEXT,
  season INTEGER,
  episode_number INTEGER,
  type TEXT DEFAULT 'full',
  explicit BOOLEAN DEFAULT false,
  is_played BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(feed_id, guid)
);

-- Create queue_items table
CREATE TABLE public.queue_items (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Create saved_episodes table
CREATE TABLE public.saved_episodes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Create playback_states table
CREATE TABLE public.playback_states (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_states ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for podcast_subscriptions
CREATE POLICY "Users can view their own podcast subscriptions"
  ON public.podcast_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own podcast subscriptions"
  ON public.podcast_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast subscriptions"
  ON public.podcast_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcast subscriptions"
  ON public.podcast_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for episodes
CREATE POLICY "Users can view episodes from their subscriptions"
  ON public.episodes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.podcast_subscriptions
      WHERE podcast_subscriptions.id = episodes.feed_id
      AND podcast_subscriptions.user_id = auth.uid()
    )
  );

-- Create RLS policies for queue_items
CREATE POLICY "Users can view their own queue items"
  ON public.queue_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items"
  ON public.queue_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue items"
  ON public.queue_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue items"
  ON public.queue_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for saved_episodes
CREATE POLICY "Users can view their own saved episodes"
  ON public.saved_episodes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved episodes"
  ON public.saved_episodes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved episodes"
  ON public.saved_episodes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for playback_states
CREATE POLICY "Users can view their own playback states"
  ON public.playback_states
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playback states"
  ON public.playback_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playback states"
  ON public.playback_states
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playback states"
  ON public.playback_states
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments to tables to refresh schema cache
COMMENT ON TABLE public.podcast_subscriptions IS 'Table for storing podcast subscriptions';
COMMENT ON TABLE public.episodes IS 'Table for storing podcast episodes with chapters_url, transcript_url, and other metadata';
COMMENT ON TABLE public.queue_items IS 'Table for storing user queue items';
COMMENT ON TABLE public.saved_episodes IS 'Table for storing user saved episodes';
COMMENT ON TABLE public.playback_states IS 'Table for storing user playback states';

-- Add comments to columns to ensure they are in the schema cache
COMMENT ON COLUMN public.episodes.chapters_url IS 'URL to podcast episode chapters file';
COMMENT ON COLUMN public.episodes.transcript_url IS 'URL to podcast episode transcript';
COMMENT ON COLUMN public.episodes.season IS 'Season number of the episode';
COMMENT ON COLUMN public.episodes.episode_number IS 'Episode number within the season';
COMMENT ON COLUMN public.episodes.type IS 'Type of episode (full, trailer, bonus)';
COMMENT ON COLUMN public.episodes.duration_formatted IS 'Human-readable duration of the episode';
COMMENT ON COLUMN public.episodes.explicit IS 'Whether the episode contains explicit content';
