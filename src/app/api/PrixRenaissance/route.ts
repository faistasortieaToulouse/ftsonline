import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction propre du chemin
    const filePath = path.join(process.cwd(), 'data', 'litterature', 'Prix de La Renaissance.json');
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON Prix Flore:", error);
    return NextResponse.json({ error: "Impossible de lire les données" }, { status: 500 });
  }
}