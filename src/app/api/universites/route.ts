// src/app/api/universites/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const universites = [
    { 
      name: "Université Toulouse Capitole (UT1)", 
      address: "2 Rue du Doyen-Gabriel-Marty, 31042 Toulouse",
      url: "https://www.ut-capitole.fr/accueil/universite/espace-media/actualites", 
      type: "Droit, Économie, Gestion" 
    },
    { 
      name: "Université Toulouse - Jean Jaurès (UT2J)", 
      address: "5 Allée Antonio Machado, 31058 Toulouse",
      url: "https://www.univ-tlse2.fr/accueil/agenda", 
      type: "Lettres, Langues, Sciences Humaines" 
    },
    { 
      name: "Université Toulouse III - Paul Sabatier (UT3)", 
      address: "118 Route de Narbonne, 31062 Toulouse",
      url: "https://www.univ-tlse3.fr/comprendre-l-universite/actualites", 
      type: "Sciences, Santé, Sport" 
    },
    { 
      name: "Toulouse INP (Polytechnique)", 
      address: "6 Allée Émile Monso, 31029 Toulouse",
      url: "https://www.inp-toulouse.fr/fr/actualites.html", 
      type: "Ingénierie, Innovation" 
    },
    { 
      name: "TBS Education", 
      address: "1 Place Alphonse Jourdain, 31000 Toulouse",
      url: "https://www.tbs-education.fr/actualites/", 
      type: "Business School" 
    },
    { 
      name: "ICT (Institut Catholique de Toulouse)", 
      address: "31 Rue de la Fonderie, 31000 Toulouse",
      url: "https://www.ict-toulouse.fr/nos-actualites/", 
      type: "Enseignement Privé" 
    }
  ];

  return NextResponse.json(universites);
}