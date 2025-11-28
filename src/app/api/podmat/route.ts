import React, { useState, useEffect } from 'react';

// Interface pour définir la structure d'un podcast
interface Podcast {
  title: string;
  description: string;
  date: string;
  audioUrl: string | null;
}

// URL du flux RSS de "Marathon des Mots"
const rssFeedUrl = "https://feed.ausha.co/BnYn5Uw5W3WO";

/**
 * Fonction pour récupérer et parser le flux RSS.
 * Dans un vrai projet Next.js, cette logique serait dans src/app/api/podmat/route.ts.
 */
async function fetchAndParsePodcasts(): Promise<Podcast[] | { error: string }> {
  try {
    // Tentative de récupération client-side. Peut échouer à cause de CORS.
    const response = await fetch(rssFeedUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Vérification des erreurs de parsing
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      const errorText = xmlDoc.getElementsByTagName('parsererror')[0]?.textContent || "Erreur inconnue";
      console.error("Erreur de parsing XML:", errorText);
      throw new Error("Impossible de parser le flux RSS.");
    }

    const items = xmlDoc.getElementsByTagName('item');
    
    // Mapping des éléments XML vers des objets Podcast
    const podcasts: Podcast[] = Array.from(items).map(item => {
      const getTagContent = (tagName: string) => item.getElementsByTagName(tagName)[0]?.textContent || '';
      const enclosureElement = item.getElementsByTagName('enclosure')[0];

      const title = getTagContent('title');
      let description = getTagContent('description');
      
      // Nettoyage de la description (supprime les balises CDATA et HTML simples)
      description = description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
      
      const pubDate = getTagContent('pubDate');
      const date = pubDate ? new Date(pubDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date Inconnue';
      const audioUrl = enclosureElement ? enclosureElement.getAttribute('url') : null;

      return { title, description, date, audioUrl };
    });

    return podcasts;

  } catch (error: any) {
    console.error("Erreur complète:", error);
    return { error: `Échec de la récupération ou du parsing. En Next.js, l'API route.ts aurait servi de proxy pour éviter les problèmes CORS. Détail: ${error.message}` };
  }
}

// Composant principal de la page
export default function App() {
  const [podcasts, setPodcasts] = useState<Podcast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction de chargement asynchrone
    const loadPodcasts = async () => {
      setLoading(true);
      const result = await fetchAndParsePodcasts();
      
      if ('error' in result) {
        setError(result.error);
        setPodcasts([]);
      } else {
        setPodcasts(result);
      }
      setLoading(false);
    };

    loadPodcasts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">
          🎧 Marathon des Mots - Podcasts
        </h1>
        <p className="text-gray-600 mt-2">
          Liste des épisodes récupérés depuis le flux RSS : 
          <a href={rssFeedUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline ml-1 truncate max-w-full inline-block">
            {rssFeedUrl}
          </a>
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center p-10">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl text-gray-700">Chargement des épisodes...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
          <p className="font-bold">Erreur de connexion/parsing</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && podcasts && podcasts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {podcasts.map((podcast, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="p-5 flex-grow">
                <p className="text-sm font-semibold text-indigo-500 mb-1">{podcast.date}</p>
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {podcast.title}
                </h2>
                <p className="text-gray-600 line-clamp-4">
                  {podcast.description || "Description non fournie pour cet épisode."}
                </p>
              </div>
              <div className="p-5 pt-0 border-t border-gray-100">
                {podcast.audioUrl ? (
                  <>
                    <audio controls className="w-full mt-4 rounded-lg">
                      <source src={podcast.audioUrl} type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <a 
                      href={podcast.audioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 block text-center w-full bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-600 transition duration-150 text-sm"
                    >
                      Télécharger l'épisode
                    </a>
                  </>
                ) : (
                  <p className="text-red-500 mt-3 text-sm">Lien audio non trouvé.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && podcasts && podcasts.length === 0 && !error && (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <p className="text-xl text-gray-500">Aucun épisode n'a pu être chargé.</p>
        </div>
      )}

    </div>
  );
}
