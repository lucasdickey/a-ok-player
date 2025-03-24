"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Library, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"
import { podcasts } from "@/lib/podcast-data"

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()

  if (isMobile) {
    return null
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#004977]">
          <div className="w-8 h-8 rounded-full bg-[#00CCCC] flex items-center justify-center text-white">P</div>
          PodWave
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-2">
          <NavItem href="/" icon={<Home className="h-4 w-4 mr-3" />} label="Discover" active={pathname === "/"} />
          <NavItem
            href="/search"
            icon={<Search className="h-4 w-4 mr-3" />}
            label="Search"
            active={pathname === "/search"}
          />
          <NavItem
            href="/library"
            icon={<Library className="h-4 w-4 mr-3" />}
            label="Your Library"
            active={pathname === "/library"}
          />
          <NavItem
            href="/queue"
            icon={<ListMusic className="h-4 w-4 mr-3" />}
            label="Queue"
            active={pathname === "/queue"}
          />
        </nav>

        <div className="py-4">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Your Subscriptions</h3>
          <div className="space-y-1">
            {podcasts.slice(0, 5).map((podcast) => (
              <Link key={podcast.id} href={`/podcast/${podcast.id}`}>
                <Button variant="ghost" className="w-full justify-start font-normal text-sm">
                  {podcast.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Removed duplicate user profile section */}
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" className={`w-full justify-start ${active ? "bg-[#D8EFE9] text-[#004977]" : ""}`}>
        {icon}
        {label}
      </Button>
    </Link>
  )
}

