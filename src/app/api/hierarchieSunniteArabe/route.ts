import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // Construire le chemin vers le JSON
  const filePath = path.join(
    process.cwd(),
    "data",
    "hierarchie",
    "hierarchie Sunnite Arabe.json"
  );

  // Lire et parser le fichier
  const data = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(data);

  return NextResponse.json(json);
}
