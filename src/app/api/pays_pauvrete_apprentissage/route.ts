// src/app/api/pays_pauvrete_apprentissage/route.ts
import { NextResponse } from 'next/server';

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

  const data = [
    // ... Insérez ici votre tableau JSON complet ...
    {"rang": 1, "pays": "Singapour", "taux_lp": "0,0%", "analyse": "Méritocratie & Tech", "particularite": "Les enseignants sont recrutés parmi les top 5% diplômés."},
    // etc... jusqu'au rang 121
  ];

  return NextResponse.json({ metadata, data });
}
