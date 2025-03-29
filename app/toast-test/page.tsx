"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ToastTestPage() {
  const { toast } = useToast()
  const [counter, setCounter] = useState(0)

  const showTestToast = () => {
    console.log("Showing test toast")
    setCounter(prev => prev + 1)
    
    toast({
      title: `Test Toast ${counter}`,
      description: "This is a test toast notification. If you see this, toasts are working!",
      variant: "default",
      duration: 10000,
    })
  }

  return (
    <div className="container max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Toast System Test</h1>
      <p className="text-muted-foreground">
        Click the button below to test if toast notifications are working.
      </p>
      
      <div className="space-y-4">
        <Button 
          onClick={showTestToast}
          className="w-full bg-[#c32b1a] hover:bg-[#a82315]"
        >
          Show Test Toast
        </Button>
        
        <p className="text-sm text-center">
          Toast trigger count: <span className="font-bold">{counter}</span>
        </p>
        
        <p className="text-xs text-muted-foreground">
          Open browser console (F12) to see if function is being called
        </p>
      </div>
    </div>
  )
}
