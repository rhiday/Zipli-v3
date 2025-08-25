'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Test data
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      console.log('Testing signup with:', { email: testEmail });

      // Direct Supabase auth call with detailed logging
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: 'food_donor',
            full_name: 'Test User',
            organization_name: 'Test Org',
            contact_number: '123456',
            address: 'Test Address',
          },
        },
      });

      console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        console.error('Detailed error:', {
          message: signUpError.message,
          status: (signUpError as any).status,
          code: (signUpError as any).code,
          details: (signUpError as any).details,
          hint: (signUpError as any).hint,
          fullError: signUpError,
        });
        setError(signUpError);
      } else {
        setResult(data);

        // Try to fetch the profile
        if (data?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          console.log('Profile fetch result:', { profileData, profileError });
        }
      }
    } catch (err) {
      console.error('Caught error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Test basic Supabase connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      console.log('Connection test:', { data, error });

      if (error) {
        setError(error);
      } else {
        setResult({ message: 'Connection successful', data });
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthConfig = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Check auth settings
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const config = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        currentSession: session,
      };

      console.log('Auth config:', config);
      setResult(config);
    } catch (err) {
      console.error('Config check error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Testing Page</h1>

      <div className="space-y-4 mb-8">
        <Button
          onClick={checkAuthConfig}
          disabled={loading}
          variant="secondary"
        >
          Check Auth Config
        </Button>

        <Button onClick={testConnection} disabled={loading} variant="secondary">
          Test Database Connection
        </Button>

        <Button onClick={testSignUp} disabled={loading} variant="primary">
          Test Sign Up
        </Button>
      </div>

      {loading && (
        <div className="p-4 bg-blue-50 rounded">
          <p>Loading...</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 rounded mb-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 rounded">
          <h3 className="font-bold mb-2 text-red-600">Error:</h3>
          <pre className="text-xs overflow-auto text-red-800">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Open the browser console for detailed logs.
        </p>
      </div>
    </div>
  );
}
