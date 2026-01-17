import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'europe', 'Etats_associes_UE.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // On parse le fichier complet
    const data = JSON.parse(fileContents);
    
    // On renvoie UNIQUEMENT le tableau des zones
    return NextResponse.json(data.zones);
  } catch (error: any) {
    console.error("ERREUR API ASSOCIES:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}