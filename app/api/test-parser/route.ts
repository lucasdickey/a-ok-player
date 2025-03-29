import { NextRequest, NextResponse } from 'next/server'
import { validateFeed, addFeed } from '@/lib/feed-processor'

// Test URLs - a mix of popular podcasts with different feed formats
const testFeeds = [
  {
    name: "This American Life",
    url: "https://www.thisamericanlife.org/podcast/rss.xml"
  },
  {
    name: "The Daily (New York Times)",
    url: "https://feeds.simplecast.com/54nAGcIl"
  },
  {
    name: "Planet Money (NPR)",
    url: "https://feeds.npr.org/510289/podcast.xml"
  },
  {
    name: "TED Talks Daily",
    url: "https://feeds.megaphone.fm/TPG6175046888"
  },
  {
    name: "Radiolab",
    url: "https://feeds.simplecast.com/DGRPxE8O"
  }
];

export async function GET(request: NextRequest) {
  try {
    const results = [];
    
    for (const feed of testFeeds) {
      try {
        // Test feed validation
        const validationResult = await validateFeed(feed.url);
        
        results.push({
          name: feed.name,
          url: feed.url,
          isValid: validationResult.isValid,
          message: validationResult.message,
          metadata: validationResult.metadata
        });
      } catch (error) {
        results.push({
          name: feed.name,
          url: feed.url,
          isValid: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          error: true
        });
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error testing feeds:', error);
    return NextResponse.json({ error: 'Failed to test feeds' }, { status: 500 });
  }
}
