// src/app/jeusociete/page.tsx (Page d'affichage BGG)

"use client";

import React, { useState, useEffect } from 'react';

interface ApiResponse {
  data: string; // XML BGG
  source: string;
  game_id: number;
  error?: string;
  details?: string;
}

const JeuSocietePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Appel à notre proxy BGG
        const response = await fetch('/api/jeusociete'); 
        const data: ApiResponse = await response.json();
        setGameData(data);
      } catch (e) {
        setGameData({
          data: '', source: 'Erreur front-end', game_id: 0,
          error: 'Impossible de joindre le serveur API interne.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <main className="p-8"><h1>🎲 Chargement BGG...</h1></main>;
  
  const content = gameData?.error ? (
    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mt-4">
      <strong className="font-bold">Erreur BGG: </strong>
      <span className="block sm:inline">{gameData.error}</span>
      {gameData.details && <p className="mt-2 text-sm italic">{gameData.details}</p>}
    </div>
  ) : (
    <>
      <p className="mb-4">
        Source des données : **{gameData?.source}** (ID: {gameData?.game_id})
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Résultat XML brut (Catan)</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
        {gameData?.data || "Aucune donnée XML reçue."}
      </pre>
    </>
  );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">🇫🇷 Fiche Jeu Société (BGG)</h1>
      {content}
    </main>
  );
};

export default JeuSocietePage;
