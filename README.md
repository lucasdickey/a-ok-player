# A-OK Player

A podcast web app that allows users to add and manage RSS feeds, play episodes, and maintain a personal podcast library.

## Features

- User authentication with Supabase (with mock authentication option for testing)
- RSS feed input and management with real-time feed parsing
- Podcast episode indexing and playback
- Episode streaming with playback controls
- Library management for subscribed podcasts
- "Your Stream" view of recent episodes from subscribed podcasts
- Responsive design with modern UI

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) for production, localStorage for development
- **Authentication**: Supabase Auth with mock option for local development
- **RSS Parsing**: rss-parser library with CORS proxy
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
- Supabase account (required for full functionality)

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
Create a `.env.local` file in the root directory with the following:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database
   - Create a new project in Supabase
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL script from `database/schema.sql` to create all tables
   - Ensure Row Level Security (RLS) policies are set up correctly

5. Start the development server
```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

This application uses Supabase (PostgreSQL) with the following tables:

- `podcast_subscriptions` - Stores user podcast subscriptions (RSS feeds)
- `episodes` - Stores podcast episode information
- `queue_items` - Manages the user's playback queue
- `saved_episodes` - Tracks episodes saved by users
- `playback_states` - Stores playback position and rate for episodes

### Table Structure Notes

- `playback_states` uses `last_position` (not "position") to store the playback position
- `playback_states` includes a `playback_rate` field for speed control
- `queue_items` uses `added_at` (not "created_at") for timestamp tracking

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

The application uses a comprehensive RSS feed-based approach for podcast discovery and management:

1. **Adding RSS Feeds**
   - Users can input podcast RSS feed URLs directly
   - The application fetches and parses the feed metadata using rss-parser
   - A CORS proxy (allorigins.win) is used to safely fetch feeds from any source
   - Feeds are saved to the user's library with complete metadata

2. **Episode Indexing**
   - All episodes from subscribed feeds are automatically indexed
   - Episode metadata is extracted, including title, description, publication date, and audio URL
   - Episodes are stored with references to their parent feed

3. **Storage Implementation**
   - **Development**: RSS feeds and episodes are stored in localStorage
   - **Production**: RSS feeds and episodes are stored in Supabase database

4. **Library Management**
   - The library page displays all subscribed RSS feeds in both card and list views
   - Users can view episodes for each podcast
   - Feed metadata is displayed, including title, description, author, and cover image

5. **Your Stream**
   - The home page displays recent episodes from all subscribed podcasts
   - Episodes can be filtered by time period (Today, This Week, All)
   - Users can refresh feeds to get the latest episodes

6. **Playback**
   - Episodes can be played directly from the library or stream views
   - Audio is streamed from the original source URL
   - Basic playback controls are implemented

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
6. Click "View Episodes" to see episodes for a specific podcast
7. Test the "Refresh" button to update your feeds with the latest episodes
8. Try playing an episode by clicking the play button

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Check that your environment variables are set correctly
2. Verify that all required tables exist in your Supabase database
3. Visit the debug page at [http://localhost:3000/debug](http://localhost:3000/debug) to test your connection
4. Ensure table names and column names match exactly as specified in the schema

### Fixing Database Schema Issues

If the debug page shows errors with missing tables or columns:

1. Go to your Supabase dashboard and open the SQL Editor
2. Run the schema fix script located in `database/schema-fix.sql`
3. This script will:
   - Create any missing tables (like the `episodes` table)
   - Add missing columns to existing tables
   - Rename columns that have incorrect names
   - Set up proper Row Level Security (RLS) policies

After running the script, return to the debug page and click "Test Schema Again" and "Test Structure Again" to verify that all issues have been resolved.

## Known Issues and Future Improvements

- **CORS Handling**: Some podcast feeds may have CORS restrictions that prevent direct fetching. The application uses a proxy service to mitigate this, but some feeds may still fail to load.
- **Feed Compatibility**: The RSS parser handles most standard podcast feeds, but some feeds with non-standard formats may not parse correctly.
- **Playback Queue**: The queue functionality is currently limited. Future updates will include a more robust queue management system.
- **Offline Support**: Adding offline support for downloaded episodes is planned for future releases.
- **Transcript Search**: Future versions will include transcript search capabilities for podcast content.

## License

This project is licensed under the MIT License.