import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Chemin du cache Terra Nova
const CACHE_PATH = path.join(process.cwd(), "data", "podterranova-cache.json");

export async function GET() {
  try {
    // Vérifier l’existence du cache
    try {
      await fs.access(CACHE_PATH);
    } catch (e) {
      return NextResponse.json(
        { error: "Cache Terra Nova absent. Lancez /api/podterranova/update-cache." },
        { status: 404 }
      );
    }

    const content = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(content);

    return NextResponse.json(
      { data: episodes },
      { status: 200 }
    );

  } catch (err) {
    console.error("Erreur API TerraNova (lecture cache):", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la lecture du cache Terra Nova." },
      { status: 500 }
    );
  }
}
