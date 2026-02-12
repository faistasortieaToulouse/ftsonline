"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import dynamique des composants react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false }); // Ajout du Popup
const useMap = dynamic(() => import('react-leaflet').then(m => m.useMap), { ssr: false });

interface TisseoItineraire {
  id_ligne: string;
  ligne: string;
  nom_iti: string;
  mode: string;
  dist_spa: number;
  geo_point_2d: { lon: number; lat: number };
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map && typeof map.setView === 'function' && center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function TisseoPage() {
  const [itineraires, setItineraires] = useState<TisseoItineraire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIti, setSelectedIti] = useState<TisseoItineraire | null>(null);

  useEffect(() => {
    const initLeafletFix = async () => {
      try {
        const L = (await import('leaflet')).default;
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      } catch (e) {
        console.error("Leaflet icon fix error", e);
      }
    };
    initLeafletFix();

    fetch('/api/tisseoitineraire')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: TisseoItineraire, b: TisseoItineraire) => 
          a.ligne.localeCompare(b.ligne, undefined, { numeric: true })
        );
        setItineraires(sorted);
        setLoading(false);
      })
      .catch(err => console.error("Erreur de chargement:", err));
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des itinéraires...</div>;

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 italic text-orange-600">
        Réseau Tisséo - Itinéraires
      </h1>

      <div className="h-96 w-full rounded-xl mb-8 shadow-md border-2 border-orange-200 overflow-hidden relative" style={{ zIndex: 1 }}>
        {typeof window !== 'undefined' && (
          <MapContainer center={[43.6047, 1.4442]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selectedIti && (
              <>
                <Marker position={[selectedIti.geo_point_2d.lat, selectedIti.geo_point_2d.lon]}>
                  <Popup>
                    <div className="font-bold text-orange-600">Ligne {selectedIti.ligne}</div>
                    <div className="text-xs font-semibold">{selectedIti.nom_iti}</div>
                  </Popup>
                </Marker>
                <ChangeView center={[selectedIti.geo_point_2d.lat, selectedIti.geo_point_2d.lon]} />
              </>
            )}
          </MapContainer>
        )}
      </div>

      {/* 2. LE CODE À RAJOUTER EST ICI */}
      <p className="text-center text-sm text-gray-500 mb-8 italic">
        Clique sur <span className="font-bold text-orange-600">"Voir sur la Carte"</span> pour voir le terminus de la ligne et clique sur le marqueur de la carte qui s'affiche pour voir l'itinéraire, <span className="font-semibold">"point de départ - terminus"</span>.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itineraires.map((item, index) => {
          // Astuce : On sépare le nom de l'itinéraire pour afficher Départ et Arrivée
          const [depart, arrivee] = item.nom_iti.includes(' - ') 
            ? item.nom_iti.split(' - ') 
            : [item.nom_iti, ''];

          return (
            <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded text-lg">
                    {item.ligne}
                  </span>
                  <div className="text-xs font-bold uppercase text-gray-500">{item.mode}</div>
                </div>
                
                <div className="mb-4">
                   <div className="text-sm font-bold text-gray-800">🚩 {depart}</div>
                   {arrivee && <div className="text-sm font-bold text-gray-800 mt-1">🏁 {arrivee}</div>}
                </div>

                <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                  <p>📏 <strong>Distance :</strong> {(item.dist_spa / 1000).toFixed(2)} km</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedIti(item)}
                className="mt-4 w-full py-2 bg-orange-100 hover:bg-orange-600 hover:text-white text-orange-700 rounded-lg text-sm font-bold transition-all"
              >
                Voir sur la carte
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
