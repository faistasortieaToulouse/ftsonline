import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'toulouse',
      'quartiers_toulouse.json'
    );

    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const quartiers = JSON.parse(fileContents);

    return NextResponse.json(quartiers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des quartiers de Toulouse' },
      { status: 500 }
    );
  }
}
