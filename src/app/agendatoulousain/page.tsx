"use client";

import { useEffect, useState } from "react";

export default function AgendaToulousainPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/agendatoulousain", { cache: "no-store" });
        const json = await res.json();
        setEvents(json.events || []);
      } catch (e) {
        console.error(e);
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
        {events.map((ev) => (
          <div
            key={ev.id}
            className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{ev.title}</h2>
            <p className="text-sm text-gray-600">{ev.dateFormatted}</p>

            {ev.image && (
              <img
                src={ev.image}
                alt={ev.category}
                className="w-full h-48 object-cover rounded-xl mt-2"
              />
            )}

            <p className="mt-2 text-gray-800">{ev.description}</p>

            <p className="mt-2 text-sm text-gray-600">{ev.fullAddress}</p>

            <a
              href={ev.url}
              target="_blank"
              className="inline-block mt-3 text-blue-600 underline"
            >
              Voir l'événement
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
