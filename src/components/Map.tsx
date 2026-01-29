"use client";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Liste complète des 13 préfectures d'Occitanie avec nom du département
const PREFECTURES = [
  { name: "Toulouse", dept: "31", nom: "Haute-Garonne", coords: [43.6045, 1.4442] },
  { name: "Montpellier", dept: "34", nom: "Hérault", coords: [43.6108, 3.8767] },
  { name: "Carcassonne", dept: "11", nom: "Aude", coords: [43.2122, 2.3537] },
  { name: "Nîmes", dept: "30", nom: "Gard", coords: [43.8367, 4.3601] },
  { name: "Perpignan", dept: "66", nom: "Pyrénées-Orientales", coords: [42.6986, 2.8956] },
  { name: "Albi", dept: "81", nom: "Tarn", coords: [43.9289, 2.1464] },
  { name: "Montauban", dept: "82", nom: "Tarn-et-Garonne", coords: [44.0175, 1.3550] },
  { name: "Cahors", dept: "46", coords: [44.4475, 1.4419] },
  { name: "Rodez", dept: "12", coords: [44.3506, 2.5750] },
  { name: "Mende", dept: "48", coords: [44.5181, 3.5000] },
  { name: "Tarbes", dept: "65", coords: [43.2320, 0.0789] },
  { name: "Auch", dept: "32", coords: [43.6465, 0.5855] },
  { name: "Foix", dept: "09", coords: [42.9639, 1.6054] }
];

// Fonction pour créer un label visuel (Bulle blanche avec texte)
const createTextLabel = (name: string, dept: string, nomDept: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background-color: white; padding: 4px 8px; border-radius: 6px; border: 1.5px solid #4f46e5; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; min-width: 80px;">
          <div style="font-weight: 800; font-size: 12px; color: #1e1b4b; line-height: 1;">${name}</div>
          <div style="font-size: 9px; color: #6366f1; font-weight: 600; margin-top: 2px; text-transform: uppercase;">${dept} - ${nomDept}</div>
        </div>
        <div style="width: 2px; height: 6px; background-color: #4f46e5;"></div>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function Map({ ville }: { ville: string }) {
  // Centre géographique de l'Occitanie
  const centerOccitanie: [number, number] = [43.6, 2.3];

  return (
    <div className="h-[550px] w-full z-0 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
      <MapContainer 
        center={centerOccitanie} 
        zoom={7.5} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', backgroundColor: '#f1f5f9' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Carte plus claire pour mieux voir les étiquettes
        />
        
        {PREFECTURES.map((p) => (
          <Marker 
            key={p.name} 
            position={p.coords as [number, number]} 
            icon={createTextLabel(p.name, p.dept, p.nom)}
          >
            <Tooltip direction="top" offset={[0, -30]} opacity={0.9}>
              Cliquez pour voir les prévisions de {p.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
