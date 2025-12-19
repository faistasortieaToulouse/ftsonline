import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_EVENT_URL = "https://discord.com/channels/1422806103267344416/1423210600036565042";

let cachedData: { widget: any; events: any[]; timestamp: number } | null = null;

async function fetchDiscordData() {
  // 1. Fetch Widget
  const widgetRes = await fetch(
    `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
    { cache: "no-store" }
  );
  const widgetData = widgetRes.ok ? await widgetRes.json() : { members: [], channels: [] };

  // 2. Fetch Events
  const eventsRes = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
    { 
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }, 
      cache: "no-store" 
    }
  );

  let eventsData: any[] = [];
  if (eventsRes.ok) {
    const rawEvents = await eventsRes.json();
    eventsData = rawEvents.map((e: any) => {
      const dateObj = new Date(e.scheduled_start_time);
      
      // Nettoyage de la description (on coupe avant les liens de spam si présents)
      let cleanDescription = e.description || "";
      if (cleanDescription.includes("---")) {
        cleanDescription = cleanDescription.split("---")[0].trim();
      }

      return {
        id: e.id,
        title: e.name,
        description: cleanDescription,
        date: e.scheduled_start_time, // ISO pour le tri
        dateFormatted: !isNaN(dateObj.getTime())
          ? dateObj.toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date à venir",
        location: e.entity_metadata?.location || "Toulouse",
        fullAddress: e.entity_metadata?.location || "Serveur Discord",
        image: e.image
          ? `https://cdn.discordapp.com/guild-events/${e.id}/${e.image}.png?size=1024`
          : "/logo/discord-bg.png", // Assurez-vous d'avoir une image par défaut
        url: DISCORD_EVENT_URL,
        source: "Discord",
      };
    });
  }

  cachedData = { widget: widgetData, events: eventsData, timestamp: Date.now() };
  return cachedData;
}

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  try {
    // On rafraîchit les données
    const data = await fetchDiscordData();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur API", events: [] }, { status: 500 });
  }
}
