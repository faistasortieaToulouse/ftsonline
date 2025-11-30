// src/app/api/podmollat2/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// On importe la fonction GET du sous-route handler pour mettre à jour le cache
import { GET as updateCache } from "./update-cache/route";

const CACHE_PATH = path.join(process.cwd(), "data", "podmollat2-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6h

export async function GET() {
  try {
    let stats;

    // Vérifier si le cache existe
    try {
      stats = await fs.stat(CACHE_PATH);
    } catch {
      // Cache absent → update direct
      return await updateAndReturn();
    }

    // Vérifier l'âge du cache
    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      return await updateAndReturn();
    }

    // Lire cache existant
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(raw);

    // 🔹 Mettre les URLs audio en proxy si nécessaire
    const episodesWithProxy = episodes.map((ep: any) => {
      let audioUrl = ep.audioUrl || "";
      if (audioUrl && !audioUrl.startsWith("/api/proxy-audio")) {
        audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      }
      return { ...ep, audioUrl };
    });

    return NextResponse.json({ data: episodesWithProxy, totalEpisodes: episodesWithProxy.length });
  } catch (err) {
    console.error("[podmollat2] Erreur route principale:", err);
    return NextResponse.json({ data: [], totalEpisodes: 0, error: "Erreur interne" }, { status: 500 });
  }
}

// Fonction pour mettre à jour le cache et retourner la liste
async function updateAndReturn() {
  try {
    const response = await updateCache();
    const json = await response.json();

    // Transformer audioUrl pour passer par proxy
    const episodesWithProxy = (json.data || []).map((ep: any) => {
      let audioUrl = ep.audioUrl || "";
      if (audioUrl && !audioUrl.startsWith("/api/proxy-audio")) {
        audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      }
      return { ...ep, audioUrl };
    });

    return NextResponse.json({ data: episodesWithProxy, totalEpisodes: episodesWithProxy.length });
  } catch (err) {
    console.error("[podmollat2] Erreur update-cache:", err);
    return NextResponse.json({ data: [], totalEpisodes: 0, error: "Erreur mise à jour cache" }, { status: 500 });
  }
}
