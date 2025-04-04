"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell, User, Library, ListMusic } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "./auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function Header() {
  const isMobile = useMobile()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      toast({
        title: "Signing out",
        description: "Please wait...",
      })
      await signOut()
      toast({
        title: "Success",
        description: "You have been signed out",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/images/a-ok-player-logo.png" 
              alt="A-OK Player Logo" 
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="font-bold">A-OK Player</span>
          </Link>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-2 ml-6">
            <Link href="/library">
              <Button variant="ghost" size="sm" className="gap-2">
                <Library className="h-4 w-4" />
                <span>Your Library</span>
              </Button>
            </Link>
            <Link href="/queue">
              <Button variant="ghost" size="sm" className="gap-2">
                <ListMusic className="h-4 w-4" />
                <span>Queue</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={handleSignOut}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">Sign Out</span>
              </Button>
            </>
          ) : (
            <a href="/auth">
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 bg-[#c32b1a] hover:bg-[#a82315]"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">Sign In</span>
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
