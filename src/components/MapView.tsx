'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
    className?: string;
}

interface GeoJSONFeature {
    type: 'Feature';
    properties: {
        name: string;
        isDonor: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

interface GeoJSONData {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

export default function MapView({ className = '' }: MapViewProps) {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);

    // Fetch GeoJSON data
    useEffect(() => {
        const fetchGeoJSON = async () => {
            try {
                const response = await fetch('/sodexo_helsinki.geojson');
                const data = await response.json();
                setGeoJsonData(data);
            } catch (error) {
                console.error('Error fetching GeoJSON data:', error);
            }
        };

        fetchGeoJSON();
    }, []);

    useEffect(() => {
        // Set your Mapbox access token
        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibmVhbGZsZXRjaGVyIiwiYSI6ImNpbzFjeGlhMzAweDR3ZGtsZXhmenNrNnYifQ.RaqcCgHB8jBI3StI-_QsoA';
        mapboxgl.accessToken = accessToken;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current!,
            center: [24.9458, 60.1921], // Helsinki, Finland
            zoom: 12.5,
            style: 'mapbox://styles/mapbox/streets-v12'
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        mapRef.current.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        }), 'top-right');

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    // Add markers when map and data are ready
    useEffect(() => {
        if (!mapRef.current || !geoJsonData) return;

        const map = mapRef.current;

        // Wait for map to load
        map.on('load', () => {
            // Add markers for each location
            geoJsonData.features.forEach((feature) => {
                const { coordinates } = feature.geometry;
                const { name, isDonor } = feature.properties;

                // Create marker element
                const markerElement = document.createElement('div');
                markerElement.className = 'marker';
                markerElement.style.width = '20px';
                markerElement.style.height = '20px';
                markerElement.style.borderRadius = '50%';
                markerElement.style.backgroundColor = isDonor === 'True' ? '#10b981' : '#6b7280';
                markerElement.style.border = '2px solid white';
                markerElement.style.cursor = 'pointer';
                markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

                // Create popup
                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: false,
                    closeOnClick: true,
                    className: 'custom-popup'
                }).setHTML(`
                    <div class="px-4 py-3 bg-white rounded-full shadow-lg border border-gray-200 min-w-max">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full ${isDonor === 'True' ? 'bg-green-500' : 'bg-gray-400'}"></div>
                            <span class="font-medium text-gray-900 text-sm">${name}</span>
                        </div>
                    </div>
                `);

                // Create marker
                new mapboxgl.Marker(markerElement)
                    .setLngLat([coordinates[0], coordinates[1]])
                    .setPopup(popup)
                    .addTo(map);
            });
        });
    }, [geoJsonData]);

    return (
        <>
            <style jsx global>{`
                .mapboxgl-popup-content {
                    padding: 0 !important;
                    border-radius: 9999px !important;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
                    border: 1px solid #e5e7eb !important;
                }
                .mapboxgl-popup-tip {
                    border-top-color: white !important;
                }
                .mapboxgl-popup-close-button {
                    color: #6b7280 !important;
                    font-size: 18px !important;
                    padding: 4px !important;
                }
                .mapboxgl-popup-close-button:hover {
                    color: #374151 !important;
                }
            `}</style>
            <div className={`flex absolute top-0 left-0 right-0 bottom-0 h-full w-full ${className}`}>
                {/* Map container */}
                <div className="w-full">
                    <div className="h-full w-full" ref={mapContainerRef} />
                </div>
            </div>
        </>
    );
}
