import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "podlibrairies-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 30; // 30 min

// --- UPDATE CACHE EN ARRIÈRE PLAN ---
async function fetchUpdateCache() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:9002";

    const [marathonRes, terraRes, ombresRes] = await Promise.all([
      fetch(`${baseUrl}/api/podmarathon`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/podterra`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/podombres`, { cache: "no-store" }),
    ]);

    const [marathonData, terraData, ombresData] = await Promise.all([
      marathonRes.json(),
      terraRes.json(),
      ombresRes.json(),
    ]);

    // --- Injecter la source ---
    const marathonEpisodes = (marathonData.data || []).map(ep => ({ ...ep, source: "Marathon des Mots" }));
    const terraEpisodes = (terraData.data || []).map(ep => ({ ...ep, source: "Terra Nova" }));
    const ombresEpisodes = (ombresData.data || []).map(ep => ({ ...ep, source: "Ombres Blanches" }));

    const allEpisodes = [...marathonEpisodes, ...terraEpisodes, ...ombresEpisodes];

    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(allEpisodes, null, 2), "utf8");

    console.log(`[PodLibrairies] Cache mis à jour (${allEpisodes.length} épisodes)`);
  } catch (err) {
    console.error("[PodLibrairies] Erreur update cache:", err);
  }
}

// ----- UNIQUE HANDLER GET -----
export async function GET() {
  try {
    let cache: any[] = [];
    let stats;

    // Lire le cache existant s'il existe
    try {
      stats = await fs.stat(CACHE_FILE);
      cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    } catch {
      // pas de cache → vide
    }

    // Cache expiré → update async
    if (!stats || Date.now() - stats.mtime.getTime() > CACHE_MAX_AGE) {
      fetchUpdateCache(); // ne bloque pas
    }

    return NextResponse.json({
      data: cache,
      totalEpisodes: cache.length,
    });

  } catch (err: any) {
    console.error("[PodLibrairies] GET error:", err);
    return NextResponse.json(
      { data: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
