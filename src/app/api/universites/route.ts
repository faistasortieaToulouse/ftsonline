// src/app/api/universites/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const universites = [
    { 
      name: "Université Toulouse Capitole (UT1)", 
      address: "2 Rue du Doyen-Gabriel-Marty, 31042 Toulouse",
      url: "https://www.ut-capitole.fr/accueil/universite/espace-media/actualites", 
      type: "Droit, Économie, Gestion",
      lat: 43.6062, 
      lng: 1.4375 
    },
    { 
      name: "Université Toulouse - Jean Jaurès (UT2J)", 
      address: "5 Allée Antonio Machado, 31058 Toulouse",
      url: "https://www.univ-tlse2.fr/accueil/agenda", 
      type: "Lettres, Langues, Sciences Humaines",
      lat: 43.5794, 
      lng: 1.4026 
    },
    { 
      name: "Université Toulouse III - Paul Sabatier (UT3)", 
      address: "118 Route de Narbonne, 31062 Toulouse",
      url: "https://www.univ-tlse3.fr/comprendre-l-universite/actualites", 
      type: "Sciences, Santé, Sport",
      lat: 43.5613, 
      lng: 1.4684 
    },
    { 
      name: "Toulouse INP (Polytechnique)", 
      address: "6 Allée Émile Monso, 31029 Toulouse",
      url: "https://www.inp-toulouse.fr/fr/actualites.html", 
      type: "Ingénierie, Innovation",
      lat: 43.5545, 
      lng: 1.4988 
    },
    { 
      name: "TBS Education", 
      address: "1 Place Alphonse Jourdain, 31000 Toulouse",
      url: "https://www.tbs-education.fr/actualites/", 
      type: "Business School",
      lat: 43.6105, 
      lng: 1.4328 
    },
    { 
      name: "ICT (Institut Catholique de Toulouse)", 
      address: "31 Rue de la Fonderie, 31000 Toulouse",
      url: "https://www.ict-toulouse.fr/nos-actualites/", 
      type: "Enseignement Privé",
      lat: 43.5955, 
      lng: 1.4423 
    }
  ];

  return NextResponse.json(universites);
}