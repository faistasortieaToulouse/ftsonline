"use client";
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PREFECTURES = [
  { id: "toulouse", name: "Toulouse", dept: "31", nom: "Haute-Garonne", coords: [43.6045, 1.4442] },
  { id: "montpellier", name: "Montpellier", dept: "34", nom: "Hérault", coords: [43.6108, 3.8767] },
  { id: "carcassonne", name: "Carcassonne", dept: "11", nom: "Aude", coords: [43.2122, 2.3537] },
  { id: "nimes", name: "Nîmes", dept: "30", nom: "Gard", coords: [43.8367, 4.3601] },
  { id: "perpignan", name: "Perpignan", dept: "66", nom: "Pyrénées-Orientales", coords: [42.6986, 2.8956] },
  { id: "albi", name: "Albi", dept: "81", nom: "Tarn", coords: [43.9289, 2.1464] },
  { id: "montauban", name: "Montauban", dept: "82", nom: "Tarn-et-Garonne", coords: [44.0175, 1.3550] },
  { id: "cahors", name: "Cahors", dept: "46", nom: "Lot", coords: [44.4475, 1.4419] },
  { id: "rodez", name: "Rodez", dept: "12", nom: "Aveyron", coords: [44.3506, 2.5750] },
  { id: "mende", name: "Mende", dept: "48", nom: "Lozère", coords: [44.5181, 3.5000] },
  { id: "tarbes", name: "Tarbes", dept: "65", nom: "Hautes-Pyrénées", coords: [43.2320, 0.0789] },
  { id: "auch", name: "Auch", dept: "32", nom: "Gers", coords: [43.6465, 0.5855] },
  { id: "foix", name: "Foix", dept: "09", nom: "Ariège", coords: [42.9639, 1.6054] },
  // À ajouter dans le tableau PREFECTURES de Map.tsx
  { id: "pamiers", name: "Pamiers", dept: "09", nomDept: "Ariège", coords: [43.1167, 1.6167] },
  { id: "narbonne", name: "Narbonne", dept: "11", nomDept: "Aude", coords: [43.1833, 3.0000] },
  { id: "beziers", name: "Béziers", dept: "34", nomDept: "Hérault", coords: [43.3444, 3.2158] },
  { id: "lezignan", name: "Lézignan-C.", dept: "11", nomDept: "Corbières", coords: [43.2031, 2.7592] }
];

// Correction du label (on vérifie que nom existe)
const createTextLabel = (name: string, dept: string, nom: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="background-color: white; padding: 4px 8px; border-radius: 6px; border: 1.5px solid #4f46e5; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; min-width: 90px;">
          <div style="font-weight: 800; font-size: 11px; color: #1e1b4b;">${name}</div>
          <div style="font-size: 8px; color: #6366f1; font-weight: 600; text-transform: uppercase;">${dept} - ${nom || ''}</div>
        </div>
        <div style="width: 2px; height: 6px; background-color: #4f46e5;"></div>
      </div>`,
    iconSize: [0, 0]
  });
};

// AJOUT DE ONCITYCHANGE POUR LIER LA CARTE À LA PAGE
export default function Map({ onCityChange }: { onCityChange: (id: string) => void }) {
  const centerOccitanie: [number, number] = [43.6, 2.3];

  return (
    <div className="h-[550px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
      <MapContainer center={centerOccitanie} zoom={7.5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {PREFECTURES.map((p) => (
          <Marker 
            key={p.id} 
            position={p.coords as [number, number]} 
            icon={createTextLabel(p.name, p.dept, p.nom)}
            eventHandlers={{
              click: () => onCityChange(p.id), // Change la ville au clic
            }}
          >
            <Tooltip direction="top" offset={[0, -30]}>Cliquez pour voir la météo</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
