"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "./auth/auth-provider"

export default function Header() {
  const isMobile = useMobile()
  const { user, signIn, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {isMobile && (
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
        )}
        
        {!isMobile && <div className="w-6"></div>}

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
                onClick={() => signOut()}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={() => signIn('test@example.com', 'password')}
            >
              <User className="h-4 w-4" />
              <span className="hidden md:inline-block">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
