// src/app/jeusociete/page.tsx

"use client"; // Indique que c'est un composant client (pour utiliser useState/useEffect)

import React, { useState, useEffect } from 'react';

// Interface simple pour le type de données que nous attendons de notre API interne
interface ApiResponse {
  data: string; // Le texte XML brut de BGG
  source: string;
  error?: string;
}

const JeuSocietePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Appel à notre API interne proxy
        const response = await fetch('/api/boardgame');
        const data: ApiResponse = await response.json();
        
        setGameData(data);
      } catch (e) {
        setGameData({
          data: '',
          source: 'Erreur de récupération front-end',
          error: 'Impossible de joindre le serveur API interne.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <h1>🎲 Chargement des données du jeu...</h1>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">🎲 Fiche de Jeu de Société (via API interne)</h1>
      
      {gameData?.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erreur: </strong>
          <span className="block sm:inline">{gameData.error}</span>
        </div>
      ) : (
        <>
          <p className="mb-4">
            Source des données : **{gameData?.source || 'Inconnue'}**
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Résultat XML brut (ID BGG: 92 - Catan)</h2>
          
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {/* Affichage du texte XML brut, car nous ne l'avons pas parsé */}
            {gameData?.data || "Aucune donnée reçue."}
          </pre>
          
          <p className="mt-4 text-gray-600 italic">
            Pour une utilisation réelle, le code dans `route.ts` devrait parser ce XML en JSON avant de le renvoyer.
          </p>
        </>
      )}
    </main>
  );
};

export default JeuSocietePage;
