import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Copie conforme de la ligne qui marche pour territoire_francais
    const filePath = path.join(process.cwd(), 'data', 'territoire', 'hoteldeville.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON Hôtel de ville:", error);
    return NextResponse.json({ error: "Erreur de chargement des données" }, { status: 500 });
  }
}
