// ⚠️ IMPORTANT : empêche le prerender statique (Next.js 15)
export const dynamic = 'force-dynamic';

"use client";

import React, { useEffect, useState } from 'react';

// --------------------
// Types
// --------------------
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
  count?: number;
  error?: string;
  details?: string;
}

// --------------------
// Composant Page
// --------------------
const PhilibertnetPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/philibertnet', {
          cache: 'no-store',
        });

        const result: ApiResponse = await response.json();
        setData(result);
      } catch {
        setData({
          title: '',
          description: '',
          items: [],
          source: 'Philibert.net',
          error: 'Impossible de joindre le serveur API interne.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // --------------------
  // États UI
  // --------------------
  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          🛍️ Chargement du flux Philibert…
        </h1>
      </main>
    );
  }

  if (data?.error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-700">
          ❌ Erreur de Flux RSS Philibert
        </h1>

        <p className="mt-4 text-lg">
          <strong>{data.error}</strong>
        </p>

        {data.details && (
          <p className="mt-2 text-sm italic text-gray-700">
            Détails : {data.details}
          </p>
        )}

        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p>
            Cette erreur provient de la source Philibert.  
            Votre application fonctionne correctement, mais les
            données sont temporairement indisponibles.
          </p>
        </div>
      </main>
    );
  }

  // --------------------
  // Rendu normal
  // --------------------
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">
        🛍️ {data?.title || 'Nouveautés Philibert'}
      </h1>

      <p className="mb-6 text-gray-600 italic">
        Source : {data?.source} — Articles : {data?.count}
      </p>

      <div className="space-y-6">
        {data?.items.map((item, index) => (
          <article
            key={index}
            className="border-l-4 border-green-600 pl-4 pb-4"
          >
            <h2 className="text-xl font-semibold hover:text-green-800">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Publié le{' '}
              {item.pubDate
                ? new Date(item.pubDate).toLocaleDateString('fr-FR')
                : 'date inconnue'}
            </p>

            <p className="mt-2 text-gray-700 max-h-24 overflow-hidden">
              {item.snippet}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default PhilibertnetPage;
