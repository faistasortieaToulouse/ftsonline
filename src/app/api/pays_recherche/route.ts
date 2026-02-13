import { NextResponse } from 'next/server';
import researchData from '../../../../data/statistiques/tri_pays_recherche.json';

export async function GET() {
  const metadata = {
    title: "Investissement Mondial en Recherche & Développement (2026)",
    definition: "Classement basé sur les dépenses intérieures brutes de R&D (DIRD). Cet indicateur reflète la capacité d'innovation d'une nation.",
    methodology: "Données exprimées en Milliards de USD et en intensité (% du PIB)."
  };

  // On renvoie un objet qui contient metadata ET les données du JSON
  return NextResponse.json({ 
    metadata, 
    data: researchData 
  });
}
