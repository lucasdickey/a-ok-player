"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Bell, User, Home, Search, Library, ListMusic, LogOut, Rss } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { useMockAuth } from "@/components/auth/mock-auth-provider"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const { user, signOut } = useMockAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const handleAuthClick = () => {
    if (!user) {
      router.push('/auth')
    }
  }

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
                  A-OK Player
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
                  icon={<Rss className="h-4 w-4 mr-3" />}
                  label="Add RSS Feed"
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
                    <div className="text-sm font-medium">{user ? user.email : 'Not logged in'}</div>
                    {user && <div className="text-xs text-muted-foreground">{user.email}</div>}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {isMobile && (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#004977] mr-auto">
            <div className="w-6 h-6 rounded-full bg-[#00CCCC] flex items-center justify-center text-white">P</div>
            A-OK Player
          </Link>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleAuthClick}>
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Button>
          )}
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
