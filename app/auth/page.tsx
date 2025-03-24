"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from '@/components/auth/login-form'
import SignupForm from '@/components/auth/signup-form'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#009BA4]"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#004977] mb-2">Welcome to PodWave</h1>
        <p className="text-muted-foreground">Your personal podcast companion</p>
      </div>

      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-8">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                onClick={() => setActiveTab("signup")}
                className="text-[#009BA4] hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm />
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => setActiveTab("login")}
                className="text-[#009BA4] hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}