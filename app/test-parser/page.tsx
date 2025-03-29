"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function TestParserPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test-parser')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setResults(data.results || [])
    } catch (err) {
      console.error('Error running tests:', err)
      setError(err instanceof Error ? err.message : 'Failed to run tests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Enhanced RSS Parser Tests</h1>
        <Button onClick={runTests} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Tests
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{result.name}</CardTitle>
                {result.isValid ? (
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    Valid
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <X className="h-5 w-5 mr-1" />
                    Invalid
                  </div>
                )}
              </div>
              <CardDescription className="truncate">{result.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Status Message:</p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
                
                {result.isValid && result.metadata && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Metadata:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Title:</p>
                        <p className="text-sm">{result.metadata.title}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Author:</p>
                        <p className="text-sm">{result.metadata.author || 'N/A'}</p>
                      </div>
                      {result.metadata.imageUrl && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-xs text-muted-foreground">Artwork:</p>
                          <img 
                            src={result.metadata.imageUrl} 
                            alt={result.metadata.title} 
                            className="h-24 w-24 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs text-muted-foreground">Description:</p>
                        <p className="text-sm line-clamp-3">{result.metadata.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(result.url, '_blank')}
              >
                View Feed Source
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
