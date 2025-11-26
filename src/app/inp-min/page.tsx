"use client";

import { useEffect, useState } from "react";

interface INPEvent {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string | null;
}

export default function INPMinPage() {
  const [events, setEvents] = useState<INPEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/inp-min");
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Erreur API");
        setEvents(json.events || []);
      } catch (err: any) {
        setError(err.message);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Événements INP-Min</h1>
      <p>Liste des derniers événements du flux RSS de Toulouse INP.</p>

      {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

      <h3>Événements affichés : {events.length}</h3>

      <div style={{ display: "grid", gap: "1.2rem", marginTop: "2rem" }}>
        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "1rem",
              display: "flex",
              gap: "1rem",
            }}
          >
            {ev.image && (
              <img
                src={ev.image}
                alt=""
                width={90}
                height={90}
                style={{ borderRadius: 6, objectFit: "cover" }}
              />
            )}

            <div>
              <a
                href={ev.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "1.1rem", fontWeight: "bold" }}
              >
                {ev.title}
              </a>

              <p style={{ margin: "0.3rem 0", color: "#555" }}>
                {new Date(ev.pubDate).toLocaleDateString("fr-FR")}
              </p>

              <p>{ev.description.replace(/<[^>]+>/g, "")}</p>
            </div>
          </div>
        ))}

        {events.length === 0 && !error && (
          <p>Aucun événement trouvé pour le moment.</p>
        )}
      </div>
    </div>
  );
}
