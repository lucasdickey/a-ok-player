import { NextRequest, NextResponse } from 'next/server';

/**
 * API route that acts as a proxy for fetching RSS feeds
 * This helps avoid CORS issues when fetching feeds from the client side
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    // Fetch the content from the provided URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'A-OK Player/1.0 (RSS Feed Proxy)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from URL: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/xml';
    
    // Get the content as text
    const content = await response.text();
    
    // Return the content with the appropriate content type
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
