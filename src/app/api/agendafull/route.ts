import { NextRequest, NextResponse } from "next/server";
import { getMeetupEvents } from "@/lib/meetup";
import { getEvents as getOpenDataEvents } from "@/lib/events"; // ton fetch OpenData + French Tech
import { PLACEHOLDER_IMAGE } from "@/lib/agendaToulouse"; // optionnel

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  try {
    // 🔹 1️⃣ Meetup
    const meetupEventsRaw = await getMeetupEvents(origin);

    const meetupEvents = meetupEventsRaw.map(ev => ({
      id: ev.id || ev.title + '-' + ev.date,
      title: ev.title || 'Événement',
      description: ev.description || '',
      date: ev.date || new Date().toISOString(),
      location: ev.location || ev.fullAddress || '',
      image: ev.image || PLACEHOLDER_IMAGE,
      url: ev.url || ev.link || '',
      source: 'meetup',
    }));

    // 🔹 2️⃣ OpenData / RSS
    const openDataEvents = await getOpenDataEvents();

    // 🔹 3️⃣ Fusionner
    const all = [...meetupEvents, ...openDataEvents];

    // 🔹 4️⃣ Filtrage sur next 31 jours
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 31);

    const filtered = all.filter(ev => {
      const d = new Date(ev.date);
      return d >= today && d <= limit;
    });

    // 🔹 5️⃣ Déduplication
    const uniqMap = new Map<string, typeof filtered[0]>();
    filtered.forEach(ev => {
      const key = `${ev.title}-${ev.date}`;
      if (!uniqMap.has(key)) uniqMap.set(key, ev);
    });

    const finalEvents = Array.from(uniqMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ total: finalEvents.length, events: finalEvents });
  } catch (err: any) {
    console.error("Erreur agendafull:", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'agrégation" },
      { status: 500 }
    );
  }
}
