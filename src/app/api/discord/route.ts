import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

export async function GET() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) {
    return NextResponse.json(
      { error: 'Configuration Discord manquante.' },
      { status: 500 }
    );
  }

  try {
    // --- WIDGET PUBLIC
    const widgetRes = await fetch(
      `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
      { cache: 'no-store' }
    );

    let widgetData = { members: [], channels: [] };

    try {
      widgetData = widgetRes.ok ? await widgetRes.json() : widgetData;
    } catch {
      console.error("⚠️ Le widget n'a pas renvoyé du JSON valide.");
    }

    // --- EVENTS PRIVÉS (nécessite BOT TOKEN)
    const eventsRes = await fetch(
      ``https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true``,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    let eventsData = [];
    try {
      eventsData = eventsRes.ok ? await eventsRes.json() : [];
    } catch {
      console.error("⚠️ Les events n'ont pas renvoyé du JSON valide.");
    }

    // --- RENVOI FINAL TOUJOURS JSON
    return NextResponse.json(
      {
        widget: widgetData,
        events: eventsData,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('❌ Erreur Discord API :', err);
    return NextResponse.json(
      { error: 'Impossible de charger les données Discord.' },
      { status: 500 }
    );
  }
}
