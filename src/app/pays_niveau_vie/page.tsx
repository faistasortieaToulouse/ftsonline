"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Info, Activity, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Metadata {
  title: string;
  definition: string;
  methodology_notes: string[];
}

interface CountryData {
  rang: number;
  pays: string;
  details?: string;
  score_spi_2026?: string;
  point_fort?: string;
  dynamique?: string;
  signe_progres?: string;
  tendance?: string;
  etat_2026?: string;
  enjeu?: string;
  defi?: string;
  contexte?: string;
  indicateur?: string;
  cause?: string;
}

export default function NiveauViePage() {
  const [data, setData] = useState<CountryData[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_niveau_vie')
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setMetadata(json.metadata);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => 
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-medium mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {metadata.title}
            </h1>
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex gap-3 items-start">
                <Info className="shrink-0 mt-1" />
                <p className="text-lg opacity-90">{metadata.definition}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metadata.methodology_notes.map((note, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 shadow-sm">
                  {note}
                </div>
              ))}
            </div>
          </header>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher une nation ou un territoire..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div key={`${item.rang}-${item.pays}`} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all group overflow-hidden relative">
                {/* Badge de Rang */}
                <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 rounded-bl-xl font-mono text-sm">
                  #{item.rang}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 pr-10">
                  {item.pays}
                </h3>

                {/* Section Score SPI si présent */}
                {item.score_spi_2026 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
                      SPI: {item.score_spi_2026}
                    </div>
                  </div>
                )}

                {/* Contenu Dynamique selon les clés disponibles */}
                <div className="space-y-3 text-sm">
                  {item.details && <p className="text-slate-600 italic leading-relaxed">"{item.details}"</p>}
                  
                  {item.point_fort && (
                    <div className="flex gap-2">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-slate-700"><strong>Atout:</strong> {item.point_fort}</span>
                    </div>
                  )}

                  {item.signe_progres && (
                    <div className="flex gap-2">
                      <Zap size={16} className="text-amber-500 shrink-0" />
                      <span className="text-slate-700"><strong>Progrès:</strong> {item.signe_progres}</span>
                    </div>
                  )}

                  {item.etat_2026 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                      <p className="font-semibold text-slate-800">Situation 2026:</p>
                      <p className="text-slate-600">{item.etat_2026}</p>
                    </div>
                  )}

                  {(item.enjeu || item.defi) && (
                    <div className="flex gap-2 text-rose-600 font-medium">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{item.enjeu || item.defi}</span>
                    </div>
                  )}

                  {item.contexte && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Contexte Global</span>
                      <p className="text-slate-500 text-xs mt-1">{item.contexte}</p>
                      {item.indicateur && <p className="text-blue-600 text-xs font-bold mt-1">Focus: {item.indicateur}</p>}
                    </div>
                  )}

                  {item.cause && (
                    <p className="text-xs bg-slate-100 p-2 rounded text-slate-500">Note: {item.cause}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
