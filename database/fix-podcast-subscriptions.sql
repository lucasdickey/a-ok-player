-- Fix podcast_subscriptions table schema and refresh cache

-- First, ensure all required columns exist
DO $$
BEGIN
  -- Check and add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'categories') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN categories TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'language') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN language TEXT DEFAULT 'en';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'explicit') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN explicit BOOLEAN DEFAULT false;
  END IF;
  
  -- Ensure all other required columns exist with proper types
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'description') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'author') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN author TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'image_url') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'feed_url') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN feed_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'website_url') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN website_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_subscriptions' AND column_name = 'last_checked_at') THEN
    ALTER TABLE public.podcast_subscriptions ADD COLUMN last_checked_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Force refresh the schema cache
COMMENT ON TABLE public.podcast_subscriptions IS 'Table for storing podcast subscriptions';

-- Recreate RLS policies to ensure proper access
ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'podcast_subscriptions' AND policyname = 'Users can view their own podcast subscriptions'
    ) THEN
        DROP POLICY "Users can view their own podcast subscriptions" ON public.podcast_subscriptions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'podcast_subscriptions' AND policyname = 'Users can insert their own podcast subscriptions'
    ) THEN
        DROP POLICY "Users can insert their own podcast subscriptions" ON public.podcast_subscriptions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'podcast_subscriptions' AND policyname = 'Users can update their own podcast subscriptions'
    ) THEN
        DROP POLICY "Users can update their own podcast subscriptions" ON public.podcast_subscriptions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'podcast_subscriptions' AND policyname = 'Users can delete their own podcast subscriptions'
    ) THEN
        DROP POLICY "Users can delete their own podcast subscriptions" ON public.podcast_subscriptions;
    END IF;
END $$;

-- Create new policies
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
