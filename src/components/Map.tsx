"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITIES = [
  // ARIÈGE (09)
  { id: "pamiers", name: "Pamiers", dept: "09", nomDept: "Ariège", coords: [43.1167, 1.6167] },
  { id: "foix", name: "Foix", dept: "09", nomDept: "Ariège", coords: [42.9639, 1.6054] },
  { id: "st-girons", name: "St-Girons", dept: "09", nomDept: "Ariège", coords: [42.9833, 1.15] },
  { id: "lavelanet", name: "Lavelanet", dept: "09", nomDept: "Ariège", coords: [42.9333, 1.85] },
  { id: "saverdun", name: "Saverdun", dept: "09", nomDept: "Ariège", coords: [43.2333, 1.5667] },
  // AUDE (11)
  { id: "narbonne", name: "Narbonne", dept: "11", nomDept: "Aude", coords: [43.1833, 3.0] },
  { id: "carcassonne", name: "Carcassonne", dept: "11", nomDept: "Aude", coords: [43.2122, 2.3537] },
  { id: "castelnaudary", name: "Castelnaudary", dept: "11", nomDept: "Aude", coords: [43.3167, 1.95] },
  { id: "lezignan", name: "Lézignan-C.", dept: "11", nomDept: "Aude", coords: [43.2031, 2.7592] },
  { id: "limoux", name: "Limoux", dept: "11", nomDept: "Aude", coords: [43.05, 2.2167] },
  // AVEYRON (12)
  { id: "rodez", name: "Rodez", dept: "12", nomDept: "Aveyron", coords: [44.3506, 2.5750] },
  { id: "millau", name: "Millau", dept: "12", nomDept: "Aveyron", coords: [44.1, 3.0833] },
  { id: "villefranche-r", name: "Villefranche-R.", dept: "12", nomDept: "Aveyron", coords: [44.35, 2.0333] },
  { id: "st-affrique", name: "St-Affrique", dept: "12", nomDept: "Aveyron", coords: [43.95, 2.8833] },
  { id: "decazeville", name: "Decazeville", dept: "12", nomDept: "Aveyron", coords: [44.55, 2.25] },
  // GARD (30)
  { id: "nimes", name: "Nîmes", dept: "30", nomDept: "Gard", coords: [43.8367, 4.3601] },
  { id: "ales", name: "Alès", dept: "30", nomDept: "Gard", coords: [44.1333, 4.0833] },
  { id: "bagnols", name: "Bagnols/Cèze", dept: "30", nomDept: "Gard", coords: [44.1625, 4.6192] },
  { id: "beaucaire", name: "Beaucaire", dept: "30", nomDept: "Gard", coords: [43.8075, 4.6439] },
  { id: "st-gilles", name: "St-Gilles", dept: "30", nomDept: "Gard", coords: [43.6767, 4.4308] },
  // HAUTE-GARONNE (31)
  { id: "toulouse", name: "Toulouse", dept: "31", nomDept: "H.-Garonne", coords: [43.6045, 1.4442] },
  { id: "st-gaudens", name: "St-Gaudens", dept: "31", nomDept: "H.-Garonne", coords: [43.1083, 0.7233] },
  { id: "luchon", name: "B. de Luchon", dept: "31", nomDept: "H.-Garonne", coords: [42.7894, 0.595] },
  { id: "carbonne", name: "Carbonne", dept: "31", nomDept: "H.-Garonne", coords: [43.2975, 1.2269] },
  { id: "revel", name: "Revel", dept: "31", nomDept: "H.-Garonne", coords: [43.4586, 2.0053] },
  // GERS (32)
  { id: "auch", name: "Auch", dept: "32", nomDept: "Gers", coords: [43.6465, 0.5855] },
  { id: "isle-jourdain", name: "L'Isle-Jourdain", dept: "32", nomDept: "Gers", coords: [43.6131, 1.0853] },
  { id: "condom", name: "Condom", dept: "32", nomDept: "Gers", coords: [43.9583, 0.3725] },
  { id: "fleurance", name: "Fleurance", dept: "32", nomDept: "Gers", coords: [43.85, 0.6667] },
  { id: "eauze", name: "Eauze", dept: "32", nomDept: "Gers", coords: [43.8608, 0.1008] },
  // HÉRAULT (34)
  { id: "montpellier", name: "Montpellier", dept: "34", nomDept: "Hérault", coords: [43.6108, 3.8767] },
  { id: "beziers", name: "Béziers", dept: "34", nomDept: "Hérault", coords: [43.3444, 3.2158] },
  { id: "sete", name: "Sète", dept: "34", nomDept: "Hérault", coords: [43.4, 3.7] },
  { id: "agde", name: "Agde", dept: "34", nomDept: "Hérault", coords: [43.3108, 3.4758] },
  { id: "lunel", name: "Lunel", dept: "34", nomDept: "Hérault", coords: [43.675, 4.1347] },
  // LOT (46)
  { id: "cahors", name: "Cahors", dept: "46", nomDept: "Lot", coords: [44.4475, 1.4419] },
  { id: "figeac", name: "Figeac", dept: "46", nomDept: "Lot", coords: [44.6083, 2.0333] },
  { id: "gourdon", name: "Gourdon", dept: "46", nomDept: "Lot", coords: [44.7333, 1.3833] },
  { id: "gramat", name: "Gramat", dept: "46", nomDept: "Lot", coords: [44.7794, 1.7247] },
  { id: "souillac", name: "Souillac", dept: "46", nomDept: "Lot", coords: [44.8936, 1.4772] },
  // LOZÈRE (48)
  { id: "mende", name: "Mende", dept: "48", nomDept: "Lozère", coords: [44.5181, 3.5000] },
  { id: "marvejols", name: "Marvejols", dept: "48", nomDept: "Lozère", coords: [44.5528, 3.2908] },
  { id: "st-chely", name: "St-Chély-d'Apcher", dept: "48", nomDept: "Lozère", coords: [44.8011, 3.2758] },
  { id: "langogne", name: "Langogne", dept: "48", nomDept: "Lozère", coords: [44.7261, 3.8550] },
  { id: "peyre-aubrac", name: "Peyre en Aubrac", dept: "48", nomDept: "Lozère", coords: [44.7, 3.2833] },
  // HAUTES-PYRÉNÉES (65)
  { id: "tarbes", name: "Tarbes", dept: "65", nomDept: "H.-Pyrénées", coords: [43.2320, 0.0789] },
  { id: "lourdes", name: "Lourdes", dept: "65", nomDept: "H.-Pyrénées", coords: [43.0947, -0.0458] },
  { id: "aureilhan", name: "Aureilhan", dept: "65", nomDept: "H.-Pyrénées", coords: [43.2439, 0.1306] },
  { id: "bagneres-bigorre", name: "Bagnères-de-Bigorre", dept: "65", nomDept: "H.-Pyrénées", coords: [43.0658, 0.1492] },
  { id: "lannemezan", name: "Lannemezan", dept: "65", nomDept: "H.-Pyrénées", coords: [43.1267, 0.3850] },
  // PYRÉNÉES-ORIENTALES (66)
  { id: "perpignan", name: "Perpignan", dept: "66", nomDept: "Pyr.-Orient.", coords: [42.6986, 2.8956] },
  { id: "canet", name: "Canet-en-R.", dept: "66", nomDept: "Pyr.-Orient.", coords: [42.7031, 3.0077] },
  { id: "st-esteve", name: "Saint-Estève", dept: "66", nomDept: "Pyr.-Orient.", coords: [42.7092, 2.8422] },
  { id: "st-cyprien", name: "Saint-Cyprien", dept: "66", nomDept: "Pyr.-Orient.", coords: [42.6186, 3.0336] },
  { id: "argeles", name: "Argelès-sur-Mer", dept: "66", nomDept: "Pyr.-Orient.", coords: [42.5461, 3.0233] },
  // TARN (81)
  { id: "albi", name: "Albi", dept: "81", nomDept: "Tarn", coords: [43.9289, 2.1464] },
  { id: "castres", name: "Castres", dept: "81", nomDept: "Tarn", coords: [43.6044, 2.2428] },
  { id: "gaillac", name: "Gaillac", dept: "81", nomDept: "Tarn", coords: [43.9014, 1.8969] },
  { id: "graulhet", name: "Graulhet", dept: "81", nomDept: "Tarn", coords: [43.7608, 1.9908] },
  { id: "lavaur", name: "Lavaur", dept: "81", nomDept: "Tarn", coords: [43.6981, 1.8206] },
  // TARN-ET-GARONNE (82)
  { id: "montauban", name: "Montauban", dept: "82", nomDept: "T.-et-Garonne", coords: [44.0175, 1.3550] },
  { id: "castelsarrasin", name: "Castelsarrasin", dept: "82", nomDept: "T.-et-Garonne", coords: [44.0389, 1.1069] },
  { id: "moissac", name: "Moissac", dept: "82", nomDept: "T.-et-Garonne", coords: [44.1031, 1.0947] },
  { id: "caussade", name: "Caussade", dept: "82", nomDept: "T.-et-Garonne", coords: [44.1611, 1.5369] },
  { id: "montech", name: "Montech", dept: "82", nomDept: "T.-et-Garonne", coords: [43.9575, 1.2300] },
  // ANDORRE (AD)
  { id: "andorra-vella", name: "Andorra la Vella", dept: "AD", nomDept: "Andorre", coords: [42.5063, 1.5218] },
  { id: "escaldes", name: "Escaldes-Eng.", dept: "AD", nomDept: "Andorre", coords: [42.5089, 1.5383] },
  { id: "encamp", name: "Encamp", dept: "AD", nomDept: "Andorre", coords: [42.5361, 1.5828] },
  { id: "sant-julia", name: "Sant Julià de L.", dept: "AD", nomDept: "Andorre", coords: [42.4637, 1.4913] },
  { id: "la-massana", name: "La Massana", dept: "AD", nomDept: "Andorre", coords: [42.5448, 1.5148] },
  { id: "ordino", name: "Ordino", dept: "AD", nomDept: "Andorre", coords: [42.5564, 1.5331] },
  { id: "canillo", name: "Canillo", dept: "AD", nomDept: "Andorre", coords: [42.5667, 1.6000] },
];

const createTextLabel = (name: string, dept: string, nomDept: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="background-color: white; padding: 2px 6px; border-radius: 4px; border: 1.5px solid #4f46e5; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; min-width: 80px;">
          <div style="font-weight: 800; font-size: 10px; color: #1e1b4b; white-space: nowrap;">${name}</div>
          <div style="font-size: 7px; color: #6366f1; font-weight: 600; text-transform: uppercase;">${dept} - ${nomDept}</div>
        </div>
        <div style="width: 2px; height: 4px; background-color: #4f46e5;"></div>
      </div>`,
    iconSize: [0, 0]
  });
};

export default function Map({ onCityChange }: { onCityChange: (id: string) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // 1. Initialisation de la carte (Centrage Occitanie)
    mapInstance.current = L.map(mapRef.current, {
      center: [43.6, 2.5],
      zoom: 7.5,
      minZoom: 7,
      maxZoom: 12,
    });

    // 2. Ajout des tuiles (CartoDB Light)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // 3. Ajout des marqueurs
    CITIES.forEach((p) => {
      const marker = L.marker(p.coords as [number, number], {
        icon: createTextLabel(p.name, p.dept, p.nomDept)
      }).addTo(mapInstance.current!);

      // Tooltip Leaflet classique
      marker.bindTooltip(`Météo : ${p.name}`, {
        direction: "top",
        offset: [0, -20]
      });

      // Événement Click
      marker.on('click', () => {
        onCityChange(p.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // 4. Cleanup : Destruction de la carte au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onCityChange]);

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
      <div 
        ref={mapRef} 
        style={{ height: '100%', width: '100%' }} 
      />
    </div>
  );
}