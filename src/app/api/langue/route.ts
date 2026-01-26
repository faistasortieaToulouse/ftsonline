import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: 1,
      title: "Bilingue 31",
      url: "http://www.bilingue.fr.nf/",
      description: "Ressources et échanges pour le bilinguisme à Toulouse.",
      tag: "Échanges"
    },
    {
      id: 2,
      title: "Happy People Toulouse",
      url: "http://www.happyPeople.fr.nf/",
      description: "Communauté pour faire des rencontres et pratiquer les langues.",
      tag: "Social"
    },
    {
      id: 3,
      title: "Déclic Toulousain",
      url: "http://declictoulousain.fr.nf/",
      description: "Portail toulousain pour la vie locale et communautaire.",
      tag: "Portail"
    },
    {
      id: 4,
      title: "Atelier FLE sur le Drive",
      url: "https://drive.google.com/drive/folders/1_V-3M7AXzYW1ix1lbS4n_wrnRjrZceo8?usp=drive_link",
      description: "Français Langue Étrangère : supports et ressources pédagogiques.",
      tag: "Google Drive"
    }
  ];
  return NextResponse.json(data);
}
