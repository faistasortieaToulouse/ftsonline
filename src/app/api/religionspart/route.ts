import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'religion', 'religions_monde_estimations.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    return NextResponse.json(json);
  } catch (error) {
    console.error('Erreur API religionspart:', error);
    return NextResponse.json({ error: 'Impossible de lire le fichier JSON' }, { status: 500 });
  }
}
