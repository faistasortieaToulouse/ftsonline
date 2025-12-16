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
  // Utilisez Promise.allSettled pour vous assurer que l'API ne plante pas si UN flux échoue
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
        category: category, // Catégorie (Actualites, Critiques, Videos)
        // Champ 'content' omis pour alléger la réponse
      }));
    } catch (error) {
      // 🟢 Gestion d'erreur locale : Log l'erreur mais permet aux autres flux de continuer
      console.warn(`[JEUXONLINE] Erreur lors du traitement du flux ${category} (${url}):`, error);
      return []; // Retourne un tableau vide pour que 'flat()' puisse l'ignorer
    }
  });

  try {
    // 3. Attendre que TOUS les appels soient terminés (même s'ils ont échoué en interne)
    const results = await Promise.all(promises);
    
    // 4. Aplatir les résultats (cela ignore les tableaux vides retournés en cas d'erreur)
    const allItems = results.flat().sort((a, b) => {
        // Trier par date du plus récent au plus ancien
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // 5. Retourner les données fusionnées
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
    // Ce catch ne devrait plus être atteint à moins d'une erreur de JS critique.
    console.error("Erreur critique lors de la fusion finale des flux RSS:", error);
    return NextResponse.json({
      error: 'Erreur de traitement interne lors de la fusion des flux.',
      details: error instanceof Error ? error.message : 'Problème de connexion général.',
    }, { status: 500 });
  }
}
