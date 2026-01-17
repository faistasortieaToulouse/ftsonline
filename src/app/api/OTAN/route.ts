import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'europe');
    const fileContents = await fs.readFile(jsonDirectory + '/OTAN.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API OTAN:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}