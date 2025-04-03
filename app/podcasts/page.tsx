"use client";

import { useState } from "react";
import { podcasts } from "@/lib/podcast-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";

export default function PodcastsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter podcasts based on search query
  const filteredPodcasts = podcasts.filter(podcast => 
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#040605]">Podcasts</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#040605]/40 h-4 w-4" />
            <input
              type="text"
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full bg-[#f9f0dc] border border-[#040605]/10 focus:outline-none focus:ring-2 focus:ring-[#c32b1a] text-[#040605] text-sm w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#040605] hover:bg-[#f9f0dc]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9z"></path>
                <path d="M9 12h6"></path>
                <path d="M12 9v6"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-[#040605] hover:bg-[#f9f0dc]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredPodcasts.map((podcast) => (
          <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="block">
            <div className="flex items-center bg-[#040605] rounded-lg p-3 hover:bg-[#040605]/90 transition-all">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                <img
                  src={podcast.artwork || "/placeholder.svg"}
                  alt={podcast.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#f9f0dc] truncate">{podcast.title}</h3>
                <p className="text-sm text-[#f9f0dc]/70 truncate">{podcast.publisher}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-[#f9f0dc]/50 mr-2">24 minutes ago</span>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-[#f9f0dc] hover:text-[#c32b1a] hover:bg-transparent ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </Link>
        ))}
        
        {filteredPodcasts.length === 0 && (
          <div className="bg-[#040605]/10 rounded-lg p-8 text-center">
            <p className="text-[#040605]/60">No podcasts found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
