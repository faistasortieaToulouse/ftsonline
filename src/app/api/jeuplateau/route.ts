// src/app/api/philibertnet/route.ts

// ✅ OBLIGATOIRE : rss-parser ne fonctionne PAS en Edge Runtime
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const RSS_FEED_URL =
  'https://www.philibertnet.com/modules/feeder/rss.php?id_category=8051';

const parser = new Parser();

// Fetch sécurisé (OBLIGATOIRE pour Philibert)
async function fetchRss(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NextJS-RSS-Bot/1.0)',
      'Accept': 'application/rss+xml, application/xml;q=0.9,*/*;q=0.8',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

export async function GET() {
  try {
    // 1️⃣ Fetch XML
    const xml = await fetchRss(RSS_FEED_URL);

    // 2️⃣ Parse XML
    const feed = await parser.parseString(xml);

    // 3️⃣ Normalisation
    const items = feed.items.map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      pubDate: item.pubDate ?? '',
      snippet:
        item.contentSnippet ||
        item.content ||
        '',
    }));

    return NextResponse.json({
      title: feed.title || 'Philibert – Nouveautés',
      description:
        feed.description ||
        'Flux RSS Philibert',
      source: 'Philibert.net RSS',
      category_id: 8051,
      count: items.length,
      items,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erreur inconnue';

    console.error(
      '[PHILIBERT RSS ERROR]',
      message
    );

    return NextResponse.json(
      {
        error:
          'Erreur lors de la récupération du flux RSS Philibert',
        details: message,
        source: 'Philibert.net RSS',
      },
      { status: 500 }
    );
  }
}
