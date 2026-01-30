import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Limite Vercel à 30s

export async function GET(request: NextRequest) {
  // On récupère l'URL de base dynamiquement
  const origin = request.nextUrl.origin;

  try {
    // Configuration d'un timeout de 8 secondes par appel pour éviter le crash global
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchOptions = { 
      signal: controller.signal,
      cache: 'no-store' as RequestCache 
    };

    // On lance les appels
    const [resAge, resMeet, resCin, resJeux] = await Promise.allSettled([
      fetch(`${origin}/api/agendatoulousain`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/meetup-full`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/cinematoulouse`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/trictracphilibert`, fetchOptions).then(r => r.json()),
    ]);

    clearTimeout(timeoutId);

    // Extraction sécurisée (si une API a planté, on met 0 au lieu de crash)
    const agendaCount = resAge.status === 'fulfilled' ? (resAge.value.events?.length || 0) : 0;
    const meetupCount = resMeet.status === 'fulfilled' ? (resMeet.value.events?.length || 0) : 0;
    const cinemaCount = resCin.status === 'fulfilled' ? (resCin.value.results?.length || 0) : 0;
    const jeuxCount   = resJeux.status === 'fulfilled' ? (resJeux.value.count || 0) : 0;

    return NextResponse.json({
      totalRessources: agendaCount + meetupCount + cinemaCount + jeuxCount,
      agenda: agendaCount,
      meetup: meetupCount,
      cinema: cinemaCount,
      jeux: jeuxCount
    });

  } catch (error) {
    console.error("Digest Error Prevention:", error);
    return NextResponse.json({ totalRessources: 0, error: "Délai dépassé" }, { status: 200 });
  }
}
