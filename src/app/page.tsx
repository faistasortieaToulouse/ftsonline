'use client'; // nécessaire uniquement si tu utilises des hooks côté client

import { useState, useMemo, useEffect } from "react";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Calendar, Map } from "lucide-react";

// ----------------------------
// Hook côté client pour Discord
// ----------------------------
function useDiscordEvents() {
  const [discordEvents, setDiscordEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscord() {
      try {
        const res = await fetch("/api/discord");
        if (!res.ok) throw new Error("Impossible de récupérer Discord");
        const data = await res.json();
        setDiscordEvents(data.events || []);
      } catch (err) {
        console.error("Erreur fetch Discord:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDiscord();
  }, []);

  return { discordEvents, loading };
}

// ----------------------------
// Section Discord côté client
// ----------------------------
function DiscordSection() {
  const { discordEvents, loading } = useDiscordEvents();

  if (loading) return <p className="text-center mt-4 text-muted-foreground">Chargement des événements Discord...</p>;
  if (!discordEvents.length) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Événements Discord</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {discordEvents.map((ev: any) => (
          <div key={ev.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-2">{ev.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{new Date(ev.date).toLocaleString("fr-FR")}</p>
            <p className="text-sm mb-2">{ev.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------
// Barre de recherche
// ----------------------------
function SearchBar({ events }: { events: any[] }) {
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

// ----------------------------
// Page principale côté serveur
// ----------------------------
export default async function Home() {
  // Récupération des événements côté serveur
  let events: any[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/agendatoulouse`, {
      cache: "no-store", // données fraîches à chaque build ou request
    });
    if (!res.ok) throw new Error("Impossible de récupérer les événements");
    const data = await res.json();
    events = data.events || [];
  } catch (err) {
    console.error("Erreur fetch agendatoulouse:", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Ta sortie à Toulouse</p>
            <GoogleTranslate />
          </div>

          {/* Nombre d'événements */}
          <p className="mt-4 text-muted-foreground">
            {events.length} événement{events.length > 1 ? "s" : ""}
          </p>

          {/* Barre de recherche */}
          <SearchBar events={events} />
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
          {events.length > 0 ? (
            events.map((ev) => (
              <div key={ev.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
                {ev.image && <img src={ev.image} alt={ev.name} className="w-full h-40 object-cover mb-4 rounded" />}
                <h2 className="font-semibold text-lg mb-2">{ev.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(ev.date).toLocaleString("fr-FR")}
                </p>
                <p className="text-sm mb-2">{ev.location}</p>
                <p className="text-sm">{ev.description}</p>
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-primary mt-2 inline-block font-medium">
                    En savoir plus
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Agendatoulouse</h2>
              <p className="text-muted-foreground">Revenez plus tard pour de nouveaux événements !</p>
            </div>
          )}
        </div>

        {/* Discord events côté client */}
        <DiscordSection />
      </main>
    </div>
  );
}
