'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Bus } from 'lucide-react';

interface TisseoDoc {
  file: {
    filename: string;
    url: string;
    format: string;
  };
}

export default function TisseoTempsReelPage() {
  const [data, setData] = useState<TisseoDoc[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseotempsreel')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 font-sans">
      {/* Navigation de retour */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <span className="bg-red-600 text-white px-3 py-1 rounded">Tisséo</span>
          Temps Réel 2026
        </h1>
        <p className="text-slate-600 mt-2">Gestion des flux de transport de Toulouse Métropole</p>
      </header>

      <div className="grid gap-6">
        {/* Section Documentation */}
        <section className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Documentation Développeur
          </h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.map((item, index) => (
                <a 
                  key={index}
                  href={item.file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <span className="font-medium text-slate-700 group-hover:text-blue-700">{item.file.filename}</span>
                  <span className="text-xs font-bold uppercase px-2 py-1 bg-slate-100 rounded text-slate-500">{item.file.format}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Section Temps Réel (Placeholder) */}
        <section className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
          <Bus className="mx-auto text-slate-400 mb-3" size={32} />
          <h2 className="text-lg font-semibold text-slate-700">Flux de données Live</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
            Le service est prêt à recevoir les requêtes temps réel. Configurez vos `stop_id` pour voir les prochains passages.
          </p>
        </section>
      </div>
    </main>
  );
}
