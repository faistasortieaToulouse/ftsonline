import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'savoir', 'grec_medical.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const mots = JSON.parse(jsonData);
    return NextResponse.json(mots);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Impossible de charger le dictionnaire grec médical' }, { status: 500 });
  }
}
