import { NextResponse } from 'next/server';
// Importation directe du fichier JSON
import learningPovertyData from '@/data/statistiques/tri_pays_pauvrete_apprentissage.json';

export async function GET() {
  const metadata = {
    title: "Pauvreté d'Apprentissage : Classement Mondial 2026",
    definition: "La pauvreté d'apprentissage mesure la part d'enfants de 10 ans incapables de lire et comprendre un texte simple. C'est un indicateur critique du capital humain futur d'une nation.",
    methodology_notes: [
      "Taux LP : Part des enfants de 10 ans en situation de pauvreté d'apprentissage.",
      "Analyse : Facteur structurel déterminant la performance du pays.",
      "Particularité : Fait saillant ou réforme spécifique au système éducatif local."
    ]
  };

  // On renvoie directement les données importées du JSON
  return NextResponse.json({ 
    metadata, 
    data: learningPovertyData 
  });
}
