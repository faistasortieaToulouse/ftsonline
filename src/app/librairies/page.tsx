"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Mic, Calendar, BookOpen, Pause, RefreshCcw } from 'lucide-react';

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

interface ApiData {
  success: boolean;
  data: PodcastEpisode[];
  metadata?: {
    totalEpisodes: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

const PodcastCard: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(episode.audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [episode.audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error("Erreur lecture audio:", err);
        alert("La lecture audio a échoué. Vérifiez votre navigateur.");
      });
    }
  };

  const dateFormatted = new Date(episode.date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

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
          onClick={handlePlayPause}
          className={`p-3 rounded-full shadow-md transition-all duration-300 
            ${isPlaying ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          title={isPlaying ? "Mettre en pause" : `Écouter ${episode.titre}`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-900 line-clamp-2">{episode.titre}</h3>
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

const App = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [metadata, setMetadata] = useState<{ totalEpisodes: number; page: number; limit: number; totalPages: number }>({ totalEpisodes: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [librairie, setLibrairie] = useState("");
  const [dateMin, setDateMin] = useState("");

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/podcasts?page=${metadata.page}&limit=${metadata.limit}&q=${query}&librairie=${librairie}&dateMin=${dateMin}`);
      const result: ApiData = await response.json();
      if (result.success) {
        setEpisodes(result.data);
        if (result.metadata) setMetadata(result.metadata);
      } else {
        setError(result.message || "Impossible de charger les podcasts.");
      }
    } catch (err) {
      console.error("Erreur de fetch:", err);
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [metadata.page, query, librairie, dateMin]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Podcasts des Librairies Toulousaines</h1>
        <p className="text-lg text-gray-600">Rencontres et conférences des librairies Ombres Blanches et Terra Nova.</p>
        <div className="mt-4 text-sm font-medium text-indigo-600">
          {loading ? <span className="animate-pulse">Chargement...</span> : <span>{metadata.totalEpisodes} épisodes disponibles</span>}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <select value={librairie} onChange={e => setLibrairie(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Toutes</option>
            <option value="Ombres Blanches">Ombres Blanches</option>
            <option value="Terra Nova">Terra Nova</option>
          </select>
          <input type="date" value={dateMin} onChange={e => setDateMin(e.target.value)} className="border rounded px-3 py-2" />
          <button onClick={fetchPodcasts} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            <RefreshCcw className="w-4 h-4" /> Rafraîchir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}
        {!loading && episodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {episodes.map((ep, i) => <PodcastCard key={i} episode={ep} />)}
          </div>
        )}
        {!loading && episodes.length === 0 && !error && (
          <div className="text-center py-10 bg-white rounded-xl shadow-md">
            <Mic className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Aucun podcast trouvé</h3>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto mt-10 text-center text-sm text-gray-400">
        <p>Intégration des flux audio pour une expérience centralisée.</p>
        <p className="mt-2">© {new Date().getFullYear()} Librairies Toulousaines</p>
      </footer>
    </div>
  );
};

export default App;
