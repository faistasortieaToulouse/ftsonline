import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin mis à jour vers votre fichier réel
    const filePath = path.join(process.cwd(), 'data', 'europe', 'membres.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // On renvoie le tableau 'pays'
    return NextResponse.json(data.pays);
  } catch (error: any) {
    console.error("ERREUR API MEMBRES:", error.message);
    return NextResponse.json({ error: "Fichier introuvable ou mal formé" }, { status: 500 });
  }
}