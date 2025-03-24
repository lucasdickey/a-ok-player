"use client";

import { useState, useEffect } from 'react';
import { testSupabaseConnection } from '@/lib/supabase-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupabaseTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test your connection to Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This page tests if your app can connect to your Supabase instance.</p>
            
            {testResult && (
              <div className="mt-4 p-4 rounded-md bg-slate-100">
                <h3 className="font-medium mb-2">Test Result:</h3>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runTest}
            disabled={loading}
            className="bg-[#009BA4] hover:bg-[#007187]"
          >
            {loading ? "Testing..." : "Test Connection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}