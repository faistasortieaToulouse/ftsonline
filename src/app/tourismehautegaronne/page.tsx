'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Mappage thématique → image
const THEME_IMAGES: Record<string, string> = {
  "Culture": "/images/tourismehg31/themeculture.jpg",
  "Education / Formation / Métiers / Emploi": "/images/tourismehg31/themeeducation.jpg",
  "Autres": "/images/tourismehg31/themeautres.jpg",
  "Sport": "/images/tourismehg31/themesport.jpg",
  "Environnement": "/images/tourismehg31/themeenvironnement.jpg",
  "Économie / vie des entreprises": "/images/tourismehg31/themeentreprises.jpg",
  "Vides Grenier / Brocantes / Foires et salons": "/images/tourismehg31/themebrocantes.jpg",
  "Culture scientifique": "/images/tourismehg31/themesciences.jpg",
  "Agritourisme": "/images/tourismehg31/themeagritourisme.jpg",
};

// Placeholder générique si la thématique n’est pas reconnue
const DEFAULT_IMAGE = "/images/tourismehg31/placeholder.jpg";
const PAGE_LIMIT = 100;

interface Event {
  titre: string;
  description: string;
  date_debut: string;
  date_fin?: string;
  commune?: string;
  adresse?: string;
  url?: string;
  code_insee?: string; // pour filtrer Haute-Garonne
  thematique?: string;
}

export default function TourismeHGPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchUpcomingEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch('/api/tourismehautegaronne');
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data.events || data.events.length === 0) {
        setEvents([]);
        return;
      }

      // Normaliser la date au début de la journée
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 31);
      maxDate.setHours(23, 59, 59, 999);

      const mapped = data.events
        .filter((ev: Event) => ev.code_insee && ev.code_insee.startsWith("31"))
        .map((ev: Event, index: number) => {
          const date = ev.date_debut ? new Date(ev.date_debut) : null;
          if (!ev.titre || !ev.description || !date || isNaN(date.getTime())) return null;
          if (date < today || date > maxDate) return null;

          // Nettoyer la thématique pour correspondre exactement aux clés du mapping
          const themeKey = ev.thematique?.trim().replace(/\s+/g, ' ') || "Autres";
          const image = THEME_IMAGES[themeKey] || DEFAULT_IMAGE;

          return {
            id: `${ev.titre}-${ev.date_debut}-${ev.commune || ''}-${index}`,
            title: ev.titre,
            description: ev.description,
            date,
            dateFormatted: date.toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            commune: ev.commune || "",
            fullAddress: [ev.adresse, ev.commune].filter(Boolean).join(", "),
            image,
            url: ev.url || null,
            thematique: themeKey,
            source: "Agenda participatif Occitanie",
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.date.getTime() - b.date.getTime()) // tri chronologique
        .slice(0, PAGE_LIMIT);

      setEvents(mapped);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements en Haute-Garonne</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les événements à venir dans les 31 prochains jours pour la Haute-Garonne (31) depuis le dataset OpenData de la Région Occitanie.
      </p>

      <Button onClick={fetchUpcomingEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Charger les événements"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <img
                src={event.image}
                alt={event.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">{event.description}</p>
                <p className="text-sm font-medium mb-1">{event.dateFormatted}</p>
                <p className="text-sm text-muted-foreground mb-1">{event.fullAddress}</p>
                <p className="text-xs text-muted-foreground italic mb-3">Thématique : {event.thematique}</p>
                <p className="text-xs text-muted-foreground italic mb-3">Source : {event.source}</p>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition"
                  >
                    🔗 Voir l’événement officiel
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">
          {loading ? "Chargement des événements..." : "Aucun événement à venir dans les 31 prochains jours pour la Haute-Garonne."}
        </p>
      )}
    </div>
  );
}
