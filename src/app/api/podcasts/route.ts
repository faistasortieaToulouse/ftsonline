/**
 * src/app/api/podcasts/route.ts
 * Route API Next.js pour récupérer et parser les flux RSS des podcasts des librairies.
 * * Cette route simule la récupération et le parsing de deux flux RSS externes
 * (Ombres Blanches et Terra Nova) pour les agréger en une seule réponse JSON.
 * * NOTE: Dans un environnement réel Next.js, vous utiliseriez des bibliothèques
 * comme 'xml2js' ou 'rss-parser' pour traiter le XML. Ici, nous simulons cette
 * logique.
 */

import { NextResponse } from 'next/server';

// Interface pour le format de données standardisé après parsing
interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string; // Format ISO
  lienAudio: string;
  description: string;
}

// Fonction utilitaire pour simuler le parsing d'un flux RSS XML
// Dans une application Next.js réelle, cette fonction ferait un fetch du flux
// et utiliserait une bibliothèque de parsing XML.
async function fetchAndParsePodcast(
  librairieName: 'Ombres Blanches' | 'Terra Nova', 
  rssUrl: string
): Promise<PodcastEpisode[]> {
  // Simuler le délai réseau
  await new Promise(resolve => setTimeout(resolve, 500)); 

  // Données simulées pour éviter les dépendances externes de parsing XML dans cet environnement
  if (librairieName === 'Ombres Blanches') {
    return [
      {
        librairie: 'Ombres Blanches',
        titre: 'Rencontre avec Annie Ernaux - L\'Écriture et la Vie',
        date: '2025-11-15T10:00:00Z',
        lienAudio: 'https://example.com/audio/ob_ernaux.mp3',
        description: 'Échange passionnant autour des dernières œuvres de la prix Nobel de Littérature.',
      },
      {
        librairie: 'Ombres Blanches',
        titre: 'Philosophie et IA : le nouvel humanisme',
        date: '2025-11-08T10:00:00Z',
        lienAudio: 'https://example.com/audio/ob_ia_philo.mp3',
        description: 'Débat avec des chercheurs sur l\'impact de l\'intelligence artificielle sur notre société.',
      },
    ];
  }

  if (librairieName === 'Terra Nova') {
    return [
      {
        librairie: 'Terra Nova',
        titre: 'La géopolitique du cacao en Afrique de l\'Ouest',
        date: '2025-11-22T12:00:00Z',
        lienAudio: 'https://example.com/audio/tn_cacao.mp3',
        description: 'Une analyse des enjeux économiques et sociaux de la filière cacao.',
      },
      {
        librairie: 'Terra Nova',
        titre: 'Histoire des cartes maritimes (XVIe siècle)',
        date: '2025-11-01T12:00:00Z',
        lienAudio: 'https://example.com/audio/tn_cartes.mp3',
        description: 'Immersion dans les cabinets de curiosités et les premiers atlas du monde.',
      },
    ];
  }

  return [];
}

/**
 * Gestionnaire de la requête GET pour la route /api/podcasts
 * @returns {Promise<NextResponse>} La réponse JSON contenant les épisodes de podcast agrégés.
 */
export async function GET() {
  const OmbresBlanchesRSS = 'https://feeds.ausha.co/flux_ombres_blanches_simule'; // Remplacer par l'URL réelle
  const TerraNovaRSS = 'https://vodio.fr/rss/terranova_simule'; // Remplacer par l'URL réelle

  try {
    // Récupérer et parser les flux en parallèle
    const [obEpisodes, tnEpisodes] = await Promise.all([
      fetchAndParsePodcast('Ombres Blanches', OmbresBlanchesRSS),
      fetchAndParsePodcast('Terra Nova', TerraNovaRSS),
    ]);

    // Agréger et trier tous les épisodes par date (du plus récent au plus ancien)
    const allEpisodes = [...obEpisodes, ...tnEpisodes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ 
      success: true, 
      data: allEpisodes,
      metadata: {
        totalEpisodes: allEpisodes.length,
        lastUpdated: new Date().toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération des podcasts:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur lors du traitement des flux RSS.' 
    }, { status: 500 });
  }
}
