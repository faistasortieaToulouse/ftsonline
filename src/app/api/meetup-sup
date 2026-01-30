import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const endpoints = [
      "https://ftstoulouse.vercel.app/api/meetup-events",
      "https://ftstoulouse.vercel.app/api/meetup-expats",
      "https://ftstoulouse.vercel.app/api/meetup-coloc",
      "https://ftstoulouse.vercel.app/api/meetup-sorties",
    ];

    const responses = await Promise.all(
      endpoints.map(ep => fetch(ep).then(res => res.json()).catch(() => ({ events: [] })))
    );

    const all = responses.flatMap(r => r.events || []);

    // 🔥 Exactement la même logique que ta page pour les doublons
    const unique = new Map();
    all.forEach((ev: any) => {
      const key = `${ev.title}-${ev.startDate}`;
      if (!unique.has(key)) unique.set(key, ev);
    });

    return NextResponse.json({ 
      count: unique.size, 
      events: Array.from(unique.values()) 
    });
  } catch (error) {
    return NextResponse.json({ count: 0, events: [] });
  }
}
