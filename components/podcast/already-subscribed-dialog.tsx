"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

interface AlreadySubscribedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedId?: string
  onTryAgain: () => void
}

export function AlreadySubscribedDialog({
  open,
  onOpenChange,
  feedId,
  onTryAgain
}: AlreadySubscribedDialogProps) {
  const router = useRouter()
  
  const handleViewPodcast = () => {
    if (feedId) {
      router.push(`/feeds/${feedId}`)
    } else {
      router.push('/feeds')
    }
    onOpenChange(false)
  }
  
  const handleTryAgain = () => {
    onTryAgain()
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6 text-[#c32b1a]" />
            <DialogTitle>Already Subscribed</DialogTitle>
          </div>
          <DialogDescription>
            You are already subscribed to this podcast. You can view it in your library or try adding a different podcast.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={handleTryAgain}
            className="w-full sm:w-auto"
          >
            Try Another
          </Button>
          <Button 
            onClick={handleViewPodcast} 
            className="w-full sm:w-auto bg-[#c32b1a] hover:bg-[#a82315] text-[#f9f0dc]"
          >
            View Podcast
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
