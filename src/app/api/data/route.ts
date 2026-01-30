import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // Fonction utilitaire pour fetcher sans crash
  const safeFetch = async (endpoint: string) => {
    try {
      const r = await fetch(`${origin}${endpoint}`, { cache: 'no-store' });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  };

  try {
    const [dAgenda, dMeetup, dCinema, dJeux] = await Promise.all([
      safeFetch('/api/agendatoulousain'),
      safeFetch('/api/meetup-full'),
      safeFetch('/api/cinematoulouse'),
      safeFetch('/api/trictracphilibert')
    ]);

    // Extraction robuste
    const counts = {
      agenda: dAgenda?.events?.length || 0,
      meetup: dMeetup?.events?.length || 0,
      cinema: dCinema?.results?.length || 0,
      jeux: dJeux?.count || 0
    };

    return NextResponse.json(counts);
  } catch (error) {
    return NextResponse.json({ agenda: 0, meetup: 0, cinema: 0, jeux: 0 });
  }
}
