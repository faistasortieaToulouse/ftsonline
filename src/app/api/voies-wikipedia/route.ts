import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface WikipediaEnrichment {
  id: number;
  titre: string;
  description: string;
  lien?: string;
}

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "wikipedia-enrichments.json"
    );

    if (!fs.existsSync(filePath)) {
      console.error("Fichier introuvable :", filePath);
      return NextResponse.json([], { status: 200 });
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const rawData = JSON.parse(fileContents);

    if (!Array.isArray(rawData)) {
      console.error("Le fichier JSON n'est pas un tableau");
      return NextResponse.json([], { status: 200 });
    }

    const data: WikipediaEnrichment[] = rawData.map((w: any, index: number) => ({
      id: index,
      titre: w.titre ?? "",
      description: w.description ?? "",
      lien: w.lien ?? null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture wikipedia-enrichments.json :", error);
    return NextResponse.json(
      { error: "Impossible de charger les enrichissements Wikipédia" },
      { status: 500 }
    );
  }
}
