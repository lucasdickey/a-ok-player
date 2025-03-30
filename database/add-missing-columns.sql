-- Add all missing columns to podcast_subscriptions table

-- Add the remaining required columns to podcast_subscriptions table
ALTER TABLE public.podcast_subscriptions ADD COLUMN IF NOT EXISTS feed_url TEXT;
ALTER TABLE public.podcast_subscriptions ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.podcast_subscriptions ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE;

-- Verify all required columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcast_subscriptions' 
AND column_name IN ('id', 'user_id', 'title', 'description', 'author', 'image_url', 'feed_url', 'website_url', 'last_checked_at', 'created_at')
ORDER BY column_name;
