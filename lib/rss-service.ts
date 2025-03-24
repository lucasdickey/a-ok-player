import { supabase } from './supabase';
import { useMockAuth } from '@/components/auth/mock-auth-provider';

// Type for RSS feed metadata
export interface RSSFeedMetadata {
  title: string;
  description?: string;
  imageUrl?: string;
  author?: string;
  link?: string;
}

// Function to fetch and parse RSS feed
export async function fetchRSSFeed(url: string): Promise<RSSFeedMetadata | null> {
  try {
    // In a real implementation, this would call a server endpoint to fetch and parse the RSS
    // For this POC, we'll simulate a successful response with mock data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract domain from URL for the mock title
    const domain = new URL(url).hostname.replace('www.', '');
    
    return {
      title: `Podcast from ${domain}`,
      description: 'This is a mock description for the podcast feed.',
      imageUrl: 'https://placehold.co/400x400/4977/white?text=Podcast',
      author: 'Podcast Author',
      link: url
    };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return null;
  }
}

// Function to save RSS feed to user's library
export async function saveRSSFeed(userId: string, feedUrl: string, metadata: RSSFeedMetadata) {
  // In a real implementation, this would save to Supabase
  // For this POC, we'll save to localStorage
  
  const existingFeeds = JSON.parse(localStorage.getItem('rssFeeds') || '[]');
  
  // Check if feed already exists
  if (existingFeeds.some((feed: any) => feed.feedUrl === feedUrl)) {
    return { error: { message: 'This feed is already in your library' } };
  }
  
  // Add new feed
  const newFeed = {
    id: Date.now().toString(),
    userId,
    feedUrl,
    title: metadata.title,
    description: metadata.description,
    imageUrl: metadata.imageUrl,
    author: metadata.author,
    addedAt: new Date().toISOString()
  };
  
  existingFeeds.push(newFeed);
  localStorage.setItem('rssFeeds', JSON.stringify(existingFeeds));
  
  return { data: newFeed, error: null };
}

// Function to get user's RSS feeds
export function getUserRSSFeeds(userId: string) {
  const feeds = JSON.parse(localStorage.getItem('rssFeeds') || '[]');
  return feeds.filter((feed: any) => feed.userId === userId);
}
