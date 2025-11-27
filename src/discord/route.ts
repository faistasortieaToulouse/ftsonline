// File: app/api/discord/route.ts
import { NextResponse } from "next/server";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: "Missing DISCORD env variables" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const events = await res.json();
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// File: app/discord/page.tsx
"use client";

import { useEffect, useState } from "react";

type DiscordEvent = {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  entity_type: number;
};

export default function DiscordEventsPage() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/discord");
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
        } else {
          setError(data.error || "Erreur inconnue");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Chargement des évènements...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Évènements Discord</h1>
      {events.length === 0 && <p>Aucun évènement.</p>}
      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="border p-4 rounded-xl">
            <h2 className="text-xl font-semibold">{ev.name}</h2>
            {ev.description && <p className="text-sm mt-1">{ev.description}</p>}
            <p className="text-sm mt-2">
              Début : {new Date(ev.scheduled_start_time).toLocaleString()}
            </p>
            {ev.scheduled_end_time && (
              <p className="text-sm">Fin : {new Date(ev.scheduled_end_time).toLocaleString()}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
