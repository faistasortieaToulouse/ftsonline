import { NextResponse } from 'next/server';
import stars from '@/data/constellation/stars.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || "0");

  // Le ciel se décale de 2h d'Ascension Droite (RA) par mois.
  // À minuit, la RA visible est à l'opposé du Soleil.
  const solarRA = (month * 2) % 24;
  const midnightRA = (solarRA + 12) % 24;

  const processedStars = stars.map((s: any) => {
    // Calcul de visibilité : si l'étoile est à +/- 6h de la RA de minuit
    let diff = Math.abs(s.ra - midnightRA);
    if (diff > 12) diff = 24 - diff;
    const isVisible = diff < 7; // Fenêtre de visibilité large

    return {
      ...s,
      visible: isVisible
    };
  });

  return NextResponse.json(processedStars);
}
