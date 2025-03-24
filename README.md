# A-OK Player

A podcast web app that allows users to add and manage RSS feeds, play episodes, and maintain a personal podcast library.

## Features

- User authentication with Supabase
- RSS feed input and management
- Podcast playback with queue management
- Bookmarking and saving episodes
- Playback state persistence across devices
- Search functionality across podcast titles, episode titles, and descriptions

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Supabase account

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/a-ok-player.git
cd a-ok-player
```

2. Install dependencies
```bash
pnpm install
```

3. Create a Supabase project
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Set up the database schema (instructions below)
   - Copy your project URL and anon key

4. Create a `.env.local` file
```bash
cp .env.example .env.local
```

5. Update the `.env.local` file with your Supabase credentials
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

6. Run the development server
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

Create the following tables in your Supabase database:

### podcast_subscriptions

```sql
create table
  public.podcast_subscriptions (
    id uuid not null default uuid_generate_v4(),
    created_at timestamp with time zone not null default now(),
    user_id uuid not null,
    feed_url text not null,
    title text null,
    constraint podcast_subscriptions_pkey primary key (id),
    constraint podcast_subscriptions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

### queue_items

```sql
create table
  public.queue_items (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null,
    episode_id text not null,
    position integer not null,
    added_at timestamp with time zone not null default now(),
    constraint queue_items_pkey primary key (id),
    constraint queue_items_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

### saved_episodes

```sql
create table
  public.saved_episodes (
    id uuid not null default uuid_generate_v4(),
    user_id uuid not null,
    episode_id text not null,
    created_at timestamp with time zone not null default now(),
    constraint saved_episodes_pkey primary key (id),
    constraint saved_episodes_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

### playback_states

```sql
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
  ) tablespace pg_default;
```

## Deployment to Vercel

1. Create a Vercel account if you don't have one
2. Set up a new project in Vercel and connect it to your GitHub repository
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy your project

## License

This project is licensed under the MIT License.