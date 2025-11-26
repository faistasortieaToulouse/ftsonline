import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Video } from 'lucide-react';

// --- TYPESCRIPT INTERFACES (pour la structure des données) ---

interface Event {
  id: number;
  date: string; // Format 'YYYY-MM-DD'
  time: string; // Format 'HH:MM'
  title: string;
  location: string;
  description: string;
  category: 'Culture' | 'Formation' | 'Recherche' | 'Vie Étudiante';
}

interface ApiError {
    message: string;
    details: string;
}


// --- API ROUTE SIMULÉE (Ce serait le contenu de 'route.ts' dans un projet Next.js) ---

// Les données sont simulées mais basées sur le flux Canal-U (vidéos de conférences).
// URL du flux RSS trouvé : https://www.canal-u.tv/chaines/ut2j/rss
// En production, le code ici ferait un fetch vers cette URL, puis un parsing XML en JSON côté serveur.
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    date: '2025-11-20',
    time: '45:00', // Durée de la vidéo simulée (45 minutes)
    title: 'Conférence : L\'histoire de l\'Occitanie au Moyen Âge',
    location: 'Canal-U / Historique',
    description: "Une rétrospective de la période médiévale en Occitanie par le Prof. Dubois, capturée en 2024.",
    category: 'Recherche',
  },
  {
    id: 2,
    date: '2025-11-25',
    time: '30:30',
    title: 'Webinaire : Les enjeux du Big Data en Sciences Humaines',
    location: 'Canal-U / Informatique',
    description: "Présentation des méthodes de collecte et d'analyse des grandes données appliquées aux SHS.",
    category: 'Formation',
  },
  {
    id: 3,
    date: '2025-12-04',
    time: '19:30',
    title: 'Séminaire : L\'impact de l\'IA sur la création artistique',
    location: 'Canal-U / Arts',
    description: "Analyse des outils d'intelligence artificielle et de leur influence sur les pratiques culturelles contemporaines.",
    category: 'Culture',
  },
  {
    id: 4,
    date: '2025-12-03',
    time: '12:00',
    title: 'Tutoriel : Bien préparer sa session d\'examen',
    location: 'Canal-U / Méthodologie',
    description: "Conseils pratiques pour la gestion du temps, les techniques de révision et la réduction du stress avant les examens.",
    category: 'Vie Étudiante',
  },
  {
    id: 5,
    date: '2025-12-01',
    time: '1:15:00',
    title: 'Colloque : La didactique des langues à l\'ère du numérique',
    location: 'Canal-U / Langues',
    description: "Synthèse des recherches actuelles sur l'enseignement des langues étrangères avec les technologies numériques.",
    category: 'Formation',
  },
];

/**
 * Simule la récupération des événements depuis une API.
 * EN PRODUCTION (dans le route.ts) : Cette fonction ferait un fetch de l'URL RSS Canal-U,
 * puis utiliserait une librairie de parsing XML (côté serveur) pour retourner les données en JSON.
 */
const fetchEvents = (): Promise<Event[] | ApiError> => {
    // Dans une vraie application, on ferait un 'fetch' vers l'URL de l'API ici.
    return new Promise((resolve) => {
        setTimeout(() => {
            // Ici, on pourrait ajouter une logique pour filtrer ou trier les événements
            // On a mis une heure/durée non standard pour simuler le temps d'une vidéo
            const sortedEvents = MOCK_EVENTS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            resolve(sortedEvents);
        }, 500); // Délai simulé de 500ms
    });
};


// --- UI COMPONENT (Ce serait le contenu de 'page.tsx' dans un projet Next.js) ---

const CategoryPill: React.FC<{ category: Event['category'] }> = ({ category }) => {
  let colorClass = '';
  switch (category) {
    case 'Culture':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'Formation':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'Recherche':
      colorClass = 'bg-purple-100 text-purple-800';
      break;
    case 'Vie Étudiante':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
  }
  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${colorClass} transition duration-150`}>
      {category}
    </span>
  );
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 border border-gray-100">
    <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
        <CategoryPill category={event.category} />
    </div>
    
    <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
    
    <div className="space-y-2 text-sm text-gray-700">
      <div className="flex items-center space-x-2">
        <Video className="w-4 h-4 text-indigo-500" />
        {/* On affiche la date comme date de publication de la vidéo */}
        <span>Publié le {new Date(event.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-indigo-500" />
        {/* On affiche le temps comme la durée de la vidéo */}
        <span>Durée : {event.time}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-indigo-500" />
        <span>Source : {event.location}</span>
      </div>
    </div>
    
    <a href="https://www.canal-u.tv/chaines/ut2j" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800 transition duration-150 group">
        Voir la vidéo sur Canal-U
        <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-150 group-hover:translate-x-1" />
    </a>
  </div>
);

const EventList: React.FC<{ events: Event[] }> = ({ events }) => (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
            <EventCard key={event.id} event={event} />
        ))}
    </div>
);


export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Event['category']>('all');

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const result = await fetchEvents();
      
      if ('message' in result) {
        setError(result.message);
        setEvents([]);
      } else {
        setEvents(result as Event[]);
        setError(null);
      }
      setLoading(false);
    };

    loadEvents();
  }, []);

  const categories: Event['category'][] = useMemo(() => {
    return ['Culture', 'Formation', 'Recherche', 'Vie Étudiante'];
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') {
      return events;
    }
    return events.filter(event => event.category === filter);
  }, [events, filter]);

  const handleFilterChange = (newFilter: 'all' | Event['category']) => {
    setFilter(newFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="py-6 mb-8 text-center bg-white rounded-xl shadow-md">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 tracking-tight">
                Vidéothèque UT2J (Canal-U)
            </h1>
            <p className="mt-2 text-lg text-gray-500">
                Contenu vidéo (conférences, séminaires) issu de la chaîne Canal-U de l'université.
            </p>
            <p className="mt-4 text-xs text-red-500 italic px-4">
                *Source de données : Flux RSS Canal-U. Les données affichées sont simulées (Mock) car le traitement XML doit être effectué côté serveur.
            </p>
        </header>

        {/* Boutons de Filtre */}
        <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-8">
            <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-full font-medium transition duration-300 
                  ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'}
                `}
            >
                Tous les contenus ({events.length})
            </button>
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => handleFilterChange(category)}
                    className={`mt-2 sm:mt-0 px-4 py-2 rounded-full font-medium transition duration-300 
                      ${filter === category ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'}
                    `}
                >
                    {category} ({events.filter(e => e.category === category).length})
                </button>
            ))}
        </div>


        {/* Affichage du Contenu */}
        {loading ? (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="ml-4 text-lg text-indigo-600">Chargement des vidéos...</p>
            </div>
        ) : error ? (
            <div className="text-center p-8 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-md">
                <p className="font-bold">Erreur de connexion :</p>
                <p>{error}</p>
                <p className="mt-2 text-sm">Le flux RSS n'a pas pu être parsé (simulé). Vérifiez le MOCK_EVENTS.</p>
            </div>
        ) : filteredEvents.length === 0 ? (
            <div className="text-center p-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded shadow-md">
                <p className="font-bold">Aucun contenu trouvé</p>
                <p>La catégorie sélectionnée n'a pas de vidéos à afficher.</p>
            </div>
        ) : (
            <EventList events={filteredEvents} />
        )}
        
      </div>
    </div>
  );
}
