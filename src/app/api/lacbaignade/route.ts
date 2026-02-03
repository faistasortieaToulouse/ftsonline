import { NextResponse } from 'next/server';
import lacsData from '../../../../public/data/occitanie/lacs.json';
// On importe directement le JSON. 
// Next.js va l'inclure dans le bundle de l'API.

export async function GET() {
  try {
    return NextResponse.json(lacsData);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" }, 
      { status: 500 }
    );
  }
}
