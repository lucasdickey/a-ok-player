"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Radio, Library, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        
        <nav className="space-y-1">
          <NavItem href="/" icon={<Radio className="h-4 w-4" />} label="Your Stream" />
          <NavItem href="/library" icon={<Library className="h-4 w-4" />} label="Your Library" />
          <NavItem href="/queue" icon={<ListMusic className="h-4 w-4" />} label="Queue" />
        </nav>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="w-full justify-start">
        {icon}
        {label}
      </Button>
    </Link>
  )
}
