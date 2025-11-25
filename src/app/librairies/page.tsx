/**
 * src/app/librairies/page.tsx
 * Page d'affichage des podcasts des librairies (Ombres Blanches et Terra Nova).
 * Elle appelle la route API /api/podcasts pour récupérer les données agrégées.
 */

import React, { useState, useEffect } from 'react';
import { Play, Mic, Calendar, BookOpen } from 'lucide-react'; // Icônes pour l'interface

// --- Types ---

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  lienAudio: string;
  description: string;
}

interface ApiData {
  success: boolean;
  data: PodcastEpisode[];
  message?: string;
}

// --- Composants ---

/**
 * Carte affichant un seul épisode de podcast.
 */
const PodcastCard: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const dateFormatted = new Date(episode.date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Simuler la lecture audio (dans un environnement réel, on utiliserait un élément <audio>)
  const handlePlay = () => {
    setIsPlaying(true);
    // Dans une vraie application, vous feriez :
    // const audio = new Audio(episode.lienAudio);
    // audio.play();
    console.log(`Lecture de : ${episode.titre} (${episode.lienAudio})`);
    setTimeout(() => setIsPlaying(false), 3000); // Arrêt simulé après 3s
  };

  const librairieColor = episode.librairie === 'Ombres Blanches' 
    ? 'bg-blue-100 text-blue-800 border-blue-300' 
    : 'bg-green-100 text-green-800 border-green-300';
  
  const formattedDescription = episode.description.length > 100 
    ? episode.description.substring(0, 100) + '...' 
    : episode.description;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02] border border-gray-100">
      <div className="flex items-start justify-between">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${librairieColor}`}>
          <BookOpen className="inline w-4 h-4 mr-1"/> {episode.librairie}
        </span>
        <button 
          onClick={handlePlay}
          disabled={isPlaying}
          className={`p-3 rounded-full shadow-md transition-all duration-300 
            ${isPlaying 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          title={isPlaying ? "Lecture en cours..." : `Écouter ${episode.titre}`}
        >
          <Play className={`w-5 h-5 ${isPlaying ? 'opacity-80' : ''}`} fill="currentColor" />
        </button>
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-900 line-clamp-2">
        {episode.titre}
      </h3>
      
      <p className="mt-2 text-gray-600 text-sm h-10">{formattedDescription}</p>

      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          <span>{dateFormatted}</span>
        </div>
        <div className="flex items-center">
          <Mic className="w-4 h-4 mr-1 text-gray-400" />
          <span>Podcast</span>
        </div>
      </div>
    </div>
  );
};

// --- Page Principale ---

const App = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Appel à la route API interne
        const response = await fetch('/api/podcasts'); 
        const result: ApiData = await response.json();

        if (result.success) {
          setEpisodes(result.data);
        } else {
          setError(result.message || "Impossible de charger les podcasts. Veuillez réessayer.");
        }
      } catch (err) {
        console.error("Erreur de fetch:", err);
        setError("Une erreur de connexion inattendue s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const totalPodcasts = episodes.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Podcasts des Librairies Toulousaines
        </h1>
        <p className="text-lg text-gray-600">
          Retrouvez ici les dernières rencontres et conférences des librairies partenaires (Ombres Blanches et Terra Nova) agrégées via leurs flux RSS.
        </p>
        <div className="mt-4 text-sm font-medium text-indigo-600">
          {loading ? (
            <span className="animate-pulse">Chargement des données...</span>
          ) : (
            <span>{totalPodcasts} épisodes disponibles</span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm" role="alert">
            <p className="font-bold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && totalPodcasts === 0 && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPodcasts > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {episodes.map((episode, index) => (
              <PodcastCard key={index} episode={episode} />
            ))}
          </div>
        )}
        
        {!loading && totalPodcasts === 0 && !error && (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <Mic className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Aucun podcast trouvé</h3>
                <p className="text-gray-500 mt-2">Vérifiez les flux RSS ou l'URL de l'API.</p>
            </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto mt-10 text-center text-sm text-gray-400">
        <p>Intégration des flux audio pour une expérience centralisée.</p>
      </footer>
    </div>
  );
};

export default App;
