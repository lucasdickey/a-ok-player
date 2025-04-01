-- Add INSERT policy for episodes table
-- This allows episodes to be inserted when they belong to a podcast subscription owned by the authenticated user

-- Create policy for inserting episodes
CREATE POLICY "Users can insert episodes for their subscriptions"
  ON public.episodes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.podcast_subscriptions
      WHERE podcast_subscriptions.id = feed_id
      AND podcast_subscriptions.user_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies as well for completeness
CREATE POLICY "Users can update episodes from their subscriptions"
  ON public.episodes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.podcast_subscriptions
      WHERE podcast_subscriptions.id = feed_id
      AND podcast_subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete episodes from their subscriptions"
  ON public.episodes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.podcast_subscriptions
      WHERE podcast_subscriptions.id = feed_id
      AND podcast_subscriptions.user_id = auth.uid()
    )
  );

-- Force schema refresh
SELECT pg_notify('supabase_realtime', 'reload_schema');
