-- A-OK Player Database Schema
-- This script creates the necessary tables for the A-OK Player application

-- Create podcast_feeds table
CREATE TABLE IF NOT EXISTS public.podcast_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  author TEXT,
  image_url TEXT,
  feed_url TEXT NOT NULL,
  website_url TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, feed_url)
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES public.podcast_feeds(id) ON DELETE CASCADE,
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

-- Create user_episode_progress table
CREATE TABLE IF NOT EXISTS public.user_episode_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Create user_queue table
CREATE TABLE IF NOT EXISTS public.user_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  playback_speed REAL DEFAULT 1.0 NOT NULL,
  auto_download BOOLEAN DEFAULT false NOT NULL,
  theme TEXT DEFAULT 'system' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create Row Level Security (RLS) policies
-- These policies ensure users can only access their own data

-- Podcast Feeds policies
ALTER TABLE public.podcast_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own podcast feeds"
  ON public.podcast_feeds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own podcast feeds"
  ON public.podcast_feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast feeds"
  ON public.podcast_feeds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcast feeds"
  ON public.podcast_feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Episodes policies
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view episodes from their feeds"
  ON public.episodes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.podcast_feeds
    WHERE public.podcast_feeds.id = public.episodes.feed_id
    AND public.podcast_feeds.user_id = auth.uid()
  ));

-- User Episode Progress policies
ALTER TABLE public.user_episode_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own episode progress"
  ON public.user_episode_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episode progress"
  ON public.user_episode_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episode progress"
  ON public.user_episode_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- User Queue policies
ALTER TABLE public.user_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue"
  ON public.user_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own queue"
  ON public.user_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue"
  ON public.user_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own queue"
  ON public.user_queue FOR DELETE
  USING (auth.uid() = user_id);

-- User Preferences policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
