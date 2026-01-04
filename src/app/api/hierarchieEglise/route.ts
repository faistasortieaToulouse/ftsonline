import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'hierarchie',
      'hierarchie Eglise.json'
    );

    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const hierarchie = JSON.parse(fileContents);

    return NextResponse.json(hierarchie);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de la hiérarchie de l'Église" },
      { status: 500 }
    );
  }
}
