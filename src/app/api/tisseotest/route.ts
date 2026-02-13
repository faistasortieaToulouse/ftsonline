import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'tisseo', 'lignetisseo.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API Tisséo:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des données' }, { status: 500 });
  }
}
