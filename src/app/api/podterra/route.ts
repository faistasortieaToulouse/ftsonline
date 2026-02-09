import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "podterra-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

/**
 * Ajoute le préfixe du proxy aux URLs audio pour contourner les problèmes de CORS
 */
function applyAudioProxy(episodes: any[]) {
  return episodes.map((ep: any) => {
    let audioUrl = ep.audioUrl || "";
    if (audioUrl && !audioUrl.startsWith("/api/proxy-audio") && !audioUrl.startsWith("/")) {
      audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
    }
    return { ...ep, audioUrl };
  });
}

export async function GET() {
  try {
    let stats;
    let cacheExists = true;

    try {
      stats = await fs.stat(CACHE_FILE);
    } catch {
      cacheExists = false;
    }

    // 1. Si le cache n'existe pas, on demande au client de déclencher l'update
    if (!cacheExists) {
      return NextResponse.json({ 
        data: [], 
        needsUpdate: true, 
        message: "Initialisation requise" 
      });
    }

    // 2. Vérification de l'âge du cache
    const age = Date.now() - stats!.mtime.getTime();
    const isExpired = age > CACHE_MAX_AGE;

    // 3. Lecture du cache existant
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const episodes = JSON.parse(raw);
    
    // 4. Application du proxy sur les URLs
    const processedData = applyAudioProxy(episodes);

    return NextResponse.json({ 
      data: processedData, 
      totalEpisodes: processedData.length,
      needsUpdate: isExpired // Signal au front qu'une mise à jour en arrière-plan serait bien
    });

  } catch (err: any) {
    console.error("Erreur API podterra:", err);
    return NextResponse.json(
      { data: [], error: "Erreur lors de la lecture du cache" }, 
      { status: 500 }
    );
  }
}
