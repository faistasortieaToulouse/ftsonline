import { NextResponse } from "next/server";

const ICS_URL = "https://www.comdt.org/events/feed/?post_type=tribe_events";

// Interface pour typer les événements ICS
interface IcsEvent {
  uid?: string;
  summary?: string;
  dtstart?: string;
  dtend?: string;
  description?: string;
  location?: string;
  url?: string;
  [key: string]: string | undefined; // fallback pour d'autres propriétés ICS
}

// Fonction utilitaire pour extraire la valeur ICS
function extractIcsValue(line: string): string {
  const match = line.match(/^[^:]*:(.*)$/);
  return match
    ? match[1]
        .trim()
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\n/g, "\n")
    : "";
}

// Parseur ICS → tableau d'événements typés
function parseIcs(icsContent: string): IcsEvent[] {
  const lines = icsContent.split(/\r?\n/);
  const events: IcsEvent[] = [];
  let currentEvent: IcsEvent | null = null;
  let inEvent = false;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      currentEvent = {};
    } else if (line.startsWith("END:VEVENT")) {
      inEvent = false;
      if (currentEvent) events.push(currentEvent);
      currentEvent = null;
    } else if (inEvent) {
      if (line.startsWith(" ") || line.startsWith("\t")) {
        const lastKey = Object.keys(currentEvent!).pop();
        if (lastKey) currentEvent![lastKey] += line.trim();
        continue;
      }
      const parts = line.split(":");
      if (parts.length > 1) {
        const key = parts[0].split(";")[0].toLowerCase();
        const value = extractIcsValue(line);
        currentEvent![key] = value;
      }
    }
  }
  return events;
}

// Handler API
export async function GET() {
  try {
    const res = await fetch(ICS_URL, {
      headers: { "Accept": "text/calendar" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ICS fetch failed with status ${res.status}` },
        { status: 502 }
      );
    }

    const icsContent = await res.text();
    const eventsArray = parseIcs(icsContent);

    return NextResponse.json({ records: eventsArray });
  } catch (err) {
    console.error("ICS API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error during ICS processing" },
      { status: 500 }
    );
  }
}
