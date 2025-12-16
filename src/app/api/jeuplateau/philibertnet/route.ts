// src/app/api/philibertnet/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Le flux Philibert est souvent moins standard que les flux d'actualités pures
const RSS_FEED_URL = 'https://www.philibertnet.com/fr/content/12-flux-rss';
const parser = new Parser();

/**
 * Endpoint pour récupérer et parser le flux RSS de Philibert.
 */
export async function GET() {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);

    return NextResponse.json({ 
      title: feed.title,
      description: feed.description,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || item.content, // Utiliser content si snippet est vide
      })),
      source: 'Philibertnet RSS - Mises à Jour Boutique/Contenu'
    });

  } catch (error) {
    console.error("Erreur lors du parsing du flux RSS Philibert:", error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération ou du parsing du flux RSS Philibert.',
      details: error instanceof Error ? error.message : 'Problème de connexion au flux.'
    }, { status: 500 });
  }
}
