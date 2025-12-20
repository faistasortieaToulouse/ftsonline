// src/lib/fetchAgendaToulousain.ts
import { decode } from "he";

export type UnifiedEvent = {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  link?: string;
  fullAddress?: string;
  image?: string;
  source?: string;
};

const PLACEHOLDER_IMAGE = "/images/default-event.jpg";

const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

export async function fetchAgendaToulousain(): Promise<UnifiedEvent[]> {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const EXTERNAL_SOURCES = [
    { url: `${origin}/api/agendaculturel`, source: "Agenda Culturel" },
    { url: `${origin}/api/capitole-min`, source: "Université Toulouse Capitole" },
    { url: `${origin}/api/cinematoulouse`, source: "Sorties cinéma" },
    { url: `${origin}/api/agenda-trad-haute-garonne`, source: "Agenda Trad Haute-Garonne" },
  ];

  const results = await Promise.all(EXTERNAL_SOURCES.map(async ({ url, source }) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      const items = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return items.map((ev: any) => {
        let d = new Date(ev.date || ev.start || ev.startDate || Date.now());
        if (isNaN(d.getTime())) d = new Date();

        let image = ev.image || PLACEHOLDER_IMAGE;
        if (!ev.image && ev.source?.toLowerCase().includes("capitole")) {
          image = getCapitoleImage(ev.title);
        }

        let description = ev.description ? decode(ev.description) : "";
        description = description.replace(/<(?!\/?(p|br|strong|em|a)\b)[^>]*>/gi, "").trim();

        return {
          id: ev.id || `${ev.title}-${d.toISOString()}-${source}`,
          title: ev.title || ev.name || "Événement",
          description,
          date: d.toISOString(),
          link: ev.link || ev.url || "#",
          fullAddress: ev.fullAddress || ev.location || "Lieu non précisé",
          image,
          source,
        };
      });
    } catch {
      return [];
    }
  }));

  // Supprimer doublons
  const uniq = new Map<string, UnifiedEvent>();
  results.flat().forEach(ev => {
    if (!uniq.has(ev.id!)) uniq.set(ev.id!, ev);
  });

  // Trier par date
  return Array.from(uniq.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
