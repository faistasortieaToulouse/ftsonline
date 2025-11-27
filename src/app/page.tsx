'use client';

import { useState, useMemo } from "react";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Calendar, Map } from "lucide-react";
import { useDiscordEvents } from "@/hooks/useDiscordEvents";

interface Event {
  id: string;
  name: string;
  date: string;
  image?: string;
  location?: string;
  description?: string;
  url?: string;
}

// Fetch côté client pour Agendatoulouse et autres flux
export default function Home({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents || []);
  
  // Hook pour Discord
  const { events: discordEvents, loading: discordLoading } = useDiscordEvents();

  // Combiner les événements Discord avec les autres événements
  const allEvents = useMemo(() => {
    return [...events, ...discordEvents];
  }, [events, discordEvents]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Ta sortie à Toulouse</p>
            <GoogleTranslate />
          </div>

          {/* Nombre total d'événements */}
          <p className="mt-4 text-muted-foreground">
            {allEvents.length} événement{allEvents.length > 1 ? "s" : ""}
          </p>

          {/* Barre de recherche */}
          <SearchBar events={allEvents} />
        </div>

        {/* Boutons Calendar / Map */}
        <div className="container mx-auto px-4 mt-4 flex gap-2">
          <Link href="/calendar" className="btn-outline flex items-center gap-1">
            <Calendar /> Voir le calendrier
          </Link>
          <Link href="/map" className="btn-outline flex items-center gap-1">
            <Map /> Voir la carte
          </Link>
        </div>

        {/* Liste des événements */}
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.length > 0 ? (
            allEvents.map((ev) => (
              <div key={ev.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
                {ev.image && <img src={ev.image} alt={ev.name} className="w-full h-40 object-cover mb-4 rounded" />}
                <h2 className="font-semibold text-lg mb-2">{ev.name}</h2>
                {ev.date && <p className="text-sm text-muted-foreground mb-2">{new Date(ev.date).toLocaleString("fr-FR")}</p>}
                {ev.location && <p className="text-sm mb-2">{ev.location}</p>}
                {ev.description && <p className="text-sm">{ev.description}</p>}
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-primary mt-2 inline-block font-medium">
                    En savoir plus
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Aucun événement pour le moment</h2>
              <p className="text-muted-foreground">Revenez plus tard pour découvrir de nouveaux événements !</p>
            </div>
          )}
          {discordLoading && <p className="text-center text-muted-foreground col-span-full">Chargement des événements Discord...</p>}
        </div>
      </main>
    </div>
  );
}

// ------------------------------------
// Composant barre de recherche
// ------------------------------------
function SearchBar({ events }: { events: Event[] }) {
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    if (!term) return events;
    return events.filter((ev) =>
      [ev.name, ev.description, ev.location]
        .join(" ")
        .toLowerCase()
        .includes(term.toLowerCase())
    );
  }, [term, events]);

  return (
    <div className="my-4">
      <input
        type="search"
        placeholder="Rechercher par titre, lieu, description..."
        className="w-full px-4 py-2 border rounded-lg"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <p className="text-sm text-muted-foreground mt-1">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
    </div>
  );
}
