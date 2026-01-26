import { NextResponse } from "next/server";

export async function GET() {
  const voyages = [
    {
      id: 1,
      title: "Voyages Duclos - Accueil",
      url: "https://voyages-duclos.fr/",
      description: "Excursions au départ de Toulouse : circuits, séjours et escapades d'une journée.",
      tag: "Général",
      icon: "🚌"
    },
    {
      id: 2,
      title: "Shopping au Pas de la Case",
      url: "https://voyages-duclos.fr/journees-shopping-au-pasde-la-case/",
      description: "Navettes régulières pour vos journées shopping détaxé en Andorre.",
      tag: "Shopping",
      icon: "🛍️"
    },
    {
      id: 3,
      title: "Journées Plage",
      url: "https://voyages-duclos.fr/journees-plage/",
      description: "Évadez-vous sur le littoral méditerranéen le temps d'une journée ensoleillée.",
      tag: "Détente",
      icon: "🏖️"
    },
    {
      id: 4,
      title: "SkiGo - Saint Lary",
      url: "https://voyages-duclos.fr/journees-skigo-a-saint-lary/",
      description: "Transport + Forfait pour profiter des pistes pyrénéennes sans stress.",
      tag: "Sport",
      icon: "⛷️"
    },
    {
      id: 5,
      title: "Tisséo - Transports Urbains",
      url: "https://www.tisseo.fr/",
      description: "Métro, Tram et Bus pour vous déplacer facilement dans toute l'agglomération toulousaine.",
      tag: "Ville",
      icon: "🚇"
    }
  ];

  return NextResponse.json(voyages);
}
