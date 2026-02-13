"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Info, Activity, Zap } from 'lucide-react';
import Link from 'next/link';

interface Metadata {
  title: string;
  definition: string;
  methodology_notes: string[];
}

interface CountryData {
  rang: number;
  pays: string;
  score_spi_2026: string;
  tendance: string;
  signe_progres: string;
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
        const actualData = Array.isArray(json) ? json : json.data;
        setData(actualData || []);
        setMetadata(json.metadata || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item => 
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-medium mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
              {metadata.title}
            </h1>
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex gap-3 items-start">
                <Info className="shrink-0 mt-1" />
                <p className="text-lg opacity-95">{metadata.definition}</p>
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
            placeholder="Rechercher une nation..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div key={`${item.rang}-${item.pays}`} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all group relative">
                
                {/* Badge de Rang */}
                <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 rounded-bl-xl font-mono text-xs font-bold">
                  #{item.rang}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {item.pays}
                </h3>

                {/* Score & Tendance */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black">
                    SPI {item.score_spi_2026}
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Activity size={12} className="text-blue-500" />
                    {item.tendance}
                  </div>
                </div>

                {/* Signe de Progrès */}
                <div className="space-y-2 border-t border-slate-50 pt-4">
                  <div className="flex gap-2">
                    <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-bold">Progrès :</span> {item.signe_progres}
                    </p>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
