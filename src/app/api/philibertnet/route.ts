// src/app/api/philibertnet/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const RSS_FEED_URL = 'https://www.philibertnet.com/fr/content/12-flux-rss';
const parser = new Parser();

/**
 * Endpoint pour récupérer et parser le flux RSS de Philibert.
 */
export async function GET() {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);

    // Si le parsing réussit de manière inattendue, renvoyer les données
    return NextResponse.json({ 
      title: feed.title,
      description: feed.description,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || item.content,
      })),
      source: 'Philibertnet RSS - Mises à Jour Boutique/Contenu'
    });

  } catch (error) {
    console.error("Erreur lors du parsing du flux RSS Philibert:", error);
    
    // 🟢 AMÉLIORATION DE LA GESTION D'ERREUR
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue.';

    // Vérifie si l'erreur est bien l'erreur XML de parsing
    if (errorMessage.includes('Invalid character in entity name')) {
      return NextResponse.json({ 
        error: 'Erreur de Parsing XML',
        details: 'Le flux RSS de Philibert est actuellement mal formé (contient des caractères XML invalides). Veuillez réessayer plus tard ou contacter Philibert.',
        source: 'Philibertnet RSS'
      }, { status: 500 });
    }

    // Gère toutes les autres erreurs
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération ou du parsing du flux RSS Philibert.',
      details: errorMessage.split('\n')[0],
      source: 'Philibertnet RSS'
    }, { status: 500 });
  }
}
