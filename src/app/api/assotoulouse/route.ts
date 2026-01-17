import { NextResponse } from 'next/server';

export async function GET() {
  const sources = [
    { 
      id: 1,
      nom: "HelloAsso — Ville de Toulouse", 
      description: "Accédez à tous les projets, clubs de sport et événements culturels portés par les associations situées spécifiquement à Toulouse.",
      type: "Échelle Communale",
      url: "https://www.helloasso.com/e/reg/occitanie/dep/haute-garonne/ville/toulouse",
      color: "bg-rose-50 border-rose-200 text-rose-700"
    },
    { 
      id: 2,
      nom: "HelloAsso — Haute-Garonne (31)", 
      description: "Découvrez l'ensemble de la vie associative du département 31 : des activités rurales aux grands événements métropolitains.",
      type: "Échelle Départementale",
      url: "https://www.helloasso.com/e/reg/occitanie/dep/haute-garonne",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700"
    }
  ];

  return NextResponse.json(sources);
}