import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/toulousain/clubsport.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de lecture' }, { status: 500 });
  }
}
