import { NextResponse } from 'next/server';
// On remonte 4 fois pour atteindre la racine
import lacsData from '../../../../data/occitanie/lacs.json';

export async function GET() {
  try {
    return NextResponse.json(lacsData);
  } catch (error) {
    console.error("Erreur API Lacs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" }, 
      { status: 500 }
    );
  }
}