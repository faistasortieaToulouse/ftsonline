'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  // On initialise à 0 ou à une valeur estimée le temps du chargement
  const [totalDynamique, setTotalDynamique] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalCount() {
      try {
        // On appelle l'API centrale qui agrège les 4 sources
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error("Erreur de récupération");
        
        const data = await res.json();

        // On additionne les compteurs dynamiques reçus
        // + les rubriques statiques (Discord, Facebook, etc. que tu estimes à environ 168 comme vu précédemment)
        const NB_RUBRIQUES_STATIQUES = 168; 
        
        const countAgenda = data.agenda || 0;
        const countMeetup = data.meetup || 0;
        const countCinema = data.cinema || 0;
        const countJeux   = data.jeux || 0;

        setTotalDynamique(NB_RUBRIQUES_STATIQUES + countAgenda + countMeetup + countCinema + countJeux);
      } catch (err) {
        console.error("Erreur compteur:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGlobalCount();
  }, []);

  return (
    <main>
      {/* ... Tes autres composants (Météo, Catégories, etc.) ... */}

      <div className="text-center mb-8 font-medium text-slate-500 italic">
        Nombre total de ressources : 
        <span className="font-bold text-purple-600 ml-2">
          {loading ? (
            <span className="animate-pulse">Calcul...</span>
          ) : (
            totalDynamique
          )}
        </span> articles
      </div>

      {/* ... Le reste de ta grille de catégories ... */}
    </main>
  );
}
