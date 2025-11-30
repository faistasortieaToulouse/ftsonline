import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { GET as runUpdate } from "./update-cache/route";

const CACHE_FILE = path.join(process.cwd(), "data", "podterra-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6h

export async function GET() {
  try {
    let stats;

    try {
      stats = await fs.stat(CACHE_FILE);
    } catch {
      // Cache inexistant → update
      return await updateAndReturn();
    }

    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      return await updateAndReturn();
    }

    // Lire cache
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const episodes = JSON.parse(raw);

    // Passer tous les audios par le proxy
    const episodesWithProxy = episodes.map((ep: any) => {
      let audioUrl = ep.audioUrl || "";
      if (audioUrl && !audioUrl.startsWith("/api/proxy-audio")) {
        audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      }
      return { ...ep, audioUrl };
    });

    return NextResponse.json({ data: episodesWithProxy, totalEpisodes: episodesWithProxy.length });

  } catch (err: any) {
    console.error("Erreur podterra:", err);
    return NextResponse.json({ data: [], error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

async function updateAndReturn() {
  try {
    const response = await runUpdate();
    const json = await response.json();

    const episodesWithProxy = (json.episodes || []).map((ep: any) => {
      let audioUrl = ep.audioUrl || "";
      if (audioUrl && !audioUrl.startsWith("/api/proxy-audio")) {
        audioUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      }
      return { ...ep, audioUrl };
    });

    return NextResponse.json({ data: episodesWithProxy, totalEpisodes: episodesWithProxy.length });
  } catch (err) {
    console.error("Erreur update-cache podterra:", err);
    return NextResponse.json({ data: [], error: "Erreur cache" }, { status: 500 });
  }
}
