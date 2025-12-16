// src/app/jeuplateau/page.tsx

"use client";

import React, { useState, useEffect } from 'react';

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  creator: string;
}

interface ApiResponse {
  title: string;
  description: string;
  items: RssItem[];
  source: string;
  error?: string;
  details?: string;
}

const JeuPlateauPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/jeuplateau');
        const result: ApiResponse = await response.json();
        setData(result);
      } catch (e) {
        setData({ title: '', description: '', items: [], source: '', error: 'Erreur réseau front-end.' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <main className="p-8"><h1>📰 Chargement des actualités...</h1></main>;

  if (data?.error) {
    return (
        <main className="p-8"><h1 className="text-2xl font-bold">Erreur de Flux RSS</h1><p>{data.error}</p></main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">📰 {data?.title || 'Actualités Jeux de Plateau'}</h1>
      <p className="mb-8 text-gray-600 italic">Source : {data?.source}</p>

      <div className="space-y-6">
        {data?.items.map((item, index) => (
          <article key={index} className="border-l-4 border-blue-500 pl-4 pb-4">
            <h2 className="text-xl font-semibold hover:text-blue-700">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Publié le {new Date(item.pubDate).toLocaleDateString('fr-FR')} par {item.creator || 'Auteur Inconnu'}
            </p>
            <p className="mt-2 text-gray-700">{item.snippet}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default JeuPlateauPage;
