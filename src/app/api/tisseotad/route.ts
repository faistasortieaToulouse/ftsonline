import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'tisseo');
    const filePath = path.join(jsonDirectory, 'tad_zone.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    
    // Nettoyage au cas où le JSON contiendrait des balises HTML parasites
    const cleanJson = fileContents.replace(/<div>|<\/div>|<br.*?>/gi, '').trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Tisséo:", error);
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
  }
}
