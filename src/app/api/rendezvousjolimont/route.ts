import { NextResponse } from 'next/server';

export async function GET() {
  const rdv = {
    nom: "Station Métro Jolimont",
    adresse: "Sortie de station de métro Jolimont, 31500 Toulouse",
    coords: [43.614966, 1.462906],
    instructions: "Rendez-vous devant l'entrée principale, au niveau du parking relais."
  };

  return NextResponse.json(rdv);
}
