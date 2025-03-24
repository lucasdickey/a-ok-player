"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, User, Home, Search, Library, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#004977]">
                  <div className="w-8 h-8 rounded-full bg-[#00CCCC] flex items-center justify-center text-white">P</div>
                  PodWave
                </Link>
              </div>
              <nav className="space-y-1 p-2">
                <MobileNavItem
                  href="/"
                  icon={<Home className="h-4 w-4 mr-3" />}
                  label="Discover"
                  active={pathname === "/"}
                />
                <MobileNavItem
                  href="/search"
                  icon={<Search className="h-4 w-4 mr-3" />}
                  label="Search"
                  active={pathname === "/search"}
                />
                <MobileNavItem
                  href="/library"
                  icon={<Library className="h-4 w-4 mr-3" />}
                  label="Your Library"
                  active={pathname === "/library"}
                />
                <MobileNavItem
                  href="/queue"
                  icon={<ListMusic className="h-4 w-4 mr-3" />}
                  label="Queue"
                  active={pathname === "/queue"}
                />
              </nav>
              <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#9EDEDA]"></div>
                  <div>
                    <div className="text-sm font-medium">User Name</div>
                    <div className="text-xs text-muted-foreground">user@example.com</div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {isMobile && (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#004977] mr-auto">
            <div className="w-6 h-6 rounded-full bg-[#00CCCC] flex items-center justify-center text-white">P</div>
            PodWave
          </Link>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

interface MobileNavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function MobileNavItem({ href, icon, label, active }: MobileNavItemProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" className={`w-full justify-start ${active ? "bg-[#D8EFE9] text-[#004977]" : ""}`}>
        {icon}
        {label}
      </Button>
    </Link>
  )
}

