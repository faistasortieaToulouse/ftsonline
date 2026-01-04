import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'francais', 'francaisofficiel.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Francais:", error);
    return NextResponse.json([], { status: 500 });
  }
}