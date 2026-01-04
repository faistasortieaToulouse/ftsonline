import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'savoir', 'fleurs.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const fleurs = JSON.parse(jsonData);
    return NextResponse.json(fleurs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Impossible de charger les fleurs' }, { status: 500 });
  }
}
