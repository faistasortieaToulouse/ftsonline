// src/app/api/philibertnet/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Le flux Philibert est souvent moins standard que les flux d'actualités pures
const RSS_FEED_URL = 'https://www.philibertnet.com/fr/content/12-flux-rss';
// 🟢 MODIFICATION : Initialisation du parser avec des options
const parser = new Parser({
    // Permet de désactiver le contrôle strict du DTD/DOCTYPE, ce qui peut aider
    // pour les flux mal formés sans casser complètement l'application.
    // L'option n'est pas directement disponible dans rss-parser, mais nous
    // pouvons ajuster les headers ou le mode de parsing si d'autres librairies étaient utilisées.
    // Pour l'instant, on maintient l'initialisation standard.
});

// Solution plus simple pour ce cas : nous allons capturer le texte XML brut
// et tenter d'utiliser une option de parsing si elle existait.
// Malheureusement, rss-parser ne gère pas nativement l'ignorance des erreurs XML.

/**
 * Endpoint pour récupérer et parser le flux RSS de Philibert.
 */
export async function GET() {
  try {
    // 1. Appel au flux RSS (fetch est géré par la librairie)
    // Nous utilisons un fetch direct pour capturer l'erreur au niveau XML si possible.
    // Cependant, le parseURL de rss-parser est le meilleur moyen.
    
    const feed = await parser.parseURL(RSS_FEED_URL);

    // ... le retour JSON (inchangé) ...
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
    // 🔴 Si l'erreur persiste, c'est que le flux est vraiment non standard
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération ou du parsing du flux RSS Philibert.',
      details: error instanceof Error ? `Le flux est mal formé (Erreur XML: ${error.message.split('\n')[0]})` : 'Problème de connexion au flux.'
    }, { status: 500 });
  }
}
