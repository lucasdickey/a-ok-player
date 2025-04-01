-- Script to refresh the Supabase schema cache for episodes table
-- Run this if you're experiencing issues with columns not being recognized

-- Refresh schema cache for episodes table
COMMENT ON TABLE public.episodes IS 'Table for storing podcast episodes with chapters_url, transcript_url, and other metadata';

-- Add comments to columns to ensure they are in the schema cache
COMMENT ON COLUMN public.episodes.chapters_url IS 'URL to podcast episode chapters file';
COMMENT ON COLUMN public.episodes.transcript_url IS 'URL to podcast episode transcript';
COMMENT ON COLUMN public.episodes.season IS 'Season number of the episode';
COMMENT ON COLUMN public.episodes.episode_number IS 'Episode number within the season';
COMMENT ON COLUMN public.episodes.type IS 'Type of episode (full, trailer, bonus)';
COMMENT ON COLUMN public.episodes.duration_formatted IS 'Human-readable duration of the episode';
COMMENT ON COLUMN public.episodes.explicit IS 'Whether the episode contains explicit content';

-- Refresh schema cache for podcast_subscriptions table
COMMENT ON TABLE public.podcast_subscriptions IS 'Table for storing podcast subscriptions';
COMMENT ON COLUMN public.podcast_subscriptions.episode_count IS 'Number of episodes in the podcast';

-- Force schema refresh by updating pg_catalog
SELECT pg_notify('supabase_realtime', 'reload_schema');
