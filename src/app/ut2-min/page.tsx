'use client';

import React, { useState, useEffect } from "react";
// Les imports pour Shadcn/ui Button ne sont pas disponibles ici, mais j'utilise des équivalents Tailwind.
// Dans un environnement réel Next.js/Shadcn, cela fonctionnerait.
// Je simule ici le composant Button avec des classes Tailwind.

// Un composant Button simple pour la démo
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" }> = ({ children, variant = "default", className, ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition duration-200 shadow-md";
    const defaultClasses = "bg-indigo-600 text-white hover:bg-indigo-700";
    const secondaryClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";

    return (
        <button
            className={`${baseClasses} ${variant === "default" ? defaultClasses : secondaryClasses} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
};

// --- Interfaces pour la structure des données ---
interface EventData {
    id: string | number;
    title: string;
    description: string;
    location: string;
    start: string; // Date ISO string
    end: string;   // Date ISO string
    url: string;
    source: string;
}

/* ------------------------------------------------------------------
  Image automatique selon titre : ciné / conf / expo / default
------------------------------------------------------------------- */
const getEventImage = (title: string | undefined) => {
  if (!title) return "https://placehold.co/600x400/312e81/ffffff?text=ut2+Default";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "https://placehold.co/600x400/9333ea/ffffff?text=ut2+Cin%C3%A9ma";
  if (lower.includes("conf")) return "https://placehold.co/600x400/16a34a/ffffff?text=ut2+Conf%C3%A9rence";
  if (lower.includes("expo")) return "https://placehold.co/600x400/f59e0b/ffffff?text=ut2+Exposition";
  return "https://placehold.co/600x400/312e81/ffffff?text=ut2+Default";
};

// --- Données simulées pour la démo (remplaçant l'appel API réel) ---
const MOCK_EVENTS: EventData[] = [
    { id: 1, title: "Conférence: L'IA et la Santé", description: "Exploration des dernières avancées en intelligence artificielle appliquée au domaine médical.", location: "Amphi 4, Bâtiment B", start: new Date(Date.now() + 86400000).toISOString(), end: new Date(Date.now() + 86400000 + 7200000).toISOString(), url: "#", source: "API ut2 Min" },
    { id: 2, title: "Ciné-Débat : La Science-Fiction", description: "Projection du film 'Gattaca' suivie d'une discussion avec des chercheurs en génétique.", location: "Maison de la Recherche", start: new Date(Date.now() + 3 * 86400000).toISOString(), end: new Date(Date.now() + 3 * 86400000 + 10800000).toISOString(), url: "#", source: "API ut2 Min" },
    { id: 3, title: "Exposition : L'Eau dans tous ses états", description: "Une exposition interactive sur le cycle de l'eau et les défis environnementaux.", location: "Hall Principal", start: new Date(Date.now() - 5 * 86400000).toISOString(), end: new Date(Date.now() + 10 * 86400000).toISOString(), url: "#", source: "API ut2 Min" },
    { id: 4, title: "Conférence : Changement Climatique", description: "Les nouvelles données pour l'Occitanie et les perspectives d'adaptation.", location: "Amphi 1", start: new Date(Date.now() + 5 * 86400000).toISOString(), end: new Date(Date.now() + 5 * 86400000 + 5400000).toISOString(), url: "#", source: "API ut2 Min" },
    { id: 5, title: "Journée Portes Ouvertes IUT", description: "Découvrez les formations technologiques et rencontrez les étudiants.", location: "IUT de Blagnac", start: new Date(Date.now() + 15 * 86400000).toISOString(), end: new Date(Date.now() + 15 * 86400000 + 28800000).toISOString(), url: "#", source: "API ut2 Min" },
];


// --- Composant principal ut2MinPage ---

export default function ut2MinPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  /* --------------------- Récupération des événements (Simulée) --------------------- */
  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      // Dans un environnement réel Next.js, cela appellerait une API route.
      // Ici, nous simulons la réponse.
      await new Promise(resolve => setTimeout(resolve, 800)); // Simule le temps de chargement
      const data = MOCK_EVENTS; 
      
      setEvents(data);
      setFilteredEvents(data);
    } catch (err: any) {
      // L'erreur API simulée est désactivée
      setError("Erreur simulée lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }

  /* --------------------- Filtrage texte multi-champs --------------------- */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const q = searchQuery.toLowerCase();

    setFilteredEvents(
      events.filter(ev =>
        ev.title.toLowerCase().includes(q) ||
        (ev.description?.toLowerCase().includes(q) ?? false) ||
        (ev.location?.toLowerCase().includes(q) ?? false) ||
        (new Date(ev.start).toLocaleDateString('fr-FR').includes(q) ?? false) // Recherche par date formatée
      )
    );
  }, [searchQuery, events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Class pour le texte muted
  const mutedTextClass = "text-gray-500"; 
  // Custom scrollbar for better appearance
  const scrollableClass = "custom-scrollbar"; 

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* CSS pour la scrollbar (uniquement pour l'aperçu) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      
      <h1 className="text-3xl font-bold mb-4 text-gray-900">
        Événements ut2 – Ciné, Conf & Expo (Simulé)
      </h1>
      <p className={`mb-6 ${mutedTextClass}`}>
        Événements filtrés et affichés avec les options de mise en page souhaitées.
      </p>

      {/* Boutons + Recherche */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading} variant="default">
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button
          onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}
        >
          📺 Cartes
        </Button>
        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}
        >
          🔲 Liste
        </Button>

        <input
          type="text"
          placeholder="Rechercher par titre, description, lieu ou date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-150"
        />
      </div>

      {/* Compteur */}
      <p className={`mb-4 text-sm text-gray-600`}>
        Événements affichés : {filteredEvents.length}
      </p>

      {/* Chargement/Erreur */}
      {loading && (
          <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="ml-4 text-lg text-indigo-600">Chargement des événements...</p>
          </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded mb-6">
          <p className="font-bold">Erreur de connexion :</p>
          <p>{error}</p>
        </div>
      )}

      {/* Aucun résultat */}
      {filteredEvents.length === 0 && !loading && !error && (
        <p className={mutedTextClass}>Aucun événement trouvé pour la recherche "{searchQuery}".</p>
      )}

      {/* --------------------------------------------------------------------
          MODE CARTE (grand format)
      --------------------------------------------------------------------- */}
      {viewMode === "card" && !loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col h-full min-h-[430px] transition duration-300 hover:scale-[1.01] border border-gray-100">
              
              {/* Image */}
              <img
                src={getEventImage(ev.title)}
                alt={ev.title}
                className="w-full h-40 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/600x400/312e81/ffffff?text=ut2+Default" }}
              />

              <div className="p-4 flex flex-col flex-1">

                {/* Titre */}
                <h2 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">{ev.title}</h2>

                {/* Dates */}
                {ev.start && (
                  <p className="text-sm text-indigo-600 font-medium mb-2">
                    {new Date(ev.start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' - '}
                    {new Date(ev.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}

                {/* Lieu */}
                {ev.location && (
                  <p className={`text-sm ${mutedTextClass} mb-2 flex items-center`}>
                    <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                    {ev.location}
                  </p>
                )}

                {/* Description */}
                {ev.description && (
                  <div className={`text-sm ${mutedTextClass} overflow-y-auto h-20 mb-3 pr-1 ${scrollableClass}`}>
                    {ev.description}
                  </div>
                )}

                {/* Lien */}
                <div className="mt-auto"> {/* Pousse le lien vers le bas */}
                    {ev.url && (
                        <p className="text-sm mb-1">
                            <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition duration-150"
                            >
                                Plus d’infos
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </a>
                        </p>
                    )}

                    {/* Source */}
                    <p className={`text-xs ${mutedTextClass} mt-2 break-words opacity-70`}>
                        Source : {ev.source}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------------------
          MODE LISTE (vignettes)
      --------------------------------------------------------------------- */}
      {viewMode === "list" && !loading && filteredEvents.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow-lg rounded-xl p-4 gap-4 border border-gray-100 transition duration-300 hover:bg-gray-50">

              {/* Image */}
              <img
                src={getEventImage(ev.title)}
                alt={ev.title}
                className="w-full sm:w-48 h-32 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/600x400/312e81/ffffff?text=ut2+Default" }}
              />

              <div className="flex-1">
                
                <h2 className="text-xl font-semibold mb-1 text-gray-900">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-indigo-600 font-medium mb-1">
                    {new Date(ev.start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' - '}
                    {new Date(ev.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}

                {ev.location && (
                  <p className={`text-sm ${mutedTextClass} mb-2 flex items-center`}>
                    <svg className="w-3.5 h-3.5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                    {ev.location}
                  </p>
                )}

                {ev.description && (
                  <p className={`text-sm ${mutedTextClass} mb-2 line-clamp-2`}>
                    {ev.description}
                  </p>
                )}

                <div className="flex justify-between items-end mt-2">
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition duration-150"
                      >
                        🔗 Plus d’infos
                      </a>
                    )}

                    {/* Source */}
                    <p className={`text-xs ${mutedTextClass} opacity-70`}>
                        Source : {ev.source}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
