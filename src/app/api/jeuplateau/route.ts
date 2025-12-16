// src/app/api/jeuplateau/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Les trois URLs de flux
const RSS_URLS = {
  actualites: 'https://jeux-plateau-societe.jeuxonline.info/rss/actualites/rss.xml',
  critiques: 'https://jeux-plateau-societe.jeuxonline.info/rss/critiques/rss.xml',
  videos: 'https://jeux-plateau-societe.jeuxonline.info/rss/videos/rss.xml',
};

const parser = new Parser();

/**
 * Endpoint pour récupérer et fusionner les trois flux RSS de JeuxOnline.
 */
export async function GET() {
  try {
    const promises = Object.entries(RSS_URLS).map(async ([category, url]) => {
      // 1. Appel et parsing de chaque flux
      const feed = await parser.parseURL(url);

      // 2. Formatage des items et ajout de la catégorie (Actualités, Critiques, Vidéos)
      return feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet,
        creator: item.creator,
        
        // 🚨 CORRECTION CRUCIALE pour l'extraction d'images dans page.tsx
        content: item.content || item.contentEncoded, 
        
        // 🟢 Ajout de la catégorie pour le filtrage
        category: category.charAt(0).toUpperCase() + category.slice(1), 
      }));
    });

    // 3. Attendre la résolution de toutes les promesses et aplatir les résultats
    const results = await Promise.all(promises);
    const allItems = results.flat().sort((a, b) => {
        // Trier par date du plus récent au plus ancien
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // 4. Retourner les données fusionnées
    return NextResponse.json({
      title: "JeuxOnline - Flux Fusionné",
      description: "Actualités, critiques et vidéos de JeuxOnline.",
      items: allItems,
      source: 'JeuxOnline Flux Fusionné',
    });

  } catch (error) {
    console.error("Erreur lors du parsing d'un des flux RSS JeuxOnline:", error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération ou du parsing des flux RSS JeuxOnline.',
      details: error instanceof Error ? error.message : 'Problème de connexion à un des flux.',
    }, { status: 500 });
  }
}
