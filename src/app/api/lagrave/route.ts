import { NextResponse } from 'next/server';

export async function GET() {
  const cours = [
    { id: 1, nom: "Cour de la Maternité", position: "Nord-Ouest", description: "Ancien accès aux soins" },
    { id: 2, nom: "Cour Sainte-Anne", position: "Nord-Est", description: "Côté Garonne / Remparts" },
    { id: 3, nom: "Cour Saint-Joseph", position: "Centre (Dôme)", description: "Cour d'honneur principale" },
    { id: 4, nom: "Cour Sainte-Monique", position: "Sud-Ouest", description: "Extension du XVIIIe siècle" },
    { id: 5, nom: "Cour Saint-Vincent", position: "Sud-Est", description: "Côté Garonne" },
  ];

  return NextResponse.json(cours);
}