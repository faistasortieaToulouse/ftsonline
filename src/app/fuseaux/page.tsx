"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Globe, Search, Clock } from "lucide-react";

// Import dynamique de la carte
const MapWorld = dynamic(() => import('./MapWorld'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-mono text-slate-400">Chargement de la cartographie mondiale...</div>
});

// Tes données sources (exportées pour être utilisées par MapWorld)
export const PAYS_DATA = [
  { offset: "UTC -12", pays: "États-Unis", ville: "Baker Island", zone: "Etc/GMT+12", coords: [0.1931, -176.4748] },
  { offset: "UTC -11", pays: "États-Unis", ville: "Pago Pago", zone: "Pacific/Pago_Pago", coords: [-14.271, -170.702] },
  { offset: "UTC -10", pays: "États-Unis", ville: "Honolulu", zone: "Pacific/Honolulu", coords: [21.3069, -157.8583] },
  { offset: "UTC -9", pays: "États-Unis", ville: "Anchorage", zone: "America/Anchorage", coords: [61.2181, -149.9003] },
  { offset: "UTC -8", pays: "États-Unis", ville: "Los Angeles", zone: "America/Los_Angeles", coords: [34.0522, -118.2437] },
  { offset: "UTC -7", pays: "États-Unis", ville: "Denver", zone: "America/Denver", coords: [39.7392, -104.9903] },
  { offset: "UTC -6", pays: "États-Unis", ville: "Chicago", zone: "America/Chicago", coords: [41.8781, -87.6298] },
  { offset: "UTC -5", pays: "États-Unis", ville: "New York", zone: "America/New_York", coords: [40.7128, -74.0060] },
  { offset: "UTC -4", pays: "Canada", ville: "Halifax", zone: "America/Halifax", coords: [44.6488, -63.5752] },
  { offset: "UTC -3", pays: "Brésil", ville: "São Paulo", zone: "America/Sao_Paulo", coords: [-23.5505, -46.6333] },
  { offset: "UTC -2", pays: "Brésil", ville: "Fernando de Noronha", zone: "America/Noronha", coords: [-3.84, -32.41] },
  { offset: "UTC -1", pays: "Portugal", ville: "Açores", zone: "Atlantic/Azores", coords: [37.7412, -25.6756] },
  { offset: "UTC +0", pays: "Royaume-Uni", ville: "Londres", zone: "Europe/London", coords: [51.5074, -0.1278] },
  { offset: "UTC +1", pays: "France", ville: "Paris", zone: "Europe/Paris", coords: [48.8566, 2.3522] },
  { offset: "UTC +2", pays: "Égypte", ville: "Le Caire", zone: "Africa/Cairo", coords: [30.0444, 31.2357] },
  { offset: "UTC +3", pays: "Russie", ville: "Moscou", zone: "Europe/Moscow", coords: [55.7558, 37.6173] },
  { offset: "UTC +3:30", pays: "Iran", ville: "Téhéran", zone: "Asia/Tehran", coords: [35.6892, 51.3890] },
  { offset: "UTC +4", pays: "Émirats Arabes Unis", ville: "Dubaï", zone: "Asia/Dubai", coords: [25.2048, 55.2708] },
  { offset: "UTC +4:30", pays: "Afghanistan", ville: "Kaboul", zone: "Asia/Kabul", coords: [34.5553, 69.1772] },
  { offset: "UTC +5", pays: "Pakistan", ville: "Karachi", zone: "Asia/Karachi", coords: [24.8607, 67.0011] },
  { offset: "UTC +5:30", pays: "Inde", ville: "Mumbai", zone: "Asia/Kolkata", coords: [19.0760, 72.8777] },
  { offset: "UTC +5:45", pays: "Népal", ville: "Katmandou", zone: "Asia/Kathmandu", coords: [27.7172, 85.3240] },
  { offset: "UTC +6", pays: "Bangladesh", ville: "Dhaka", zone: "Asia/Dhaka", coords: [23.8103, 90.4125] },
  { offset: "UTC +7", pays: "Thaïlande", ville: "Bangkok", zone: "Asia/Bangkok", coords: [13.7563, 100.5018] },
  { offset: "UTC +8", pays: "Chine", ville: "Shanghai", zone: "Asia/Shanghai", coords: [31.2304, 121.4737] },
  { offset: "UTC +9", pays: "Japon", ville: "Tokyo", zone: "Asia/Tokyo", coords: [35.6762, 139.6503] },
  { offset: "UTC +9:30", pays: "Australie", ville: "Adélaïde", zone: "Australia/Adelaide", coords: [-34.9285, 138.6007] },
  { offset: "UTC +10", pays: "Australie", ville: "Sydney", zone: "Australia/Sydney", coords: [-33.8688, 151.2093] },
  { offset: "UTC +11", pays: "Australie", ville: "Nouméa", zone: "Pacific/Noumea", coords: [-22.2735, 166.4463] },
  { offset: "UTC +12", pays: "Nouvelle-Zélande", ville: "Auckland", zone: "Pacific/Auckland", coords: [-36.8485, 174.7633] },
  { offset: "UTC +13", pays: "Nouvelle-Zélande", ville: "Apia", zone: "Pacific/Apia", coords: [-13.8333, -171.7667] },
  { offset: "UTC +14", pays: "Kiribati", ville: "Kiritimati", zone: "Pacific/Kiritimati", coords: [1.8875, -157.4333] },
];

export default function MondePage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredPays = PAYS_DATA.filter(p => 
    p.pays.toLowerCase().includes(search.toLowerCase()) || 
    p.ville.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen relative">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 uppercase text-sm mt-20 hover:translate-x-1 transition-transform">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Horloge Mondiale <Globe className="text-blue-600" />
        </h1>
        <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">Temps Universel Coordonné (UTC) & Fuseaux Locaux</p>
      </header>

      <section className="mb-12 relative shadow-2xl rounded-3xl overflow-hidden border-8 border-slate-50" style={{ zIndex: 1 }}>
        {/* PASSAGE DES DONNÉES À LA CARTE */}
        <MapWorld data={PAYS_DATA} />
      </section>

      {/* Reste du tableau (inchangé) */}
      <section className="mt-16">
         {/* ... (ton code de tableau actuel) */}
      </section>
    </main>
  );
}
