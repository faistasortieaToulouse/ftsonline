import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'expansion_hebraisme.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);

    // On extrait l'objet principal
    const data = rawData.diffusion_hebraisme_mondiale;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la lecture des données" }, { status: 500 });
  }
}