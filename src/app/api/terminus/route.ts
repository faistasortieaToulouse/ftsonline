import { NextResponse } from "next/server";

// Si tu as le fichier JSON local, on peut l'importer directement
import terminusData from "../../../../data/mairie/transports-en-commun-a-toulouse-entre-1863-et-1957-terminus.json";

export async function GET() {
  // Retourne les données JSON directement
  return NextResponse.json(terminusData);
}
