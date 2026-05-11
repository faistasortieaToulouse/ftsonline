import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const jsonDirectory = path.join(process.cwd(), 'data/architecture');
  const fileContents = await fs.readFile(jsonDirectory + '/rempartfrance.json', 'utf8');
  return NextResponse.json(JSON.parse(fileContents));
}
