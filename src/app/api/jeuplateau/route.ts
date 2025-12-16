// src/app/api/jeuplateau/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Les trois URLs de flux
const RSS_URLS = {
  Actualites: 'https://jeux-plateau-societe.jeuxonline.info/rss/actualites/rss.xml',
  Critiques: 'https://jeux-plateau-societe.jeuxonline.info/rss/critiques/rss.xml',
  Videos: 'https://jeux-plateau-societe.jeuxonline.info/rss/videos/rss.xml',
};

const parser = new Parser({
    customFields: {
        item: [
            ['dc:creator', 'creator'],
        ],
    },
});

/**
 * Endpoint pour récupérer et fusionner les trois flux RSS de JeuxOnline.
 */
export async function GET() {
  const promises = Object.entries(RSS_URLS).map(async ([category, url]) => {
    try {
      // 1. Appel et parsing de chaque flux
      const feed = await parser.parseURL(url);

      // 2. Formatage des items
      return feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || item.content || '', // Assurez-vous d'avoir un snippet
        creator: item.creator || 'Auteur Inconnu',
        category: category, 
      }));
    } catch (error) {
      // 🟢 Gestion d'erreur locale : Log l'erreur mais permet aux autres flux de continuer
      console.warn(`[JEUXONLINE] Erreur lors du traitement du flux ${category} (${url}):`, error);
      return []; 
    }
  });

  try {
    const results = await Promise.all(promises);
    
    // 4. Aplatir les résultats
    const allItems = results.flat().sort((a, b) => {
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    if (allItems.length === 0) {
       console.warn("Aucun item n'a pu être récupéré de JeuxOnline.");
    }
    
    return NextResponse.json({
      title: "JeuxOnline - Flux Fusionné",
      description: "Actualités, critiques et vidéos de JeuxOnline.",
      items: allItems,
      source: 'JeuxOnline Flux Fusionné',
    });
    
  } catch (error) {
    console.error("Erreur critique lors de la fusion finale des flux RSS:", error);
    return NextResponse.json({
      error: 'Erreur de traitement interne lors de la fusion des flux.',
      details: error instanceof Error ? error.message : 'Problème de connexion général.',
    }, { status: 500 });
  }
}
