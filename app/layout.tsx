import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import PlayerProvider from "@/components/player/player-provider"
import PlayerTray from "@/components/player/player-tray"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { MockAuthProvider } from "@/components/auth/mock-auth-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "A-OK Player - Podcast App",
  description: "Discover and enjoy your favorite podcasts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MockAuthProvider>
            <PlayerProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto pb-24">{children}</main>
                  <PlayerTray />
                </div>
              </div>
              <Toaster />
            </PlayerProvider>
          </MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}