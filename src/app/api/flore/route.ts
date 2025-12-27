import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "inventaire-de-la-flore-sauvage-en-milieu-urbain-ville-de-toulouse.json"
    );

    if (!fs.existsSync(filePath)) return NextResponse.json([]);

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContents);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erreur lecture fichier flore :", error);
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}
