// Simple test script for the enhanced RSS parser
import { parseFeed, isValidPodcastFeed, fixFeedUrl } from '../lib/enhanced-rss-parser.js';

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

// Test each feed
async function runTests() {
  console.log("🧪 Testing Enhanced RSS Parser...\n");
  
  for (const feed of testFeeds) {
    console.log(`Testing: ${feed.name} (${feed.url})`);
    
    try {
      // Test URL fixing
      const fixedUrl = fixFeedUrl(feed.url);
      console.log(`  ✓ URL fixing: ${fixedUrl}`);
      
      // Test feed validation
      const isValid = await isValidPodcastFeed(fixedUrl);
      console.log(`  ${isValid ? '✓' : '✗'} Feed validation: ${isValid ? 'Valid podcast feed' : 'Not a valid podcast feed'}`);
      
      if (isValid) {
        // Test full parsing
        const { podcast, episodes } = await parseFeed(fixedUrl);
        console.log(`  ✓ Feed parsing successful`);
        console.log(`    - Title: ${podcast.title}`);
        console.log(`    - Author: ${podcast.publisher}`);
        console.log(`    - Episodes: ${episodes.length}`);
        
        if (episodes.length > 0) {
          const firstEpisode = episodes[0];
          console.log(`    - Latest episode: ${firstEpisode.title}`);
          console.log(`    - Duration: ${firstEpisode.duration || 'N/A'}`);
          console.log(`    - Audio URL: ${firstEpisode.enclosure?.url || 'N/A'}`);
        }
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }
    
    console.log("\n---\n");
  }
  
  console.log("Tests completed!");
}

runTests().catch(console.error);
