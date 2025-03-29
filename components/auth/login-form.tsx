"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from './auth-provider'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Show loading toast
    toast({
      title: "Logging in",
      description: "Please wait...",
    })

    try {
      // Add console log to see what's happening
      console.log("Attempting to sign in with:", { email })
      
      const { error, data } = await signIn(email, password)
      
      console.log("Sign in result:", { error, data })
      
      if (error) {
        console.error("Login error:", error)
        
        // Check for email not confirmed error
        if (error.message && error.message.includes("Email not confirmed")) {
          setIsLoading(false)
          toast({
            title: "Email Not Verified",
            description: "Please check your email for a verification link and confirm your account before logging in.",
            variant: "destructive",
            duration: 8000,
          })
          return
        }
        
        // Handle other errors
        setIsLoading(false)
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Success!",
        description: "You've been logged in successfully."
      })
    } catch (error: any) {
      console.error("Unexpected login error:", error)
      
      // Check for email not confirmed error in the caught exception
      const errorMessage = error?.message || "Please try again later.";
      
      if (errorMessage.includes("Email not confirmed") || 
          (error?.error_description && error.error_description.includes("Email not confirmed"))) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email for a verification link and confirm your account before logging in.",
          variant: "destructive",
          duration: 8000,
        })
      } else {
        toast({
          title: "An error occurred",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-[#c32b1a] hover:bg-[#a82315]" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}