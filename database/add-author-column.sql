-- Direct approach to add the author column to podcast_subscriptions table
-- This script directly adds the column without conditional checks

-- Add the author column to podcast_subscriptions table
ALTER TABLE public.podcast_subscriptions ADD COLUMN IF NOT EXISTS author TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcast_subscriptions' AND column_name = 'author';
