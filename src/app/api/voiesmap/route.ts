import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/* ================= UTIL ================= */
function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
}

// Supprime les préfixes pour le tri (RUE, ALL, PL, etc.)
function stripPrefix(libelle: string) {
  return libelle.replace(/^(RUE|ALL|PL|PROM|CHEM|PRV|ESPA|RPT)\s+/i, "").trim();
}

/* ================= ROUTE ================= */
export async function GET() {
  try {
    const voiesPath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "nomenclature-des-voies-libelles-officiels-et-en-occitan.json"
    );

    const wikiPath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "wikipedia-enrichments.json"
    );

    if (!fs.existsSync(voiesPath)) {
      console.error("Fichier voies introuvable :", voiesPath);
      return NextResponse.json([], { status: 200 });
    }

    const voiesContents = fs.readFileSync(voiesPath, "utf-8");
    const rawVoies = JSON.parse(voiesContents);

    const wikiData: Record<number, string> = fs.existsSync(wikiPath)
      ? JSON.parse(fs.readFileSync(wikiPath, "utf-8")).reduce(
          (acc: Record<number, string>, e: any) => {
            if (e.wikipedia) acc[e.id] = e.wikipedia;
            return acc;
          },
          {}
        )
      : {};

    const data = rawVoies.map((v: any, index: number) => ({
      id: index,
      libelle: safeString(v.libelle),
      libelle_occitan: v.libelle_occitan ?? null,
      quartier: safeString(v.quartier),
      territoire: safeString(v.territoire),
      complement: v.complement ?? null,
      complement_occitan: v.complement_occitan ?? null,
      sti: safeNumber(v.sti),
      wikipedia: wikiData[index] ?? null, // fusion des infos Wikipédia
    }));

    // Tri alphabétique en ignorant le préfixe
    data.sort((a, b) =>
      stripPrefix(a.libelle).localeCompare(stripPrefix(b.libelle), "fr")
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture voies:", error);
    return NextResponse.json(
      { error: "Impossible de charger les voies" },
      { status: 500 }
    );
  }
}
