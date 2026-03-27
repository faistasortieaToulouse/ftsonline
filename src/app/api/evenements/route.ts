import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // On utilise exactement le même dossier 'toulousain' que pour les radios
    const filePath = path.join(process.cwd(), 'data/toulousain/evenementsToulouse.json');
    
    // Lecture synchrone comme dans ton exemple radio
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error("Erreur lecture evenements:", error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture des événements' }, 
      { status: 500 }
    );
  }
}
