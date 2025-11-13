"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import CalendarView from "@/components/CalendarView";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import type { Event } from "@/lib/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Erreur réseau lors du chargement des événements");
        const data: Event[] = await res.json();
        setEvents(data);
      } catch (err: any) {
        console.error("Erreur lors du fetch des événements :", err);
        setError("Impossible de charger les événements pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Lien retour accueil */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          {/* Titre */}
          <div className="flex items-center gap-4 mb-8">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
              Calendrier des événements
            </h1>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des événements...</p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-6 rounded-lg border border-red-400 bg-red-100 text-red-800 text-center">
              {error}
            </div>
          )}

          {/* Calendrier */}
          {!loading && !error && <CalendarView events={events} />}
        </div>
      </main>
    </div>
  );
}
