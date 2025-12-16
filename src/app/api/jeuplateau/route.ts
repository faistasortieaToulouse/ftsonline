// src/app/api/jeuplateau/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const RSS_FEED_URL = 'https://jeux-plateau-societe.jeuxonline.info/rss/actualites/rss.xml';
const parser = new Parser();

/**
 * Endpoint pour récupérer et parser le flux RSS de JeuxOnline.
 */
export async function GET() {
  try {
    // 1. Appel au flux RSS (fetch est géré par la librairie)
    const feed = await parser.parseURL(RSS_FEED_URL);

    // 2. Retourner les données JSON parsées
    return NextResponse.json({ 
      title: feed.title,
      description: feed.description,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet,
        creator: item.creator
      })),
      source: 'JeuxOnline RSS - Actualités'
    });

  } catch (error) {
    console.error("Erreur lors du parsing du flux RSS JeuxOnline:", error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération ou du parsing du flux RSS.',
      details: error instanceof Error ? error.message : 'Problème de connexion au flux.'
    }, { status: 500 });
  }
}
