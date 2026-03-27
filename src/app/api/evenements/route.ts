import { NextResponse } from 'next/server';

// On utilise @ pour partir de la racine du projet (souvent configuré dans tsconfig.json)
// Si @ ne marche pas, utilise : import evenementsData from '../../../data/toulouseain/evenementsToulouse.json';
// @ts-ignore
import evenementsData from '@/../data/toulouseain/evenementsToulouse.json';

export async function GET() {
  try {
    return NextResponse.json(evenementsData);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
