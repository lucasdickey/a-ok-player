"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{
    error: Error | null
    data: {
      user: User | null
      session: Session | null
    }
  }>
  signUp: (email: string, password: string) => Promise<{
    error: Error | null
    data: {
      user: User | null
      session: Session | null
    }
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for testing
const mockUser: User = {
  id: 'mock-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@aokplayer.com',
  role: 'authenticated',
  updated_at: new Date().toISOString()
}

// Mock session for testing
const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
}

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for saved auth in localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('mock_auth')
    if (savedAuth) {
      setUser(mockUser)
      setSession(mockSession)
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simple mock authentication - accept any credentials
    setUser(mockUser)
    setSession(mockSession)
    localStorage.setItem('mock_auth', 'true')
    
    return {
      error: null,
      data: {
        user: mockUser,
        session: mockSession
      }
    }
  }

  const signUp = async (email: string, password: string) => {
    // Simple mock signup - automatically succeeds
    setUser(mockUser)
    setSession(mockSession)
    localStorage.setItem('mock_auth', 'true')
    
    return {
      error: null,
      data: {
        user: mockUser,
        session: mockSession
      }
    }
  }

  const signOut = async () => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('mock_auth')
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useMockAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}
