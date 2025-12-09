"use client";

import { useEffect, useState } from "react";

// Fonction intelligente pour supporter n'importe quel format de données
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;

  // Dernière chance : tente de récupérer le premier tableau trouvé
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  if (firstArray) return firstArray;

  return [];
}

export default function AgendaToulousainPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/agendatoulousain", { cache: "no-store" });
        const raw = await res.json();

        const normalized = normalizeApiResult(raw);

        // Trie optionnel par date si disponible
        const sorted = normalized.sort((a, b) => {
          const da = new Date(a.date || a.pubDate || 0).getTime();
          const db = new Date(b.date || b.pubDate || 0).getTime();
          return da - db;
        });

        setEvents(sorted);
      } catch (e) {
        console.error("Erreur frontend :", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Agenda Toulousain</h1>

      {loading && <p>Chargement...</p>}

      {!loading && events.length === 0 && (
        <p>Aucun événement trouvé.</p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {events.map((ev, index) => {
          const title = ev.title || "Événement";
          const desc = ev.description?.replace(/<[^>]+>/g, "") || ""; // supprime le HTML brut
          const date =
            ev.dateFormatted ||
            new Date(ev.date || ev.pubDate || "").toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

          return (
            <div
              key={ev.id || ev.link || index}
              className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-gray-600">{date}</p>

              {ev.image && (
                <img
                  src={ev.image}
                  alt={ev.category || "Illustration"}
                  className="w-full h-48 object-cover rounded-xl mt-2"
                />
              )}

              {desc && (
                <p className="mt-2 text-gray-800">{desc}</p>
              )}

              {ev.fullAddress && (
                <p className="mt-2 text-sm text-gray-600">{ev.fullAddress}</p>
              )}

              {ev.url || ev.link ? (
                <a
                  href={ev.url || ev.link}
                  target="_blank"
                  className="inline-block mt-3 text-blue-600 underline"
                >
                  Voir l'événement
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
