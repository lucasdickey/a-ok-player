"use client"

import { useState, useEffect } from "react"
import { testSupabaseConnection, testDatabaseSchema, testTableStructure } from "@/lib/supabase-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [structureStatus, setStructureStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
      
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing connection:", error)
      setConnectionStatus({
        success: false,
        message: "Exception occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSchema = async () => {
    setIsLoading(true)
    try {
      const result = await testDatabaseSchema()
      setSchemaStatus(result)
      
      toast({
        title: result.success ? "Schema Check Successful" : "Schema Check Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing schema:", error)
      setSchemaStatus({
        success: false,
        message: "Exception occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the schema",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testStructure = async () => {
    setIsLoading(true)
    try {
      const result = await testTableStructure()
      setStructureStatus(result)
      
      toast({
        title: result.success ? "Structure Check Successful" : "Structure Check Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing structure:", error)
      setStructureStatus({
        success: false,
        message: "Exception occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the table structure",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check connection on page load
  useEffect(() => {
    const runTests = async () => {
      await testConnection()
      await testSchema()
      await testStructure()
    }
    
    runTests()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Diagnostics</h1>
      
      <Tabs defaultValue="connection" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Test your Supabase connection</CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${connectionStatus.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{connectionStatus.success ? 'Connected' : 'Not Connected'}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Message:</h3>
                    <p>{connectionStatus.message}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Details:</h3>
                    <p className="text-sm">{connectionStatus.details}</p>
                  </div>
                  
                  {connectionStatus.error && (
                    <div>
                      <h3 className="font-medium">Error:</h3>
                      <pre className="text-xs p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(connectionStatus.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p>Testing connection...</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testConnection} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Connection Again"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>Check if all required tables exist</CardDescription>
            </CardHeader>
            <CardContent>
              {schemaStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${schemaStatus.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{schemaStatus.success ? 'Schema Valid' : 'Schema Invalid'}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Message:</h3>
                    <p>{schemaStatus.message}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Details:</h3>
                    <p className="text-sm">{schemaStatus.details}</p>
                  </div>
                  
                  {schemaStatus.tables && (
                    <div>
                      <h3 className="font-medium">Tables:</h3>
                      <div className="mt-2 border rounded overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Table</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schemaStatus.tables.map((table: any, index: number) => (
                              <tr key={index} className="border-t">
                                <td className="px-4 py-2">{table.table}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block w-2 h-2 rounded-full ${table.exists ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                                  {table.exists ? 'Exists' : 'Missing'}
                                </td>
                                <td className="px-4 py-2 text-red-500">{table.error || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>Testing schema...</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testSchema} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Schema Again"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Table Structure</CardTitle>
              <CardDescription>Check if tables have the required columns</CardDescription>
            </CardHeader>
            <CardContent>
              {structureStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${structureStatus.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{structureStatus.success ? 'Structure Valid' : 'Structure Invalid'}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Message:</h3>
                    <p>{structureStatus.message}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Details:</h3>
                    <p className="text-sm">{structureStatus.details}</p>
                  </div>
                  
                  {structureStatus.tables && (
                    <div>
                      <h3 className="font-medium">Tables:</h3>
                      <div className="mt-2 border rounded overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">Table</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {structureStatus.tables.map((table: any, index: number) => (
                              <tr key={index} className="border-t">
                                <td className="px-4 py-2">{table.table}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block w-2 h-2 rounded-full ${table.valid ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                                  {table.valid ? 'Valid' : 'Invalid'}
                                </td>
                                <td className="px-4 py-2 text-red-500">{table.error || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>Testing table structure...</p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testStructure} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Structure Again"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check that your Supabase project is running and accessible</li>
            <li>Verify that your environment variables are correctly set in <code>.env.local</code>:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
            </li>
            <li>Make sure your database has the required tables:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li><code>podcast_subscriptions</code> (not podcast_feeds)</li>
                <li><code>episodes</code></li>
                <li><code>queue_items</code></li>
                <li><code>saved_episodes</code></li>
                <li><code>playback_states</code></li>
              </ul>
            </li>
            <li>Check if your Supabase project has any restrictions on API access</li>
            <li>Verify that your user has the necessary permissions</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
