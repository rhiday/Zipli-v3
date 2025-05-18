'use client';

import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';

export default function QRLoginGenerator() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  
  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add cache busting parameter to avoid cached responses
      const response = await fetch(`/api/auth/qr-token?t=${Date.now()}`);
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        throw new Error(`Failed to generate QR login token (${response.status})`);
      }
      
      const data = await response.json();
      if (!data.token) {
        throw new Error('No token returned from API');
      }
      
      console.log('QR token fetched successfully');
      setToken(data.token);
      // Reset retries on success
      setRetries(0);
    } catch (err) {
      console.error('Error generating QR token:', err);
      setError('Could not generate QR code. Please try again.');
      
      // Auto-retry up to 3 times with increasing delay
      if (retries < 3) {
        const retryDelay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Will retry in ${retryDelay}ms (retry ${retries + 1}/3)`);
        setTimeout(() => {
          setRetries(prev => prev + 1);
          fetchToken();
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [retries]);
  
  useEffect(() => {
    fetchToken();
    
    // Regenerate token every 9 minutes to ensure it's always valid
    const intervalId = setInterval(fetchToken, 9 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchToken]);
  
  // Create the URL that will be encoded in the QR code
  const qrValue = token 
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/qr-login?token=${token}` 
    : '';
  
  return (
    <div className="flex flex-col items-center p-6 bg-base rounded-lg border border-muted">
      <h2 className="text-titleSm font-display text-primary mb-4">Scan to Login</h2>
      
      {loading && !token ? (
        <div className="h-[200px] w-[200px] bg-white flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent" />
        </div>
      ) : error && !token ? (
        <div className="h-[200px] w-[200px] bg-muted flex flex-col items-center justify-center p-4">
          <p className="text-negative text-center mb-3">{error}</p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => {
              setRetries(0);
              fetchToken();
            }} 
            disabled={loading}
          >
            Try Again
          </Button>
        </div>
      ) : token ? (
        <div className="p-4 bg-white rounded">
          <QRCode 
            value={qrValue}
            size={200}
            level="H"
          />
        </div>
      ) : (
        <div className="h-[200px] w-[200px] bg-muted flex items-center justify-center">
          <p className="text-primary-50">QR code unavailable</p>
        </div>
      )}
      
      <p className="text-sm text-primary-75 mt-4 text-center">
        Scan with your device camera to instantly log in
      </p>
      
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => {
          setRetries(0);
          fetchToken();
        }} 
        disabled={loading}
        className="mt-4"
      >
        Refresh QR Code
      </Button>
    </div>
  );
} 