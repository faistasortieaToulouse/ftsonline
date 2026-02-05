import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const filePath = path.join(jsonDirectory, 'chine.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Chine Error:", error);
    return NextResponse.json({ error: "Erreur de lecture des données" }, { status: 500 });
  }
}
