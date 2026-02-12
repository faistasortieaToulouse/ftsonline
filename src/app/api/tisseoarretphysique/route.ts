import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'tisseo', 'arret_physique.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lecture arret_physique:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}
