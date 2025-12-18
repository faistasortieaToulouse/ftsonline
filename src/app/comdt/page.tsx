// src/app/comdt/page.tsx
import React from "react";
import { headers } from "next/headers";
import EventSearch from "./EventSearch";

export const dynamic = "force-dynamic";

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

async function getEvents(): Promise<EventItem[]> {
  try {
    const host = headers().get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/comdt`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();

    // ✅ Normalisation des champs
    return Array.isArray(data.records)
      ? data.records.map((ev: any) => ({
          id: ev.uid || ev.id || ev.link || Math.random().toString(),
          source: "COMDT",
          title: ev.summary || ev.title || "Événement COMDT",
          description: ev.description || null,
          location: ev.location || null,
          link: ev.url || ev.link || "#",
          start: ev.dtstart || ev.date || null,
          end: ev.dtend || null,
          image: ev.attach || ev.image || null,
        }))
      : [];
  } catch (err) {
    console.error("Erreur fetch COMDT:", err);
    return [];
  }
}

export default async function ComdtPage() {
  const events = await getEvents();

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        🎶 Agenda du COMDT (Centre des Musiques et Danses Traditionnelles)
      </h1>

      <EventSearch events={events} />
    </main>
  );
}
