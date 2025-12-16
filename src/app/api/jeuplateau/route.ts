// src/app/api/jeuplateau/route.ts

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// URLs des flux RSS JeuxOnline
const RSS_URLS = {
  Actualites: 'https://jeux-plateau-societe.jeuxonline.info/rss/actualites/rss.xml',
  Critiques: 'https://jeux-plateau-societe.jeuxonline.info/rss/critiques/rss.xml',
  Videos: 'https://jeux-plateau-societe.jeuxonline.info/rss/videos/rss.xml',
};

// Parser RSS
const parser = new Parser({
  customFields: {
    item: [['dc:creator', 'creator']],
  },
});

// Fetch avec timeout + User-Agent (OBLIGATOIRE pour Critiques & Vidéos)
async function fetchWithTimeout(
  resource: string,
  options: { timeout?: number } = {}
) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JeuxPlateauBot/1.0)',
      'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
    },
  });

  clearTimeout(id);
  return response;
}

/**
 * Endpoint GET : fusion des flux RSS JeuxOnline
 */
export async function GET() {
  const promises = Object.entries(RSS_URLS).map(
    async ([category, url]) => {
      try {
        // 1. Fetch RSS
        const response = await fetchWithTimeout(url, { timeout: 10000 });

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status} : ${response.statusText}`
          );
        }

        // 2. Lecture XML
        const xmlText = await response.text();

        // 3. Parsing RSS
        const feed = await parser.parseString(xmlText);

        // Debug utile (facultatif)
        console.log(
          `[JEUXONLINE] ${category} : ${feed.items.length} items`
        );

        // 4. Normalisation des items
        return feed.items.map((item) => ({
          title: item.title ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          snippet: item.contentSnippet || item.content || '',
          creator: item.creator || 'Auteur inconnu',
          category,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Erreur inconnue';

        console.warn(
          `[JEUXONLINE] Flux ${category} ignoré : ${message}`
        );
        return [];
      }
    }
  );

  try {
    const results = await Promise.all(promises);

    const allItems = results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() -
          new Date(a.pubDate).getTime()
      );

    return NextResponse.json({
      title: 'JeuxOnline - Flux Fusionné',
      description: 'Actualités, critiques et vidéos de JeuxOnline',
      source: 'JeuxOnline',
      items: allItems,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur interne lors de la fusion des flux',
        details:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
