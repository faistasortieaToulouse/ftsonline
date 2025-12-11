// src/app/ecrivainsaude/page.tsx
'use client'; 

import { useEffect, useRef, useState } from "react"; 
import Script from "next/script"; 

interface Ecrivain { 
  nom: string; 
  commune: string; 
  dates?: string; 
  description?: string; 
} 

// Données importées (liste avec communes) 
import { ecrivainsData } from "@/app/api/ecrivainsaude/route"; 

export default function EcrivainsAudePage() { 
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const mapInstance = useRef<google.maps.Map | null>(null); 
  const [markersCount, setMarkersCount] = useState(0); 
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => { 
    if (!isReady || !mapRef.current || !window.google?.maps) return; 

    const map = new google.maps.Map(mapRef.current, { 
      zoom: 9, 
      center: { lat: 43.15, lng: 2.3 }, // centre de l'Aude 
      gestureHandling: "greedy", 
    }); 
    mapInstance.current = map; 

    const geocoder = new google.maps.Geocoder(); 
    let count = 0; 

    ecrivainsData.forEach((e) => { 
      geocoder.geocode({ address: e.commune + ", France" }, (results, status) => { 
        if (status !== "OK" || !results?.[0] || !mapInstance.current) return; 

        count++; 
        const marker = new google.maps.Marker({ 
          map: mapInstance.current, 
          position: results[0].geometry.location, 
          title: e.nom, 
          label: String(count), 
        }); 

        const info = new google.maps.InfoWindow({ 
          content: ` 
            <div style="font-family: Arial; font-size: 14px;"> 
              <strong>${count}. ${e.nom}</strong><br/> 
              <b>Commune :</b> ${e.commune}<br/> 
              <b>Dates :</b> ${e.dates || "N/A"}<br/> 
              <b>Description :</b> ${e.description || "Écrivain"} 
            </div> 
          `, 
        }); 

        marker.addListener("click", () => info.open({ anchor: marker, map: mapInstance.current! })); 

        setMarkersCount(count); 
      }); 
    }); 
  }, [isReady]); 

  return ( 
    <div className="p-4 max-w-7xl mx-auto"> 
      {/* Chargement de l'API Google Maps */} 
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="afterInteractive" 
        onLoad={() => setIsReady(true)} 
      /> 

      <h1 className="text-3xl font-extrabold mb-6">🖋️ Écrivains de l'Aude sur la carte</h1> 

      <p className="font-semibold text-lg mb-4"> 
        {markersCount} lieux affichés sur {ecrivainsData.length} entrées. 
      </p> 

      <div 
        ref={mapRef} 
        style={{ height: "70vh", width: "100%" }} 
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center" 
      > 
        {!isReady && <p>Chargement de la carte…</p>} 
      </div> 

      <h2 className="text-2xl font-semibold mb-4">Liste complète des écrivains</h2> 

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}> 
        <thead style={{ backgroundColor: "#f0f0f0" }}> 
          <tr> 
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Nom</th> 
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Commune</th> 
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Dates</th> 
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Description</th> 
          </tr> 
        </thead> 
        <tbody> 
          {ecrivainsData.map((ev, i) => ( 
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}> 
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{ev.nom}</td> 
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{ev.commune}</td> 
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{ev.dates || "N/A"}</td> 
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{ev.description || "-"}</td> 
            </tr> 
          ))} 
        </tbody> 
      </table> 
    </div> 
  ); 
}
