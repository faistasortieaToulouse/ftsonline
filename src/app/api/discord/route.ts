import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_EVENT_URL =
  "https://discord.com/channels/1422806103267344416/1423210600036565042";

// Cache mémoire
let cachedData: { widget: any; events: any[]; timestamp: number } | null = null;

// Horaires de rafraîchissement (5h et 17h)
const REFRESH_TIMES = [
  { hour: 5, minute: 0 },
  { hour: 17, minute: 0 },
];

async function fetchDiscordData() {
  const widgetRes = await fetch(
    `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
    { cache: "no-store" }
  );
  const widgetData = widgetRes.ok ? await widgetRes.json() : { members: [], channels: [] };

  const eventsRes = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
    { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }, cache: "no-store" }
  );

  let eventsData: any[] = [];
  if (eventsRes.ok) {
    const rawEvents = await eventsRes.json();
    eventsData = rawEvents.map((e: any) => ({
      id: e.id,
      title: e.name,
      description: e.description,
      date: e.scheduled_start_time,
      endDate: e.scheduled_end_time,
      location: "Discord",
      image: e.image
        ? `https://cdn.discordapp.com/guild-events/${e.id}/${e.image}.png?size=1024`
        : null,
      url: DISCORD_EVENT_URL,
      source: "discord",
    }));
  }

  cachedData = { widget: widgetData, events: eventsData, timestamp: Date.now() };
  return cachedData;
}

function getNextRefreshSeconds() {
  const now = new Date();
  const futureTriggers = REFRESH_TIMES.map((t) => {
    const d = new Date(now);
    d.setHours(t.hour, t.minute, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d;
  }).sort((a, b) => a.getTime() - b.getTime());
  return Math.floor(futureTriggers[0].getTime() - now.getTime()) / 1000;
}

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json({ error: "Configuration Discord manquante." }, { status: 500 });
  }

  try {
    if (!cachedData) await fetchDiscordData();

    const secondsUntilRefresh = getNextRefreshSeconds();

    return NextResponse.json(cachedData, {
      headers: {
        "Cache-Control": `public, s-maxage=${secondsUntilRefresh}, stale-while-revalidate=43200`,
      },
    });
  } catch (err) {
    console.error("Erreur Discord API :", err);
    return NextResponse.json(
      { error: "Impossible de charger les données Discord.", events: [], widget: {} },
      { status: 500 }
    );
  }
}
