import { NextResponse } from 'next/server';

export async function GET() {
  // Remplacer <rid> par l'identifiant de la ressource XML/CSV
  const rid = 'ton_rid_ici';
  const apiUrl = `https://tabular-api.data.gouv.fr/api/resources/${rid}/data/?page_size=1000`;

  const response = await fetch(apiUrl);
  const json = await response.json();

  // Filtrer pour Toulouse / Haute-Garonne si une colonne 'commune' ou 'departement' existe
  const traficToulouse = json.data.filter(
    (ligne: any) => ligne.departement === '31' // code INSEE Haute-Garonne
  );

  return NextResponse.json(traficToulouse);
}
