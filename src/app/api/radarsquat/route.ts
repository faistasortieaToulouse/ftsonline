// src/app/api/radarsquat/route.ts

import { NextResponse } from "next/server";

// Petit parseur ICS minimaliste
function parseICS(ics: string) {
  const events: any[] = [];
  // Gère les retours à la ligne autour de BEGIN:VEVENT de manière plus robuste
  const blocks = ics.split(/\r?\nBEGIN:VEVENT/i).slice(1);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);

    const get = (prop: string) => {
      // REGEX AMÉLIORÉE: Capture le contenu après le dernier ':' ou ';'
      // ^${prop} : commence par la propriété (ex: DTSTART)
      // (?:;[^:\r\n]*)? : Gère ZÉRO ou PLUS de paramètres (comme ;VALUE=DATE) jusqu'au dernier ':'
      const regex = new RegExp(`^${prop}(?:;[^:\r\n]*)*:([^\r\n]*)$`, "i");
      let value = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(regex);

        if (m) {
          // La valeur est le groupe de capture 1 (tout après le dernier :)
          value = m[1]; 
          
          // Concaténation des lignes repliées (continuation avec espace au début)
          let j = i + 1;
          while (j < lines.length && lines[j].startsWith(" ")) {
            value += lines[j].slice(1);
            j++;
          }
          
          // Dé-échapper les caractères ICS (selon RFC 5545)
          value = value.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
          break;
        }
      }
      return value || null;
    };

    const summary = get("SUMMARY");
    const description = get("DESCRIPTION");
    const location = get("LOCATION");
    const url = get("URL");
    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    const uid = get("UID");

    // Convertir dates (gère formats Zulu YYYYMMDDTHHMMSSZ, YYYYMMDDTHHMMSS et date-only YYYYMMDD)
    const toISO = (s: string | null) => {
      if (!s) return null;
      
      // La regex accepte Z (UTC) ou pas de Z (Local Time/TZID).
      // Nous utiliserons Date.UTC uniquement si Z est présent, sinon nous le laissons comme heure locale.
      const m = s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?(Z)?$/);
      if (!m) return null;
      
      const [_, Y, M, D, h, mi, se, Z] = m;
      
      if (h) {
        // Format YYYYMMDDTHHMMSS
        const dateString = `${Y}-${M}-${D}T${h}:${mi}:${se || '00'}`;
        
        if (Z) {
          // Si 'Z' est présent (UTC), nous l'ajoutons et l'analysons en tant que tel
          return new Date(dateString + 'Z').toISOString();
        } else {
          // Si pas de 'Z', c'est une heure locale (avec TZID ou par défaut)
          // Next.js/Node le traitera comme l'heure locale du serveur (qui est correct ici)
          return new Date(dateString).toISOString();
        }
      } else {
        // Format YYYYMMDD (Date-only)
        // Les événements de jour complet sont mieux gérés comme des dates ISO sans heure (ex: 2025-11-21)
        // Cependant, pour l'affichage, il est plus sûr d'utiliser minuit UTC
        return new Date(Date.UTC(+Y, +M - 1, +D, 0, 0, 0)).toISOString();
      }
    };

    const startISO = toISO(dtstart);
    const endISO = toISO(dtend);

    // Filtrer les événements ayant un titre et une date de début valides
    if (!summary || !startISO || isNaN(new Date(startISO).getTime())) continue;

    events.push({
      id: uid || url || summary,
      source: "Radar Squat Toulouse",
      title: summary,
      description,
      location,
      link: url,
      start: startISO,
      end: endISO,
      image: "/logo/logodemosphere.jpg",
    });
  }

  // Filtrer les événements qui pourraient être dans le passé (la source devrait le faire, mais c'est une sécurité)
  const now = Date.now();
  return events.filter(e => {
      // Garde seulement les événements qui commencent dans le futur ou qui ont commencé mais ne sont pas encore terminés
      if (!e.end) return new Date(e.start!).getTime() >= now;
      return new Date(e.end).getTime() >= now;
  });
}


// EXPORT ASYNC FUNCTION GET()
export async function GET() {
  // ... (le reste de la fonction GET avec le fetch vers l'API externe)
  // Utilisez le code GET de l'étape précédente.
  try {
    const res = await fetch("https://radar.squat.net/fr/events/city/Toulouse/ical", {
      headers: { "Accept": "text/calendar" },
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) {
      const status = res.status;
      return NextResponse.json(
        { error: `Impossible de récupérer le flux ICS (Statut: ${status}).` }, 
        { status: 404 } 
      );
    }

    const ics = await res.text();
    const events = parseICS(ics);

    return NextResponse.json(events);
    
  } catch (error) {
    console.error("Échec de la connexion réseau ou du parsing:", error);
    return NextResponse.json(
      { error: "Échec de la connexion réseau au service externe." }, 
      { status: 500 }
    );
  }
}