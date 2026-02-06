import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/europeen.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Europe:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
