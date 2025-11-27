import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

type DiscordEvent = {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  image?: string;
  entity_type: number;
};

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json(
      { error: "Configuration Discord manquante" },
      { status: 500 }
    );
  }

  try {
    // --- Scheduled events depuis Discord API v10 ---
    const eventsRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!eventsRes.ok) {
      console.error("Erreur Discord API:", await eventsRes.text());
      return NextResponse.json({ events: [] });
    }

    const rawEvents = await eventsRes.json();

    // --- Normalisation pour le frontend ---
    const events: DiscordEvent[] = rawEvents.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? undefined,
      scheduled_start_time: e.scheduled_start_time,
      scheduled_end_time: e.scheduled_end_time ?? undefined,
      image: e.entity_metadata?.image ?? undefined,
      entity_type: e.entity_type,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Erreur Discord API:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
