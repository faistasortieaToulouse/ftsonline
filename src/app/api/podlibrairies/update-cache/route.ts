import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "podlibrairies-cache.json");

// --- Fonction pour récupérer toutes les sources avec source injectée ---
async function fetchAllSources() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:9002";

  // Fetch parallèle des trois librairies
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

  // Ajouter la source à chaque épisode
  const marathonEpisodes = (marathonData.data || []).map(ep => ({
    ...ep,
    source: "Marathon des Mots",
  }));

  const terraEpisodes = (terraData.data || []).map(ep => ({
    ...ep,
    source: "Terra Nova",
  }));

  const ombresEpisodes = (ombresData.data || []).map(ep => ({
    ...ep,
    source: "Ombres Blanches",
  }));

  // Fusionner tous les épisodes
  return [...marathonEpisodes, ...terraEpisodes, ...ombresEpisodes];
}

export async function GET() {
  try {
    const allEpisodes = await fetchAllSources();

    // Stocker dans le cache
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(allEpisodes, null, 2), "utf-8");

    console.log(`[PodLibrairies] Cache mis à jour via update-cache (${allEpisodes.length} épisodes)`);

    return NextResponse.json({
      data: allEpisodes,
      totalEpisodes: allEpisodes.length,
      updated: true,
    });
  } catch (err: any) {
    console.error("[PodLibrairies] Erreur update-cache:", err);
    return NextResponse.json(
      { data: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
