// src/app/api/podmat/route.ts

import RssParser from 'rss-parser';
import { NextResponse } from 'next/server';

// Définition de l'URL du flux RSS
const PODCAST_FEED_URL = 'https://feed.ausha.co/BnYn5Uw5W3WO';

// Configuration du parser
const parser = new RssParser({
  // Ces options sont utiles si vous devez mapper des champs spécifiques au podcast
  // Exemple: customFields: { item: ['itunes:duration', 'itunes:image'] }
});

// Définition d'une interface pour les données que nous allons renvoyer
// Cela aide à la typage strict
interface PodcastItem {
  title: string | undefined;
  link: string | undefined;
  pubDate: string | undefined;
  content: string | undefined;
  enclosureUrl: string | undefined; // L'URL du fichier audio
}

// Fonction asynchrone GET pour gérer la requête
export async function GET() {
  try {
    // 1. Récupération et analyse du flux RSS
    const feed = await parser.parseURL(PODCAST_FEED_URL);

    // 2. Extraction des informations pertinentes
    const podcastItems: PodcastItem[] = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content, // La description du podcast
      enclosureUrl: item.enclosure?.url, // Récupère l'URL du fichier audio s'il existe
    }));

    // 3. Retourner la réponse JSON
    return NextResponse.json({
      channelTitle: feed.title,
      description: feed.description,
      items: podcastItems,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du flux RSS:', error);
    // Retourner une réponse d'erreur 500
    return new NextResponse(
      JSON.stringify({ message: 'Erreur lors du chargement des podcasts' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
