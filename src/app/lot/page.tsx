// src/app/lot/page.tsx
'use client';

import { useEffect, useState, CSSProperties } from 'react';

interface SiteLot {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
}

export default function LotPage() {
  const [sites, setSites] = useState<SiteLot[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Récupération des données ---
  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await fetch('/api/lot');
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setSites(data);
      } catch (err) {
        console.error('Erreur chargement Lot :', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        🪨 Communes et sites emblématiques du Lot
      </h1>

      <p className="mb-4 font-semibold">
        {loading ? 'Chargement…' : `${sites.length} sites chargés`}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#e5e5e5' }}>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Commune</th>
            <th style={th}>Site emblématique</th>
            <th style={th}>Niveau</th>
            <th style={th}>Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, i) => (
            <tr key={site.id} style={{ backgroundColor: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={tdCenter}>{i + 1}</td>
              <td style={td}>{site.commune}</td>
              <td style={td}>{site.site}</td>
              <td style={tdCenter}>{site.niveau}</td>
              <td style={td}>{site.categorie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

// Styles
const th: CSSProperties = { border: '1px solid #ccc', padding: '10px', textAlign: 'left' };
const td: CSSProperties = { border: '1px solid #ddd', padding: '8px' };
const tdCenter: CSSProperties = { ...td, textAlign: 'center' };
