import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'territoire', 'territoire_francais.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // On retourne le tableau "territoires"
    return NextResponse.json(data.territoires);
  } catch (error) {
    console.error("Erreur lecture JSON:", error);
    return NextResponse.json({ error: "Erreur de chargement des données" }, { status: 500 });
  }
}