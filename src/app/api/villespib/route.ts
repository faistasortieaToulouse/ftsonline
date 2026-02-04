import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/territoire');
    const fileContents = await fs.readFile(jsonDirectory + '/villePIB.json', 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la lecture des données" }, { status: 500 });
  }
}
