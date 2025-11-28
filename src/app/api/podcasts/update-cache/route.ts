import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import RssParser from 'rss-parser';

// --- Configuration des flux RSS ---
const FEEDS: Record<string, string> = {
  "Terra Nova": "https://www.vodio.fr/rssmedias.php?valeur=636",
  "Ombres Blanches": "https://feed.ausha.co/kk2J1iKdlOXE",
  "Librairie Mollat": "https://feed.ausha.co/rss/librairie-mollat",
  "Marathon des Mots": "https://feed.ausha.co/BnYn5Uw5W3WO",
};

// Interface pour les données agrégées (doit correspondre à celle du client)
interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const parser = new RssParser();
const CACHE_PATH = path.join(process.cwd(), "data", "podcasts-cache.json");

/**
 * Récupère et parse un seul flux RSS, en l'uniformisant au format PodcastEpisode.
 * @param feedUrl URL du flux RSS.
 * @param librairieName Nom de la librairie à assigner à chaque épisode.
 * @returns Une promesse qui résout à un tableau d'épisodes.
 */
async function fetchAndParseFeed(feedUrl: string, librairieName: string): Promise<PodcastEpisode[]> {
    if (feedUrl.includes("YOUR_")) {
        console.warn(`[ATTENTION] URL de flux non configurée pour ${librairieName}. Skipping.`);
        return [];
    }
    
    try {
        const feed = await parser.parseURL(feedUrl);
        
        // Mappage des données brutes du RSS au format client (PodcastEpisode)
        const episodes: PodcastEpisode[] = feed.items
            .map(item => {
                // S'assurer que les champs essentiels existent
                if (!item.title || !item.pubDate || !item.enclosure?.url) {
                    return null; 
                }

                return {
                    librairie: librairieName,
                    titre: item.title,
                    // FIX: Utiliser item.isoDate pour un format de date fiable
                    date: item.isoDate || item.pubDate, 
                    // FIX: Prioriser le contenu complet (HTML) sur le snippet pour la description client
                    description: item.content || item.contentSnippet || 'Pas de description disponible', 
                    audioUrl: item.enclosure.url,
                };
            })
            .filter((ep): ep is PodcastEpisode => ep !== null); // Filtrer les épisodes incomplets

        console.log(`[SUCCESS] ${librairieName}: ${episodes.length} épisodes récupérés.`);
        return episodes;

    } catch (error) {
        console.error(`[ERREUR] Impossible de charger le flux RSS pour ${librairieName} (${feedUrl}):`, error);
        return [];
    }
}

// Fonction principale pour mettre à jour le cache
export async function GET() {
    console.log("--- Début de la mise à jour du cache des podcasts ---");
    
    try {
        // FIX: Utiliser l'objet FEEDS au lieu de l'objet non défini PODCAST_FEEDS
        const fetchPromises = Object.entries(FEEDS).map(([librairieName, feedUrl]) => 
            fetchAndParseFeed(feedUrl, librairieName)
        );

        // Attendre la résolution de toutes les promesses
        const allEpisodesArrays = await Promise.all(fetchPromises);

        // Aplatir le tableau de tableaux pour obtenir une liste unique
        const aggregatedEpisodes = allEpisodesArrays.flat();

        if (aggregatedEpisodes.length === 0) {
            return NextResponse.json(
                { error: "Aucun épisode n'a pu être chargé. Vérifiez les URLs des flux RSS." },
                { status: 500 }
            );
        }

        // Créer le répertoire 'data' si il n'existe pas
        const dataDir = path.dirname(CACHE_PATH);
        await fs.mkdir(dataDir, { recursive: true });

        // Écrire le fichier de cache
        await fs.writeFile(CACHE_PATH, JSON.stringify(aggregatedEpisodes, null, 2), "utf-8");

        console.log(`--- Cache mis à jour avec succès. Total: ${aggregatedEpisodes.length} épisodes ---`);

        return NextResponse.json(
            { 
                message: "Cache mis à jour avec succès", 
                totalEpisodes: aggregatedEpisodes.length 
            }, 
            { status: 200 }
        );

    } catch (err) {
        console.error("Erreur critique lors de la mise à jour du cache:", err);
        return NextResponse.json(
            { error: "Erreur interne critique lors de la mise à jour du cache" },
            { status: 500 }
        );
    }
}
