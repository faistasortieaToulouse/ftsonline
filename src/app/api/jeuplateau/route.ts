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

// Fonction pour ajouter un timeout à la requête fetch
async function fetchWithTimeout(resource: string, options = { timeout: 10000 }) {
    const { timeout } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal  // Connecte l'AbortController à la requête
    });

    clearTimeout(id);
    return response;
}

/**
 * Endpoint pour récupérer et fusionner les trois flux RSS de JeuxOnline.
 */
export async function GET() {
  const promises = Object.entries(RSS_URLS).map(async ([category, url]) => {
    try {
      // 1. Fetcher le XML nous-mêmes avec un timeout de 10 secondes
      const response = await fetchWithTimeout(url, { timeout: 10000 });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
      const xmlText = await response.text();

      // 2. Parser le contenu XML (maintenant local)
      const feed = await parser.parseString(xmlText);

      // 3. Formatage des items
      return feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || item.content || '', 
        creator: item.creator || 'Auteur Inconnu',
        category: category, 
      }));
    } catch (error) {
      // 🟢 Gestion d'erreur locale
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue de parsing.';
      console.warn(`[JEUXONLINE] Erreur critique (ignorable) sur le flux ${category}: ${errorMessage}`);
      return []; 
    }
  });

  try {
    const results = await Promise.all(promises);
    
    const allItems = results.flat().sort((a, b) => {
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return NextResponse.json({
      title: "JeuxOnline - Flux Fusionné",
      description: "Actualités, critiques et vidéos de JeuxOnline.",
      items: allItems,
      source: 'JeuxOnline Flux Fusionné',
    });
    
  } catch (error) {
    // Ce catch ne devrait jamais être atteint
    return NextResponse.json({
      error: 'Erreur de traitement interne lors de la fusion des flux.',
      details: error instanceof Error ? error.message : 'Problème de connexion général.',
    }, { status: 500 });
  }
}
