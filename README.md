# A-OK Player

A podcast web app that allows users to add and manage RSS feeds, play episodes, and maintain a personal podcast library.

## Features

- User authentication with Supabase (with mock authentication option for testing)
- RSS feed input and management
- Podcast playback with queue management
- Bookmarking and saving episodes
- Playback state persistence across devices
- Library management for subscribed podcasts

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with mock option for local development
- **State Management**: Local Storage (for development) and Supabase (for production)
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
- npm or pnpm
- Supabase account (optional for local development)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/a-ok-player.git
cd a-ok-player
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
   - For local development without Supabase, you can use the mock authentication:
     ```bash
     cp .env.local.example .env.local
     ```
   - For Supabase integration:
     - Create a Supabase project
     - Set up the database schema (instructions below)
     - Copy your project URL and anon key to `.env.local`

4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Application Architecture

### Authentication

The application supports two authentication modes:

1. **Supabase Authentication (Production)**
   - Uses Supabase Auth for user management
   - Requires valid Supabase credentials in `.env.local`
   - Provides secure, persistent authentication across sessions

2. **Mock Authentication (Development)**
   - Simulates authentication flow without requiring Supabase
   - Uses localStorage to persist authentication state
   - Ideal for local development and testing
   - Enabled by default in the application

To switch between authentication modes, modify the `_app.tsx` file to use either the `AuthProvider` (Supabase) or `MockAuthProvider` (local development).

### RSS Feed Management

The application now uses an RSS feed-based approach instead of a search-based podcast discovery:

1. **Adding RSS Feeds**
   - Users can input podcast RSS feed URLs directly
   - The application fetches and parses the feed metadata
   - Feeds are saved to the user's library

2. **Storage Options**
   - **Development**: RSS feeds are stored in localStorage
   - **Production**: RSS feeds are stored in Supabase database

3. **Library Management**
   - The library page displays all subscribed RSS feeds
   - Users can view and manage their subscriptions

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

The application is currently deployed at: https://a-ok-player-krwpvvb3l-lucasdickeys-projects.vercel.app

## Testing

### Mock Authentication

For testing the application without Supabase:
1. Use the mock authentication system
2. Default test credentials:
   - Email: `testuser@aokplayer.com`
   - Password: `TestPassword123!`

### RSS Feed Testing

To test the RSS feed functionality:
1. Navigate to the "Add RSS Feed" page
2. Enter a valid podcast RSS feed URL (e.g., https://feeds.simplecast.com/54nAGcIl)
3. Preview the feed metadata
4. Add the feed to your library
5. View your subscribed feeds in the Library page

## License

This project is licensed under the MIT License.