/**
 * src/app/api/podcasts/route.ts
 * Route API Next.js pour récupérer et parser les flux RSS des podcasts des librairies.
 */

import { NextResponse } from 'next/server';

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string; // Format ISO
  audioUrl: string; // ✅ renommé pour plus de clarté
  description: string;
}

async function fetchAndParsePodcast(
  librairieName: 'Ombres Blanches' | 'Terra Nova',
  rssUrl: string
): Promise<PodcastEpisode[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (librairieName === 'Ombres Blanches') {
    return [
      {
        librairie: 'Ombres Blanches',
        titre: "Rencontre avec Annie Ernaux - L'Écriture et la Vie",
        date: '2025-11-15T10:00:00Z',
        audioUrl: 'https://example.com/audio/ob_ernaux.mp3',
        description: 'Échange passionnant autour des dernières œuvres de la prix Nobel de Littérature.',
      },
      {
        librairie: 'Ombres Blanches',
        titre: 'Philosophie et IA : le nouvel humanisme',
        date: '2025-11-08T10:00:00Z',
        audioUrl: 'https://example.com/audio/ob_ia_philo.mp3',
        description: "Débat avec des chercheurs sur l'impact de l'intelligence artificielle sur notre société.",
      },
    ];
  }

  if (librairieName === 'Terra Nova') {
    return [
      {
        librairie: 'Terra Nova',
        titre: "La géopolitique du cacao en Afrique de l'Ouest",
        date: '2025-11-22T12:00:00Z',
        audioUrl: 'https://example.com/audio/tn_cacao.mp3',
        description: 'Une analyse des enjeux économiques et sociaux de la filière cacao.',
      },
      {
        librairie: 'Terra Nova',
        titre: 'Histoire des cartes maritimes (XVIe siècle)',
        date: '2025-11-01T12:00:00Z',
        audioUrl: 'https://example.com/audio/tn_cartes.mp3',
        description: 'Immersion dans les cabinets de curiosités et les premiers atlas du monde.',
      },
    ];
  }

  return [];
}

export async function GET() {
  const OmbresBlanchesRSS = 'https://feeds.ausha.co/flux_ombres_blanches_simule';
  const TerraNovaRSS = 'https://vodio.fr/rss/terranova_simule';

  try {
    const [obEpisodes, tnEpisodes] = await Promise.all([
      fetchAndParsePodcast('Ombres Blanches', OmbresBlanchesRSS),
      fetchAndParsePodcast('Terra Nova', TerraNovaRSS),
    ]);

    const allEpisodes = [...obEpisodes, ...tnEpisodes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        data: allEpisodes,
        metadata: {
          totalEpisodes: allEpisodes.length,
          lastUpdated: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des podcasts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors du traitement des flux RSS.',
      },
      { status: 500 }
    );
  }
}
