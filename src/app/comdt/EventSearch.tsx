"use client";

import React, { useState, useMemo } from "react";

interface EventItem {
  id: string;
  source: string;
  title: string;
  description: string | null;
  location: string | null;
  link: string;
  start: string | null;
  end: string | null;
  image: string | null;
}

export default function EventSearch({ events }: { events: EventItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Normalisation pour recherche avec accents
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Liste des catégories à partir de "source"
  const categories = Array.from(new Set(events.map((e) => e.source)));

  const filteredEvents = useMemo(() => {
    const q = normalize(search);

    return events.filter((ev) => {
      const text = normalize(
        `${ev.title} ${ev.description} ${ev.location} ${ev.source} ${ev.start}`
      );

      const matchText = text.includes(q);
      const matchCat = category === "all" || ev.source === category;

      return matchText && matchCat;
    });
  }, [events, search, category]);

  const formatDate = (d: string | null): string => {
    if (!d) return "Date non spécifiée";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* 🔍 Barre de recherche + filtre catégorie */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Rechercher (titre, description, lieu, date...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            fontSize: "1rem",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            fontSize: "1rem",
          }}
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Compteur */}
      <p style={{ fontWeight: "bold", color: "#1a5a9c", marginBottom: "20px" }}>
        Événements trouvés : {filteredEvents.length}
      </p>

      {/* Liste filtrée */}
      {filteredEvents.length === 0 ? (
        <p>Aucun évènement ne correspond à la recherche.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredEvents.map((event, index) => (
            <div
              key={event.id || index}
              style={{
                border: "1px solid #1a5a9c",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f0f8ff",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#0056b3", marginBottom: "10px" }}>
                {event.title}
              </h3>

              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                />
              )}

              <p>
                <strong>Quand :</strong> {formatDate(event.start)}
              </p>
              <p>
                <strong>Où :</strong> {event.location || "Lieu non spécifié"}
              </p>
              <p>
                <strong>Catégorie :</strong> {event.source}
              </p>

              {event.link && (
                <p>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0077cc" }}
                  >
                    ➜ Voir
                  </a>
                </p>
              )}

              <details style={{ marginTop: "10px" }}>
                <summary>Description</summary>
                <p style={{ marginTop: "5px" }}>
                  {event.description || "Aucune description disponible."}
                </p>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
