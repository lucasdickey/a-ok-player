"use client"

import Link from "next/link"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar() {
  const isMobile = useMobile()

  if (isMobile) {
    return null
  }

  return (
    <div className="h-full w-60 border-r bg-background flex flex-col">
      <div className="p-3">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Image 
            src="/images/a-ok-player-logo.png" 
            alt="A-OK Player Logo" 
            width={48} 
            height={48} 
            className="h-12 w-12"
          />
          <span className="text-lg font-semibold text-foreground">A-OK Player</span>
        </Link>
        
        {/* Sidebar content can be added here in the future */}
      </div>
    </div>
  )
}
