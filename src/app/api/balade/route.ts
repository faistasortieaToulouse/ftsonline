import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/* ================= UTIL ================= */

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== ""
    ? value
    : fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && !isNaN(value)
    ? value
    : fallback;
}

/* ================= ROUTE ================= */

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "balade.json"
    );

    if (!fs.existsSync(filePath)) {
      console.error("Fichier introuvable :", filePath);
      return NextResponse.json([], { status: 200 });
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const rawData = JSON.parse(fileContents);

    if (!Array.isArray(rawData)) {
      console.error("balade.json n'est pas un tableau");
      return NextResponse.json([], { status: 200 });
    }

    /* ---------- Normalisation des données ---------- */
    const data = rawData.map((b, index) => ({
      id: safeString(b.id, String(index + 1)),
      nom: safeString(b.nom, "Balade sans nom"),
      lieu: safeString(b.lieu, "Lieu non précisé"),
      accessibilite: safeString(b.accessibilite, "Non précisé"),
      duree: safeString(b.duree, "—"),
      distance: safeNumber(b.distance, 0),
      remarques: safeString(b.remarques),
      lien: safeString(b.lien),
      geo_point_2d: b.geo_point_2d ?? null,
      geo_shape: b.geo_shape ?? null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture balade.json :", error);
    return NextResponse.json(
      { error: "Impossible de charger les balades" },
      { status: 500 }
    );
  }
}
