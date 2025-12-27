import { NextResponse } from 'next/server';

export async function GET() {
  const cours = [
    { 
      id: 1, 
      nom: "Cour d'Honneur", 
      position: "Entrée Principale", 
      description: "Cour majestueuse accueillant les visiteurs à l'entrée du complexe." 
    },
    { 
      id: 2, 
      nom: "Cour de la Pharmacie", 
      position: "Nord", 
      description: "Située à proximité de l'ancienne apothicairerie historique." 
    },
    { 
      id: 3, 
      nom: "Cour Sainte-Monique", 
      position: "Sud", 
      description: "Cour calme souvent associée aux anciens services administratifs." 
    },
    { 
      id: 4, 
      nom: "Cour du Pèlerin", 
      position: "Côté Garonne", 
      description: "Rappelant le rôle de l'Hôtel-Dieu sur le chemin de Saint-Jacques-de-Compostelle." 
    },
  ];

  return NextResponse.json(cours);
}