'use client';

import { useState, useEffect, useMemo } from "react";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Calendar, Map } from "lucide-react";

// ------------------------------------
// Composant Home
// ------------------------------------
export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch côté client
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/agendatoulouse`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Impossible de récupérer les événements");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        console.error("Erreur fetch agendatoulouse:", err);
        setError("Impossible de charger les événements pour le moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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
          {!loading && !error && (
            <p className="mt-4 text-muted-foreground">
              {events.length} événement{events.length > 1 ? "s" : ""}
            </p>
          )}

          {/* Barre de recherche */}
          {!loading && !error && <SearchBar events={events} />}

          {/* Message loading / erreur */}
          {loading && <p className="mt-4 text-muted-foreground">Chargement des événements…</p>}
          {error && <p className="mt-4 text-red-500">{error}</p>}
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
          {!loading && !error && events.length > 0
            ? events.map((ev) => (
                <div key={ev.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
                  {ev.image && (
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className="w-full h-40 object-cover mb-4 rounded"
                    />
                  )}
                  <h2 className="font-semibold text-lg mb-2">{ev.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(ev.date).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-sm mb-2">{ev.location}</p>
                  <p className="text-sm">{ev.description}</p>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-2 inline-block font-medium"
                    >
                      En savoir plus
                    </a>
                  )}
                </div>
              ))
            : null}

          {!loading && !error && events.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-2">Agendatoulouse</h2>
              <p className="text-muted-foreground">
                Reviens plus tard pour de nouveaux événements !
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ------------------------------------
// Composant barre de recherche
// ------------------------------------
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
      <p className="text-sm text-muted-foreground mt-1">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
