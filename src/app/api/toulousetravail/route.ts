import { NextResponse } from 'next/server';

export async function GET() {
  const opportunites = [
    {
      id: 1,
      nom: "EmploiLR - Agenda 31",
      description: "Calendrier des forums, salons de recrutement et jobs datings en Haute-Garonne.",
      type: "Agenda Régional",
      url: "https://www.emploilr.com/agenda/haute-garonne/",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      id: 2,
      nom: "Évoulus - Calendrier Emploi",
      description: "Les grandes dates des salons de l'emploi et de la formation à Toulouse (MEETT, Parc des Expos).",
      type: "Calendrier Salons",
      url: "https://toulouse.evous.fr/emploi-et-formation/calendrier-de-l-emploi.html",
      tagColor: "bg-orange-50 text-orange-700 border-orange-200"
    },
    {
      id: 3,
      nom: "France Travail - Événements",
      description: "Ateliers, forums et rencontres directes avec les recruteurs organisés par vos agences locales.",
      type: "Service Public",
      url: "https://mesevenementsemploi.francetravail.fr/mes-evenements-emploi/evenements",
      tagColor: "bg-blue-900 text-white border-transparent"
    },
    {
      id: 4,
      nom: "Toulouse Métropole Emploi",
      description: "Actualités officielles sur l'emploi, les dispositifs d'aide et les grands recrutements de la métropole.",
      type: "Métropole",
      url: "https://emploi.toulouse-metropole.fr/actualites-emploi-toulouse-metropole/",
      tagColor: "bg-pink-50 text-pink-700 border-pink-200"
    }
  ];

  // Tri alphabétique automatique
  const sortedData = opportunites.sort((a, b) => a.nom.localeCompare(b.nom));

  return NextResponse.json(sortedData);
}