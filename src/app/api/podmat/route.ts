// src/app/api/podmat/route.ts
// Cette route implémente un cache de 24 heures (daily revalidation) pour éviter
// de surcharger la source RSS à chaque requête.

import RssParser from 'rss-parser';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// --- Configuration ---
const PODCAST_FEED_URL = 'https://feed.ausha.co/BnYn5Uw5W3WO';
// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; 
// Chemin du fichier de cache dans le répertoire temporaire (le seul inscriptible sur Vercel/Lambda)
const CACHE_FILE_PATH = path.join('/tmp', 'podmat-cache.json'); 

const parser = new RssParser({});

// Définition d'une interface pour les données que nous allons renvoyer
interface PodcastItem {
  title: string | undefined;
  link: string | undefined;
  pubDate: string | undefined;
  content: string | undefined;
  enclosureUrl: string | undefined;
}

// Interface pour le contenu du fichier de cache
interface CacheContent {
    timestamp: number;
    data: {
        channelTitle: string | undefined;
        description: string | undefined;
        items: PodcastItem[];
    }
}

// --- Fonction de Récupération des Données RSS ---
async function fetchAndParseFeed() {
    console.log('Cache expiré ou manquant. Récupération du flux RSS...');
    const feed = await parser.parseURL(PODCAST_FEED_URL);

    const podcastItems: PodcastItem[] = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content,
        enclosureUrl: item.enclosure?.url,
    }));

    return {
        channelTitle: feed.title,
        description: feed.description,
        items: podcastItems,
    };
}

// --- Fonction asynchrone GET pour gérer la requête ---
export async function GET() {
    const now = Date.now();
    let cachedData: CacheContent | null = null;
    let isCacheValid = false;

    // 1. Essayer de lire le cache
    try {
        const cacheFileContent = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
        cachedData = JSON.parse(cacheFileContent);
        
        // Vérifier l'âge du cache
        if (cachedData && (now - cachedData.timestamp < CACHE_DURATION_MS)) {
            isCacheValid = true;
            console.log('Cache valide trouvé. Retour des données en cache.');
        } else {
            console.log('Cache expiré ou invalide. Va re-récupérer les données.');
        }

    } catch (readError: any) {
        // C'est normal si le fichier n'existe pas encore ou si le répertoire /tmp a été effacé
        if (readError.code !== 'ENOENT') {
            console.warn('Avertissement lors de la lecture du cache:', readError.message);
        }
        console.log('Pas de cache trouvé ou erreur de lecture, récupération nécessaire.');
    }

    if (isCacheValid && cachedData) {
        // Retourner les données en cache
        return NextResponse.json(cachedData.data);
    }

    // 2. Si le cache est invalide ou inexistant, récupérer les nouvelles données
    try {
        const newFeedData = await fetchAndParseFeed();

        // 3. Écrire les nouvelles données et le nouvel horodatage dans le cache
        const newCacheContent: CacheContent = {
            timestamp: now,
            data: newFeedData
        };

        // Assurez-vous que le répertoire existe (souvent non nécessaire pour /tmp, mais bonne pratique)
        // Note: fs.mkdir peut échouer si le répertoire existe déjà, d'où l'option recursive: true
        await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
        await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(newCacheContent), 'utf-8');
        console.log('Nouveau cache écrit avec succès.');

        // 4. Retourner la réponse JSON
        return NextResponse.json(newFeedData);

    } catch (error) {
        console.error('Erreur critique lors de la récupération ou de la mise à jour du flux RSS:', error);
        
        // Tenter de renvoyer l'ancien cache si la récupération a échoué (approche "stale-while-revalidate")
        if (cachedData) {
            console.log("Échec de la récupération. Retour de l'ancien cache pour éviter une panne.");
            return NextResponse.json(cachedData.data);
        }

        // Sinon, retourner une erreur 500
        return new NextResponse(
          JSON.stringify({ message: 'Erreur lors du chargement des podcasts et aucun cache disponible.' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }
}
