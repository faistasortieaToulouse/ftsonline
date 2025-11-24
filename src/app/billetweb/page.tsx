"use client";

import React, { useState, useEffect } from "react";

type BilletwebEvent = {
  id: string;
  name: string;
  start: string;
  end?: string;
  place?: string;
  shop?: string;
  description?: string;
  image?: string;
  cover?: string;
};

export default function BilletwebPage() {
  const [events, setEvents] = useState<BilletwebEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<BilletwebEvent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Utilitaire pour normaliser les textes (supprimer accents)
  function normalize(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // 🔖 Catégorie automatique
  function detectCategory(event: BilletwebEvent) {
    const t = normalize(
      `${event.name} ${event.description || ""} ${event.place || ""}`
    );

    if (t.includes("concert")) return "Concert";
    if (t.includes("festival")) return "Festival";
    if (t.includes("theatre") || t.includes("théâtre")) return "Théâtre";
    if (t.includes("exposition") || t.includes("expo")) return "Exposition";
    if (t.includes("conference")) return "Conférence";
    if (t.includes("salon")) return "Salon";
    return "Autre";
  }

  // 🔄 Chargement des événements
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/billetweb");
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API Billetweb");
          setEvents([]);
          setFilteredEvents([]);
        } else {
          setEvents(data.events || []);
          setFilteredEvents(data.events || []);
        }
      } catch (err) {
        console.error("Erreur chargement Billetweb", err);
        setError("Impossible de charger les évènements Billetweb.");
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  // 🔍 Filtrage dynamique selon recherche
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }

    const q = normalize(search);

    const res = events.filter((ev) => {
      const text = normalize(
        `
        ${ev.name}
        ${ev.description || ""}
        ${ev.place || ""}
        ${ev.start || ""}
        ${ev.end || ""}
        ${detectCategory(ev)}
      `
      );

      return text.includes(q);
    });

    setFilteredEvents(res);
  }, [search, events]);

  return (
    <div style={{ padding: "1rem 2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Évènements Billetweb (Haute-Garonne)
      </h1>

      {/* 🔍 Barre de recherche */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par date, titre, description, lieu, catégorie…"
        style={{
          width: "100%",
          padding: "0.7rem",
          marginBottom: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />

      {/* 🔢 Compteur d'évènements */}
      <p style={{ color: "#555", marginBottom: "1rem" }}>
        {filteredEvents.length} évènement(s) trouvé(s)
      </p>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : filteredEvents.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul>
          {filteredEvents.map((event) => (
            <li
              key={event.id}
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <h2 style={{ marginBottom: "0.3rem" }}>{event.name}</h2>

              {/* Catégorie auto */}
              <p style={{ fontStyle: "italic", color: "#888" }}>
                Catégorie : {detectCategory(event)}
              </p>

              <p>
                Début :{" "}
                {new Date(event.start).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>

              {event.end && (
                <p>
                  Fin :{" "}
                  {new Date(event.end).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              )}

              {event.place && <p>Lieu : {event.place}</p>}

              {event.description && <p>{event.description}</p>}

              {event.shop && (
                <p>
                  <a
                    href={event.shop}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Billetterie →
                  </a>
                </p>
              )}

              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  style={{ maxWidth: "300px", marginTop: "0.5rem" }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
