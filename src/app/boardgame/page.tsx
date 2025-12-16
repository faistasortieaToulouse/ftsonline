// src/app/boardgame/page.tsx (Page d'affichage BGA)

"use client";

import React, { useState, useEffect } from 'react';

interface ApiResponse {
  data: any; // JSON BGA
  source: string;
  search_term: string;
  error?: string;
  details?: string;
}

const BoardGamePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Appel à notre proxy BGA
        const response = await fetch('/api/boardgame'); 
        const data: ApiResponse = await response.json();
        setGameData(data);
      } catch (e) {
        setGameData({
          data: {}, source: 'Erreur front-end', search_term: '',
          error: 'Impossible de joindre le serveur API interne.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <main className="p-8"><h1>🎲 Chargement BGA...</h1></main>;

  const content = gameData?.error ? (
    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mt-4">
      <strong className="font-bold">Erreur BGA: </strong>
      <span className="block sm:inline">{gameData.error}</span>
      {gameData.details && <p className="mt-2 text-sm italic">Détails : {gameData.details}</p>}
    </div>
  ) : (
    <>
      <p className="mb-4">
        Source des données : **{gameData?.source}** (Recherche : {gameData?.search_term})
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Résultat JSON parsé (Ticket to Ride)</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
        {JSON.stringify(gameData?.data, null, 2) || "Aucune donnée JSON reçue."}
      </pre>
    </>
  );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">🇺🇸 Board Game Page (BGA)</h1>
      {content}
    </main>
  );
};

export default BoardGamePage;
