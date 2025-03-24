-- Create podcast_subscriptions table
create table
  public.podcast_subscriptions (
    id uuid not null default uuid_generate_v4(),
    created_at timestamp with time zone not null default now(),
    user_id uuid not null,
    feed_url text not null,
    title text null,
    constraint podcast_subscriptions_pkey primary key (id),
    constraint podcast_subscriptions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Create queue_items table
create table
  public.queue_items (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null,
    episode_id text not null,
    position integer not null,
    added_at timestamp with time zone not null default now(),
    constraint queue_items_pkey primary key (id),
    constraint queue_items_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Create saved_episodes table
create table
  public.saved_episodes (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null,
    episode_id text not null,
    created_at timestamp with time zone not null default now(),
    constraint saved_episodes_pkey primary key (id),
    constraint saved_episodes_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Create playback_states table
create table
  public.playback_states (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null,
    episode_id text not null,
    last_position numeric not null default 0,
    playback_rate numeric not null default 1,
    updated_at timestamp with time zone not null default now(),
    constraint playback_states_pkey primary key (id),
    constraint playback_states_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Set up RLS policies
alter table public.podcast_subscriptions enable row level security;
alter table public.queue_items enable row level security;
alter table public.saved_episodes enable row level security;
alter table public.playback_states enable row level security;

-- Create policies for podcast_subscriptions
create policy "Users can view their own subscriptions"
  on public.podcast_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.podcast_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.podcast_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.podcast_subscriptions for delete
  using (auth.uid() = user_id);

-- Create policies for queue_items
create policy "Users can view their own queue items"
  on public.queue_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own queue items"
  on public.queue_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own queue items"
  on public.queue_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own queue items"
  on public.queue_items for delete
  using (auth.uid() = user_id);

-- Create policies for saved_episodes
create policy "Users can view their own saved episodes"
  on public.saved_episodes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved episodes"
  on public.saved_episodes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved episodes"
  on public.saved_episodes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved episodes"
  on public.saved_episodes for delete
  using (auth.uid() = user_id);

-- Create policies for playback_states
create policy "Users can view their own playback states"
  on public.playback_states for select
  using (auth.uid() = user_id);

create policy "Users can insert their own playback states"
  on public.playback_states for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own playback states"
  on public.playback_states for update
  using (auth.uid() = user_id);

create policy "Users can delete their own playback states"
  on public.playback_states for delete
  using (auth.uid() = user_id);