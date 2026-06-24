import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'europe', 'multinationales.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON multinationales:", error);
    return NextResponse.json(
      { error: "Erreur de chargement des données multinationales" },
      { status: 500 }
    );
  }
}
