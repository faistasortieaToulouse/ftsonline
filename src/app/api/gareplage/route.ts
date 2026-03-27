import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/occitanie/gareplage.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error("Erreur API GarePlage:", error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des données gares' }, { status: 500 });
  }
}
