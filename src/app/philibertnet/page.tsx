// src/app/philibertnet/page.tsx

"use client";

import React, { useState, useEffect } from 'react';

// Mise à jour de l'interface pour inclure 'details'
interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
}

interface ApiResponse {
  title: string;
  description: string;
  items: RssItem[];
  source: string;
  error?: string;
  details?: string; // 🟢 NOUVEAU
}

const PhilibertnetPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/philibertnet');
        const result: ApiResponse = await response.json();
        setData(result);
      } catch (e) {
        setData({ 
          title: '', description: '', items: [], source: '', 
          error: 'Impossible de joindre le serveur API interne.' 
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <main className="p-8"><h1>🛍️ Chargement du flux Philibert...</h1></main>;

  if (data?.error) {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-red-700">❌ Erreur de Flux RSS Philibert</h1>
            <p className="mt-4 text-lg">
                <strong>{data.error} :</strong> {data.details || 'Aucun détail supplémentaire disponible.'}
            </p>
            {/* Si c'est l'erreur de parsing que nous avons identifiée */}
            {data.error === 'Erreur de Parsing XML' && (
                 <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                     <p>Ceci est une erreur côté source (Philibert). Le format du fichier RSS est incorrect. Votre application est fonctionnelle, mais les données sont indisponibles.</p>
                 </div>
            )}
        </main>
    );
  }

  // ... (Le rendu des données réussies reste le même)
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">🛍️ {data?.title || 'Mises à Jour Philibert'}</h1>
      <p className="mb-8 text-gray-600 italic">Source : {data?.source}</p>

      <div className="space-y-6">
        {data?.items.map((item, index) => (
          <article key={index} className="border-l-4 border-green-600 pl-4 pb-4">
            <h2 className="text-xl font-semibold hover:text-green-800">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Publié le {new Date(item.pubDate).toLocaleDateString('fr-FR')}
            </p>
            <p className="mt-2 text-gray-700 max-h-24 overflow-hidden">{item.snippet}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default PhilibertnetPage;
