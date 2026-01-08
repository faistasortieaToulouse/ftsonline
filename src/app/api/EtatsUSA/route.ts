import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers ton fichier JSON
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'entree Etats Unis USA.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // On renvoie directement le tableau des états
    return NextResponse.json(data.etats_unis);
  } catch (error) {
    console.error("Erreur API EtatsUSA:", error);
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}