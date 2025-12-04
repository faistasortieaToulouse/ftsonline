'use client';

import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

interface ExilPlace {
nomLieu: string;
num: string;
typeRue: string;
nomRue: string;
site: string;
quartier: string;
établissement: string;
sigles: string;
signification: string;
}

const containerStyle = {
width: "100%",
height: "100vh",
};

// Toulouse center coordinates
const center = {
lat: 43.6045,
lng: 1.444,
};

export default function MapPage() {
const { isLoaded } = useJsApiLoader({
id: 'google-map-script',
googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
});

const [places, setPlaces] = useState<ExilPlace[]>([]);
const [selectedPlace, setSelectedPlace] = useState<ExilPlace | null>(null);

useEffect(() => {
// Appel à ton endpoint API Next.js
fetch("/api/exilplaces")
.then(res => res.json())
.then(data => setPlaces(data))
.catch(err => console.error(err));
}, []);

if (!isLoaded) return <div>Chargement de la carte...</div>;

return ( <GoogleMap
   mapContainerStyle={containerStyle}
   center={center}
   zoom={13}
 >
{places.map((place, idx) => {
// Ici, on fait une approximation : il faudrait idéalement géocoder l'adresse
const position = {
lat: center.lat + Math.random() * 0.01, // placeholder pour test
lng: center.lng + Math.random() * 0.01,
};

  return (
      <Marker
        key={idx}
        position={position}
        onClick={() => setSelectedPlace(place)}
      />
    );
  })}

  {selectedPlace && (
    <InfoWindow
      position={{
        lat: center.lat + Math.random() * 0.01,
        lng: center.lng + Math.random() * 0.01,
      }}
      onCloseClick={() => setSelectedPlace(null)}
    >
      <div style={{ maxWidth: 200 }}>
        <h3>{selectedPlace.nomLieu}</h3>
        <p>{selectedPlace.num} {selectedPlace.typeRue} {selectedPlace.nomRue}</p>
        <p>{selectedPlace.établissement}</p>
        {selectedPlace.sigles && <p>{selectedPlace.sigles}: {selectedPlace.signification}</p>}
      </div>
    </InfoWindow>
  )}
</GoogleMap>

);
}
