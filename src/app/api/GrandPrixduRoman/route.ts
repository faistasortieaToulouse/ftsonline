import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers votre fichier JSON
    const jsonDirectory = path.join(process.cwd(), 'data', 'litterature');
    const fileContents = await fs.readFile(jsonDirectory + '/Grand prix du roman.json', 'utf8');
    
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}