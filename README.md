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

## Development Process Documentation

This project includes a `PROMPTS.md` file that documents the step-by-step development process used to build the A-OK Player application. The file contains:

- All prompts used to guide the development
- Implementation decisions and architectural choices
- Feature development sequence
- Deployment steps and configuration

Reviewing `PROMPTS.md` is helpful for:
- Understanding how the application was constructed
- Learning about the development workflow
- Getting context on design decisions
- Following the same process to build similar applications

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

You can create the necessary tables in your Supabase database by running the SQL script located in `supabase/schema.sql`. Follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/schema.sql` into the editor
5. Run the query to create all tables and set up Row Level Security (RLS) policies

This script will create the following tables:
- `podcast_subscriptions` - Stores user podcast subscriptions (RSS feeds)
- `queue_items` - Manages the playback queue
- `saved_episodes` - Tracks bookmarked/saved episodes
- `playback_states` - Stores playback position and rate for episodes

Each table includes Row Level Security policies to ensure users can only access their own data.

## Deployment to Vercel

1. Create a Vercel account if you don't have one
2. Set up a new project in Vercel and connect it to your GitHub repository
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy your project

## License

This project is licensed under the MIT License.