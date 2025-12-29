"use client";

import { useEffect, useRef } from "react";

interface VoieMapProps {
  libelle: string;
}

export default function VoieMap({ libelle }: VoieMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (!map.current) {
      map.current = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 43.6045, lng: 1.444 }, // Toulouse
      });
    }

    const geocoder = new google.maps.Geocoder();
    const address = `${libelle}, Toulouse, France`;

    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results?.[0]) return;

      const location = results[0].geometry.location;

      map.current!.setCenter(location);

      if (marker.current) marker.current.setMap(null);

      marker.current = new google.maps.Marker({
        map: map.current!,
        position: location,
        title: libelle,
      });
    });
  }, [libelle]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] border rounded-lg bg-gray-100"
    />
  );
}
