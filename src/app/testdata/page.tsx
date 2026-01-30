import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    // 1. On appelle tes 4 agrégateurs
    const [resAge, resMeet, resCin, resJeux] = await Promise.allSettled([
      fetch(`${origin}/api/agendatoulousain`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/meetup-full`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/cinematoulouse`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/trictracphilibert`, { cache: 'no-store' }).then(r => r.json()),
    ]);

    // 2. Extraction sécurisée des nombres
    const agendaCount = resAge.status === 'fulfilled' ? (resAge.value.events?.length || 0) : 0;
    const meetupCount = resMeet.status === 'fulfilled' ? (resMeet.value.events?.length || 0) : 0;
    const cinemaCount = resCin.status === 'fulfilled' ? (resCin.value.results?.length || 0) : 0;
    const jeuxCount   = resJeux.status === 'fulfilled' ? (resJeux.value.count || 0) : 0;

    // 3. Réponse au format attendu par ton TestDataPage
    return NextResponse.json({
      totalRessources: agendaCount + meetupCount + cinemaCount + jeuxCount,
      agenda: agendaCount,
      meetup: meetupCount,
      cinema: cinemaCount,
      jeux: jeuxCount,
      status: "success"
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du calcul" }, { status: 500 });
  }
}
