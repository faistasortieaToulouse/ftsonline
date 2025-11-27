import { NextResponse } from "next/server";
import Parser from "rss-parser";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

interface PodcastEpisode {
librairie: string;
titre: string;
date: string;
audioUrl: string;
description: string;
}

const rssParser = new Parser();
const xmlParser = new XMLParser({ ignoreAttributes: false, allowBooleanAttributes: true });

// --- Liste des podcasts ---
const PODCASTS = [
{ librairie: "Ombres Blanches", type: "ausha", url: "[https://feed.ausha.co/kk2J1iKdlOXE](https://feed.ausha.co/kk2J1iKdlOXE)" },
{ librairie: "Marathon des mots", type: "ausha", url: "[https://feed.ausha.co/BnYn5Uw5W3WO](https://feed.ausha.co/BnYn5Uw5W3WO)" },
{ librairie: "Librairie Mollat", type: "ausha", url: "[https://feed.ausha.co/lheure-des-livres-mollat](https://feed.ausha.co/lheure-des-livres-mollat)" },
{ librairie: "Terra Nova", type: "vodio", url: "[https://www.vodio.fr/rssmedias.php?valeur=636](https://www.vodio.fr/rssmedias.php?valeur=636)" },
];

// --- Fonctions de récupération ---
async function fetchAushaPodcast(baseUrl: string, url: string, librairie: string): Promise<PodcastEpisode[]> {
try {
const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
const feed = await rssParser.parseURL(proxyUrl);


return feed.items.map(item => ({
  librairie,
  titre: item.title ?? "",
  date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
  audioUrl: item.enclosure?.url ?? "",
  description: item.contentSnippet ?? item.content ?? "",
}));


} catch (err) {
console.warn(`⚠️ Ignoring podcast ${librairie} — fetch failed`, err);
return [];  // Ne rien renvoyer si le flux est indisponible
}
}

async function fetchVodioPodcast(url: string, librairie: string): Promise<PodcastEpisode[]> {
try {
const res = await fetch(url);
if (!res.ok) {
console.warn(`⚠️ Ignoring podcast ${librairie} — status ${res.status}`);
return [];
}

const xml = await res.text();
const parsed = xmlParser.parse(xml);
const items = parsed?.rss?.channel?.item ?? [];
return (Array.isArray(items) ? items : [items]).map((item: any) => ({
  librairie,
  titre: item.title ?? "",
  date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
  audioUrl: item.enclosure?.["@_url"] ?? "",
  description: item.description ?? "",
}));

} catch (err) {
console.warn(`⚠️ Ignoring podcast ${librairie} — error parsing`, err);
return [];
}
}

// --- Route GET ---
export async function GET(req: Request) {
try {
const { searchParams } = new URL(req.url);
const page = parseInt(searchParams.get("page") || "1", 10);
const limit = parseInt(searchParams.get("limit") || "10", 10);
const query = searchParams.get("q")?.toLowerCase() || "";
const librairieFilter = searchParams.get("librairie") || "";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Récupération de tous les podcasts en parallèle
const episodesPromises = PODCASTS.map(podcast => {
  if (podcast.type === "ausha") return fetchAushaPodcast(baseUrl, podcast.url, podcast.librairie);
  if (podcast.type === "vodio") return fetchVodioPodcast(podcast.url, podcast.librairie);
  return Promise.resolve([]);
});

let allEpisodes = (await Promise.all(episodesPromises)).flat();

// Filtrage par recherche
if (query) {
  allEpisodes = allEpisodes.filter(
    ep =>
      ep.titre.toLowerCase().includes(query) ||
      ep.description.toLowerCase().includes(query)
  );
}

// Filtrage par librairie
if (librairieFilter) {
  allEpisodes = allEpisodes.filter(ep => ep.librairie === librairieFilter);
}

// Tri par date décroissante
allEpisodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Pagination
const startIndex = (page - 1) * limit;
const paginatedEpisodes = allEpisodes.slice(startIndex, startIndex + limit);

return NextResponse.json({
  success: true,
  data: paginatedEpisodes,
  metadata: {
    totalEpisodes: allEpisodes.length,
    page,
    limit,
    totalPages: Math.ceil(allEpisodes.length / limit),
    lastUpdated: new Date().toISOString(),
  },
});

} catch (error) {
console.error("Erreur globale API podcasts:", error);
return NextResponse.json(
{ success: false, message: "Erreur lors du traitement des flux RSS." },
{ status: 500 }
);
}
}
