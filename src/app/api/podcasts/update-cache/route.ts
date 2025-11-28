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
    date: string; // ISO string format
    audioUrl: string;
    description: string;
}

const parser = new RssParser();
// Le cache ne fonctionnera PAS en production sur Netlify/Vercel car il écrit sur le système de fichiers éphémère.
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
                
                // 🛑 CRITIQUE: Seul l'audioUrl est OBLIGATOIRE, car c'est la ressource principale.
                if (!item.enclosure?.url) {
                    console.warn(`[ATTENTION] Épisode sans URL audio ignoré de ${librairieName}. Titre: ${item.title || 'Inconnu'}`);
                    return null;
                }

                // --- Assurer des valeurs par défaut pour éviter les erreurs de format ---
                const titreFinal = item.title || 'Titre inconnu';
                
                // 📅 Utiliser isoDate (le plus propre) ou pubDate, avec une date de secours ISO.
                const dateFinale = item.isoDate || item.pubDate || new Date().toISOString(); 
                
                // Prioriser le contenu HTML s'il existe
                const descriptionFinale = item.content || item.contentSnippet || 'Pas de description disponible'; 

                return {
                    librairie: librairieName,
                    titre: titreFinal,
                    date: dateFinale,
                    description: descriptionFinale,
                    audioUrl: item.enclosure.url,
                };
            })
            .filter((ep): ep is PodcastEpisode => ep !== null); // Filtrer les épisodes incomplets

        console.log(`[SUCCESS] ${librairieName}: ${episodes.length} épisodes récupérés.`);
        return episodes;

    } catch (error) {
        // En cas d'erreur réseau ou de parsing du flux entier
        console.error(`[ERREUR] Impossible de charger le flux RSS pour ${librairieName} (${feedUrl}):`, error);
        return [];
    }
}

// Fonction principale pour mettre à jour le cache
export async function GET() {
    console.log("--- Début de la mise à jour du cache des podcasts ---");
    
    try {
        const fetchPromises = Object.entries(FEEDS).map(([librairieName, feedUrl]) => 
            fetchAndParseFeed(feedUrl, librairieName)
        );

        const allEpisodesArrays = await Promise.all(fetchPromises);
        const aggregatedEpisodes = allEpisodesArrays.flat();

        if (aggregatedEpisodes.length === 0) {
            return NextResponse.json(
                { error: "Aucun épisode n'a pu être chargé. Vérifiez les URLs des flux RSS." },
                { status: 500 }
            );
        }

        // --- Écriture du cache (cette partie est problématique en Serverless, utilisez une DB si persistant) ---
        const dataDir = path.dirname(CACHE_PATH);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(CACHE_PATH, JSON.stringify(aggregatedEpisodes, null, 2), "utf-8");
        // ---------------------------------------------------------------------------------------------------

        console.log(`--- Cache mis à jour avec succès. Total: ${aggregatedEpisodes.length} épisodes ---`);

        // FIX: Retourner un statut 200 et un message de succès
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
