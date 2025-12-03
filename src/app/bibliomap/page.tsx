"use client";
import { useEffect, useRef } from "react";

export default function BibliomapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch("/bibliomap");
      const data = await res.json();

      // Load Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_SERVER_KEY}`;
      script.async = true;
      script.onload = () => {
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 43.6045, lng: 1.444 }, // Toulouse
        });

        data.forEach(async (library: any) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: library.address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
              });

              const infowindow = new google.maps.InfoWindow({
                content: `<strong>${library.name}</strong><br>${library.address}`,
              });

              marker.addListener("mouseover", () => {
                if (!("ontouchstart" in window)) infowindow.open(map, marker);
              });

              marker.addListener("mouseout", () => {
                if (!("ontouchstart" in window)) infowindow.close();
              });

              marker.addListener("click", () => {
                infowindow.open(map, marker);
              });
            }
          });
        });
      };
      document.body.appendChild(script);
    }

    init();
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
