import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public/mapmonde/countries_simplified.topo');
    const fileContent = await fs.readFile(filePath, 'utf8');
    // On parse pour vérifier la validité avant de renvoyer
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    console.error("Erreur API Fuseaux:", error);
    return NextResponse.json({ error: "Fichier de cartographie introuvable" }, { status: 500 });
  }
}
