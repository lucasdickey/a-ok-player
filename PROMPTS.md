# A-OK Player Development Prompts

This document contains the sequence of prompts used to build the A-OK Player podcast application, allowing anyone to recreate the development process step by step.

## 1. Initial Application Design

```
Design a podcast web app that has all the standard features:

Discovery via browse mode of catalog (stub this out, I'll have APIs later)
Discovery via search mode (stub this out, I'll have APIs here later, too) 2.a Search should account for keyword search across podcast name and episode name, as well as transcript search.
A library of podcast subscriptions.
A library of saved episodes.
A episode playback queue
A player that has the following functionality: 6.a Playback 6.b Pause 6.c Seek ahead 30 seconds 6.d Seek back 30 seconds 6.e Jump to next episode in queue 6.f Control playback speed
The player tray should display the podcast title and episode title.
On desktop, the player tray will show artwork on hover.
On mobile, the artwork will always be displayed.
Use common front-end component libraries (Shadcn) and design frameworks (TailWind) plus NextJS on the front end.
Pull from the color list below for primary actions, secondary actions, text, titles, hover states, and the like.
The player tray should be expandable to show the entire playback queue.
The queue:

The user should be able to add episodes from a podcast page to a playback queue, either next in the queue or at the of the queue.
The user should be able to remove tracks from the queue as well as rearrange tracks in the queue.
The user should be able to add bookmarked episodes back to their queue.
State:

The player should remember the last point the user was at when the paused or cease playback, either by hitting the pause button or skipping to another episode.
The user's queue, bookmarks, and subscribed podcasts should be accessible as they move from browser instance to browser instance, meaning they need an account.
Color list: 
#004977 
#007187 
#009BA4 
#00CCCC 
#9EDEDA 
#D8EFE9 
#FAE67E 
#FCEFB9 
#FEF6DC 
#CE2090 
#ED9FBA 
#FFFCF6 
#091017 
#46494D 
#F2F2F3 
#FFFFFF
```

## 2. Backend Requirements Revision

```
I'd like to review with you the initial requirements that I gave to v0.dev and see if you come to any alternative implementations. After that, I'd like you to proceed with back-end. I'd like to deploy this app with Vercel. I'd like the database in somwewhere SaaS based (Supabase or Neon).
```

## 3. Backend Implementation Scope Definition

```
I'd like for all of that. But with a few exceptions. For this initial proof of concept, I want the index input via a simple interface by the user -- i.e. they'll put in the RSS feeds they're interested in and we'll add it to the database for them specific to their account. On each time they load the player, you will scan all the RSS feeds they're subscribed to and fetch in the latest information. There is no need to recall historical states of RSS feed XMLs. Also, let's not do transcript search initially. Let's come back to that. So search to start will be just keyword search on podcast title and episode title and episode description based on the catalog the user creates with manuall RSS feed addition.
```

## 4. Supabase Database Schema and API Implementation

This step involved creating:

1. Supabase database schema for:
   - Podcast subscriptions
   - Queue items
   - Saved episodes
   - Playback states

2. Backend API routes for:
   - Authentication
   - RSS feed parsing and management
   - Podcast and episode data retrieval
   - Queue management
   - Playback state persistence
   - Basic search functionality

3. Authentication components:
   - Auth provider context
   - Login form
   - Signup form

4. RSS feed addition interface

Implementation steps:
1. Set up Supabase client and type definitions
2. Create authentication provider and components
3. Implement RSS feed parser utility
4. Develop API routes for all core functionality
5. Update application layout to include authentication

```
Implement Supabase database schema, API routes, and authentication for a podcast app that:
1. Allows users to add RSS feeds manually
2. Parses and stores podcast data from those feeds
3. Manages user subscriptions, queue, saved episodes and playback state
4. Provides search across podcast title, episode title and description
5. Prepares for Vercel deployment
```

## 5. Github Repository Setup

```
Create a Git repository for the project and push all changes
```

## 6. Supabase Project Setup

```
Guide me through setting up a Supabase project for this application, including:
1. Creating a new project
2. Setting up the database schema
3. Configuring authentication
4. Connecting it to the application
```

## 7. Frontend Integration with Backend

```
Integrate the backend API with the frontend components:
1. Connect authentication to the UI
2. Update podcast discovery to use real subscriptions
3. Connect player and queue to use persistent state
4. Implement the search functionality
```

## 8. Deployment to Vercel

```
Guide me through deploying the application to Vercel:
1. Setting up a Vercel project
2. Configuring environment variables
3. Connecting to the Supabase backend
4. Deploying the application
```

## 9. Vercel Deployment Process

```
I do have a Vercel account. guide me through creating a new project and adding it to the a-ok-player project we were just working on
```

### Deployment Steps Executed:
1. Installed Vercel CLI: `npm install -g vercel`
2. Logged in via CLI: `vercel login`
3. Initialized deployment: `vercel`
4. Created new project: `a-ok-player`
5. Confirmed root directory and build settings
6. Deployed to production: `vercel --prod`
7. Successfully deployed to: https://a-ok-player-krwpvvb3l-lucasdickeys-projects.vercel.app
8. Connected GitHub repository to Vercel for automatic deployments
9. Added Supabase environment variables in Vercel dashboard

## 10. Local Development Setup

```
can we deploy this application locally so I can interface with it?
```

### Local Deployment Steps:
1. Verified .env.local file with Supabase credentials
2. Started local development server: `npm run dev`
3. Accessed application at http://localhost:3000

## 11. Testing and Refinement

```
Help me test and refine the application:
1. Create test user accounts
2. Add sample RSS feeds
3. Test playback and queue functionality
4. Verify persistence across sessions
5. Identify and fix any issues
```

## 12. Authentication Implementation

```
Let's implement the authentication flow for the application:
1. Create an AuthProvider component
2. Update the header to show authentication status
3. Create a script to generate test users for local development
```

### Authentication Implementation Steps:
1. Created AuthProvider component to manage user authentication state
2. Updated header component to display user authentication status
3. Added functionality to the account icon for login/logout
4. Created a test user creation script (create-test-user.js)
5. Established test user credentials:
   - Email: testuser@aokplayer.com
   - Password: TestPassword123!

## 13. Mock Authentication for Testing

```
We're encountering authentication issues with Supabase. Let's create a mock authentication system for testing purposes.
```

### Mock Authentication Implementation:
1. Created a MockAuthProvider component to simulate authentication
2. Updated the application to use the mock provider
3. Modified the header and auth forms to work with mock authentication
4. Implemented localStorage-based persistence for authentication state

## 14. RSS Feed Management

```
Let's change "search" with "Add RSS Feed" and that page will take an RSS feed URL as an input, and save to the user's Library
```

### RSS Feed Management Implementation:
1. Created an RSS service for handling feed operations:
   - Fetching and parsing RSS feeds
   - Saving feeds to user's library
   - Retrieving user's subscribed feeds
2. Transformed the search page into an "Add RSS Feed" page:
   - Form for entering RSS feed URLs
   - Preview of feed content before adding
   - Suggestions for popular podcast feeds
3. Updated the library page to display user's subscribed feeds
4. Modified navigation in header and sidebar to reflect the new functionality
5. Implemented localStorage-based persistence for RSS feed data

## 15. Recent Changes

```
Update the PROMPTS.md file to document the recent changes we've made to the application
```

### Recent Changes Documentation:
1. Documented the implementation of authentication flow
2. Documented the creation of mock authentication system for testing
3. Documented the changes to RSS feed management
4. Documented the recent deployment to Vercel
5. Documented the local development setup

*Note: This document will be updated throughout the development process to include all prompts used in creating the A-OK Player application.*