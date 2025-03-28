# AI-Enabled IDE Prompts for Podcast App Development

This document contains a series of prompts designed for AI-enabled IDEs like Windsurf or Cursor to help implement the podcast app based on our development plan. Each prompt focuses on a specific aspect of the development process and can be used sequentially to build the complete application.

## Project Setup Prompts

### Prompt 1: Project Initialization

```
Create a new Next.js project for a podcast app with TypeScript, Tailwind CSS, and shadcn/ui components. Set up the project with the following:
1. Initialize the project with the App Router
2. Configure Tailwind CSS
3. Set up shadcn/ui with the following components: button, card, dialog, form, input, slider, switch, toast
4. Configure the project for Supabase integration
5. Create a basic folder structure following a feature-based organization
```

### Prompt 2: Supabase Configuration

```
Set up Supabase for a podcast app with the following requirements:
1. Create the database schema with tables for:
   - podcast_feeds (id, user_id, title, description, author, image_url, feed_url, website_url, last_checked_at)
   - episodes (id, feed_id, guid, title, description, published_date, duration, audio_url, image_url, is_played)
   - user_episode_progress (user_id, episode_id, position, completed, last_played_at)
   - user_queue (user_id, episode_id, position)
   - user_preferences (user_id, playback_speed, auto_download, wifi_only, auto_delete, dark_mode)
2. Set up Row Level Security policies to ensure users can only access their own data
3. Create the necessary Supabase client configuration files
4. Set up authentication with email/password and magic link options
```

## Core Feature Implementation Prompts

### Prompt 3: Authentication and User Management

```
Implement authentication and user management for the podcast app using Supabase Auth:
1. Create login and registration pages with form validation
2. Implement the AuthProvider context to manage authentication state
3. Create protected routes that require authentication
4. Add user profile management with settings for email and password
5. Implement persistent login with refresh tokens
```

### Prompt 4: RSS Feed Management

```
Implement RSS feed management for the podcast app:
1. Create an AddFeedForm component that allows users to add podcast RSS feed URLs
2. Implement feed validation to ensure the URL is a valid podcast RSS feed
3. Create a FeedList component to display the user's subscribed podcasts
4. Implement the useFeeds hook to manage feed state and operations
5. Add the ability to remove feeds from the subscription list
```

### Prompt 5: RSS Parsing Implementation

```
Implement robust RSS parsing for the podcast app:
1. Create a parser utility that handles various podcast RSS feed formats
2. Implement fallback mechanisms for different field formats (GUID, audio URL, duration, etc.)
3. Add helper functions for parsing dates, durations, and HTML content
4. Implement error handling for malformed feeds
5. Create a feed processor that extracts episodes and metadata from feeds
```

### Prompt 6: Audio Player Implementation

```
Implement the core audio player functionality:
1. Create an AudioPlayer component with play, pause, seek, and volume controls
2. Implement the useAudio hook to manage audio state and playback
3. Add variable playback speed control (0.5x to 3x)
4. Implement playback position memory that syncs with Supabase
5. Add MediaSession API integration for background playback controls
6. Create a persistent player bar that stays visible while navigating
```

### Prompt 7: Episode Management

```
Implement episode management features:
1. Create an EpisodeList component to display episodes for a podcast
2. Implement the EpisodeDetails page with show notes and playback controls
3. Add the ability to mark episodes as played/unplayed
4. Implement sorting and filtering options for episodes
5. Create a search function to find episodes across podcasts
```

### Prompt 8: Queue and Playlist Management

```
Implement queue and playlist management:
1. Create a QueueProvider context to manage the playback queue
2. Implement the QueueList component to display and reorder the queue
3. Add functions to add, remove, and reorder episodes in the queue
4. Create a "Play Next" and "Add to Queue" feature for episodes
5. Implement auto-advance to the next episode in the queue
```

### Prompt 9: Download Management

```
Implement download management for offline playback:
1. Create a DownloadProvider context to manage downloads
2. Implement functions to download episodes using the Fetch API
3. Add IndexedDB storage for downloaded episodes
4. Create a DownloadList component to display and manage downloads
5. Implement Wi-Fi only download option
6. Add auto-delete functionality for played episodes
```

### Prompt 10: Settings and Preferences

```
Implement user settings and preferences:
1. Create a Settings page with sections for playback, downloads, and appearance
2. Implement the ThemeProvider for dark mode support
3. Add playback settings (default speed, auto-play)
4. Implement download settings (auto-download, Wi-Fi only, storage limits)
5. Add data synchronization settings
6. Create a sleep timer feature
```

## Edge Functions and Background Services

### Prompt 11: RSS Polling Service

```
Implement the RSS polling service using Supabase Edge Functions:
1. Create an Edge Function that runs on a schedule (hourly)
2. Implement feed fetching with timeout handling
3. Add logic to compare new episodes with existing ones
4. Create database operations to insert new episodes
5. Implement error handling and logging
6. Add user notification for new episodes
```

### Prompt 12: Offline Support

```
Implement comprehensive offline support:
1. Set up a service worker for offline access
2. Create offline detection using the useOffline hook
3. Implement offline playback from IndexedDB storage
4. Add offline state indicators in the UI
5. Create sync mechanisms for when connection is restored
6. Implement offline queue management
```

## UI Enhancement and Optimization

### Prompt 13: Responsive Design

```
Enhance the responsive design of the podcast app:
1. Optimize layouts for mobile, tablet, and desktop viewports
2. Create adaptive components that change behavior based on screen size
3. Implement touch-friendly controls for mobile
4. Add swipe gestures for common actions
5. Optimize the audio player for different screen sizes
6. Ensure accessibility across all device types
```

### Prompt 14: Performance Optimization

```
Optimize the performance of the podcast app:
1. Implement code splitting and lazy loading for components
2. Add image optimization for podcast artwork
3. Optimize audio streaming with adaptive bitrates
4. Implement virtualized lists for large podcast libraries
5. Add caching strategies for frequently accessed data
6. Optimize database queries and state management
```

## Native App Porting

### Prompt 15: Capacitor Integration

```
Implement Capacitor integration for native app porting:
1. Set up Capacitor in the Next.js project
2. Configure native plugins for audio playback
3. Implement background audio for native platforms
4. Add native notification support
5. Configure deep linking
6. Set up app icons and splash screens
7. Prepare build configurations for iOS and Android
```

## Testing and Deployment

### Prompt 16: Testing Implementation

```
Implement testing for the podcast app:
1. Set up Jest for unit testing
2. Create component tests for key UI elements
3. Implement hook tests for custom React hooks
4. Add integration tests for critical user flows
5. Set up end-to-end tests with Cypress
6. Create mock services for Supabase
```

### Prompt 17: Deployment Configuration

```
Configure deployment for the podcast app:
1. Set up Vercel deployment for the Next.js application
2. Configure environment variables for production
3. Set up CI/CD pipeline with GitHub Actions
4. Implement preview deployments for pull requests
5. Configure error monitoring with Sentry
6. Set up analytics tracking
7. Prepare app store submissions for iOS and Android
```

## Using These Prompts

To make the most of these prompts in AI-enabled IDEs:

1. Use them sequentially as you progress through development
2. Provide context from previous implementations when using later prompts
3. Adjust the prompts based on your specific requirements or changes to the plan
4. Break down complex prompts into smaller, more focused requests when needed
5. Include relevant code snippets from your current implementation when asking for enhancements

These prompts are designed to guide the AI through the complete development process of the podcast app, from initial setup to deployment, following the architecture and roadmap outlined in our development plan.
