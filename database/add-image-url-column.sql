-- Direct approach to add the image_url column to podcast_subscriptions table

-- Add the image_url column to podcast_subscriptions table
ALTER TABLE public.podcast_subscriptions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcast_subscriptions' AND column_name = 'image_url';
