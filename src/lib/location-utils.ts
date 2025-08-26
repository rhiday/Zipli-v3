'use client';

import { toast } from '@/hooks/use-toast';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationConfig {
  timeout: number;
  enableHighAccuracy: boolean;
  maximumAge: number;
}

const DEFAULT_CONFIG: LocationConfig = {
  timeout: 10000, // 10 seconds
  enableHighAccuracy: true,
  maximumAge: 300000, // 5 minutes
};

// Common cities/areas for manual fallback
export const COMMON_AREAS = [
  {
    name: 'Helsinki',
    country: 'Finland',
    coordinates: { lat: 60.1699, lng: 24.9384 },
  },
  {
    name: 'Espoo',
    country: 'Finland',
    coordinates: { lat: 60.2055, lng: 24.6559 },
  },
  {
    name: 'Vantaa',
    country: 'Finland',
    coordinates: { lat: 60.2934, lng: 25.0378 },
  },
  {
    name: 'Tampere',
    country: 'Finland',
    coordinates: { lat: 61.4978, lng: 23.761 },
  },
  {
    name: 'Turku',
    country: 'Finland',
    coordinates: { lat: 60.4518, lng: 22.2666 },
  },
  {
    name: 'Oulu',
    country: 'Finland',
    coordinates: { lat: 65.0121, lng: 25.4651 },
  },
];

export class LocationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'LocationError';
  }
}

export async function getCurrentLocation(
  config: Partial<LocationConfig> = {}
): Promise<LocationData> {
  const { timeout, enableHighAccuracy, maximumAge } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  if (!navigator.geolocation) {
    throw new LocationError('Geolocation not supported', 'NOT_SUPPORTED');
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new LocationError('Location request timed out', 'TIMEOUT'));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorCode = 'UNKNOWN_ERROR';
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED';
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorCode = 'TIMEOUT';
            errorMessage = 'Location request timed out';
            break;
        }

        reject(new LocationError(errorMessage, errorCode));
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

export async function getLocationWithFallback(): Promise<LocationData | null> {
  try {
    // Try to get GPS location first
    const location = await getCurrentLocation();

    toast({
      title: 'Location found',
      description: 'Using your current location',
      variant: 'success',
    });

    return location;
  } catch (error) {
    const locationError = error as LocationError;

    if (locationError.code === 'PERMISSION_DENIED') {
      toast({
        title: 'Location access denied',
        description: 'Please enter your area manually below',
        variant: 'warning',
      });
    } else if (locationError.code === 'TIMEOUT') {
      toast({
        title: 'Location timeout',
        description: 'Please select your area from the list below',
        variant: 'warning',
      });
    } else {
      toast({
        title: 'Location unavailable',
        description: 'Please choose your area manually',
        variant: 'warning',
      });
    }

    // Return null to trigger manual selection
    return null;
  }
}

export function getDistanceBetweenPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function expandSearchRadius(currentRadius: number): number {
  // Gradually expand search radius: 5km -> 10km -> 25km -> 50km
  if (currentRadius < 10) return 10;
  if (currentRadius < 25) return 25;
  if (currentRadius < 50) return 50;
  return 100; // Max radius
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    // This is a placeholder - in production you'd use a real geocoding service
    // For now, find the closest known area
    let closestArea = COMMON_AREAS[0];
    let minDistance = getDistanceBetweenPoints(
      lat,
      lng,
      closestArea.coordinates.lat,
      closestArea.coordinates.lng
    );

    for (const area of COMMON_AREAS.slice(1)) {
      const distance = getDistanceBetweenPoints(
        lat,
        lng,
        area.coordinates.lat,
        area.coordinates.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestArea = area;
      }
    }

    return `${closestArea.name}, ${closestArea.country}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return 'Unknown location';
  }
}
