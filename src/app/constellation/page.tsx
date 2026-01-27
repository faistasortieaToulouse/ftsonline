'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Stars, Globe2 } from "lucide-react";

export default function ConstellationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Toulouse par défaut (Latitude 43.6), Sud via -34.6 (Buenos Aires par ex.)
  const [lat, setLat] = useState(43.6047); 

  const fetchConstellations = useCallback(async (latitude: number) => {
    setLoading(true);
    try {
      const month = new Date().getMonth();
      const res = await fetch(`/api/constellation?lat=${latitude}&month=${month}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erreur chargement constellations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConstellations(lat);
  }, [lat, fetchConstellations]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-900">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Stars className="text-blue-600" />
            Ciel Nocturne
          </h1>
          <p className="text-slate-500">Observation des étoiles pour {new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())}</p>
        </div>

        {/* Sélecteur d'hémisphère */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setLat(43.6047)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${lat > 0 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Nord (Toulouse)
          </button>
          <button 
            onClick={() => setLat(-34.6037)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${lat < 0 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sud
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Analyse de la voûte céleste...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
            <Globe2 className="text-blue-600" size={20} />
            <span className="text-sm font-semibold text-blue-800">
              Hémisphère {data.hemisphere} : {data.constellations.length} constellations majeures visibles.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.constellations.map((c: any) => (
              <div 
                key={c.name} 
                className="group p-6 rounded-2xl border bg-slate-900 text-white shadow-xl hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                    {c.name}
                  </h2>
                  <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full border border-blue-800 uppercase tracking-widest font-bold">
                    Visible
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  L'une des plus belles structures célestes observables actuellement depuis l'hémisphère {data.hemisphere.toLowerCase()}.
                </p>
                <div className="text-xs text-slate-500 font-medium italic">
                   Observation idéale : Mi-nuit, ciel dégagé.
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
