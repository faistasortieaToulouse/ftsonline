import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { GET as updateCache } from "./update-cache/route"; // import direct

const CACHE_PATH = path.join(process.cwd(), "data", "podmollat-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

export async function GET() {
  try {
    let stats;
    try {
      stats = await fs.stat(CACHE_PATH);
    } catch {
      // Fichier absent → on force la mise à jour
      return await updateCacheAndReturn();
    }

    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      // Cache trop vieux → mise à jour
      return await updateCacheAndReturn();
    }

    // Lire le cache existant
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(fileContent);
    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur API podmollat:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// Appel direct de la fonction update-cache
async function updateCacheAndReturn() {
  try {
    const response = await updateCache(); // Appel interne direct
    const json = await response.json();
    return NextResponse.json({ data: json.totalEpisodes ? json : [] }, { status: 200 });
  } catch (err) {
    console.error("Erreur update-cache:", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le cache" },
      { status: 500 }
    );
  }
}
