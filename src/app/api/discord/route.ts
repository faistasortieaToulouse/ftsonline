// File: src/app/api/discord/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

// Cache en mémoire (serverless-friendly, réinitialisé entre déploiements)
let cachedData: { widget: any; events: any[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 secondes

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json(
      { error: "Configuration Discord manquante." },
      { status: 500 }
    );
  }

  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    // --- Widget public ---
    const widgetRes = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
      { cache: "no-store" }
    );
    const widgetData = widgetRes.ok ? await widgetRes.json() : { members: [], channels: [] };

    // --- Événements ---
    const eventsRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
        cache: "no-store",
      }
    );

    let eventsData: any[] = [];
    if (eventsRes.status === 429) {
      const rateLimitBody = await eventsRes.json();
      console.warn(`Rate limit hit, retry after ${rateLimitBody.retry_after}s`);
      eventsData = [];
    } else if (eventsRes.ok) {
      const rawEvents = await eventsRes.json();

      // Transformation pour ajouter `image` et `url` pour chaque événement
      eventsData = rawEvents.map((e: any) => {
        let coverImage: string | null = null;

        if (e.image) {
          // Discord fournit `image` sous forme de hash, il faut construire l'URL
          const type = e.entity_type === 1 ? "guild_scheduled_event" : "guild_scheduled_event"; // type fixe
          coverImage = `https://cdn.discordapp.com/guild-events/${e.id}/${e.image}.png`;
        }

        return {
          id: e.id,
          name: e.name,
          description: e.description,
          scheduled_start_time: e.scheduled_start_time,
          scheduled_end_time: e.scheduled_end_time,
          entity_type: e.entity_type,
          image: coverImage,
          url: `https://discord.com/channels/${DISCORD_GUILD_ID}/${e.id}`, // lien direct vers l'événement
        };
      });
    }

    cachedData = { widget: widgetData, events: eventsData, timestamp: now };
    return NextResponse.json(cachedData, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Erreur Discord API :", err);
    return NextResponse.json(
      { error: "Impossible de charger les données Discord.", events: [], widget: {} },
      { status: 500 }
    );
  }
}
