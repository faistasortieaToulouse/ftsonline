import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    langues: [
      {
        id: 1,
        title: "Bilingue 31",
        url: "http://www.bilingue.fr.nf/",
        description: "Ressources et échanges pour le bilinguisme à Toulouse.",
        type: "Site Web"
      },
      {
        id: 2,
        title: "Happy People Toulouse",
        url: "http://www.happyPeople.fr.nf/",
        description: "Communauté dynamique pour faire des rencontres et pratiquer les langues.",
        type: "Site Web"
      },
      {
        id: 3,
        title: "Déclic Toulousain",
        url: "http://declictoulousain.fr.nf/",
        description: "Le portail communautaire pour tout savoir sur la vie locale.",
        type: "Portail"
      },
      {
        id: 4,
        title: "Atelier FLE sur le Drive",
        url: "https://drive.google.com/drive/folders/1_V-3M7AXzYW1ix1lbS4n_wrnRjrZceo8?usp=drive_link",
        description: "Supports de cours et exercices pour le Français Langue Étrangère.",
        type: "Google Drive"
      }
    ],
    communautes: [
      {
        id: 5,
        title: "Atelier Lecture sur le Drive",
        url: "https://drive.google.com/drive/folders/1fZGhpWjlAXdFJRXPtukU5Ihntg36zfdC?usp=drive_link",
        description: "Club de lecture : partage de fiches et de conseils de lecture.",
        type: "Club / Drive"
      },
      {
        id: 6,
        title: "300 Communautés WhatsApp sur le Drive",
        url: "https://drive.google.com/drive/folders/1IKdbnEYLYZre8xonDkVRmcz0BavYAU55?usp=drive_link",
        description: "Liste exhaustive des groupes WhatsApp par thématiques à Toulouse.",
        type: "Réseaux / Drive"
      }
    ]
  };

  return NextResponse.json(data);
}
