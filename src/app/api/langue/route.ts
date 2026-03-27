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
      title: "Happy People 31",
      url: "http://www.happyPeople.fr.nf/",
      description: "Communauté pour faire des rencontres et pratiquer les langues.",
      tag: "Social"
    },
    {
      id: 3,
      title: "Happy People Toulouse",
      url: "http://www.happyPeople.fr.nf/",
      description: "Communauté pour faire des rencontres et pratiquer les langues.",
      tag: "Social"
    },
    {
      id: 4,
      title: "Café des langues au Terminus des Prétentieux",
      url: "https://www.ville-colomiers.fr/1/mon-quotidien/espace-citoyens/terminus-des-pretentieux",
      description: "Café associatif à Colomiers qui organise un café des langues.",
      tag: "Portail"
    },
        {
      id: 5,
      title: "Café des langues à Colomiers",
      url: "https://www.facebook.com/auterminusdespretentieux/",
      description: "Café des langues le mercredi de 14h à 16h.",
      tag: "Portail"
    },
    {
      id: 6,
      title: "Déclic Toulousain",
      url: "http://www.happypeople.biz.st/",
      description: "Happy People, Site Web ou sur Facebook.",
      tag: "Portail"
    },
    {
      id: 7,
      title: "Atelier FLE sur le Drive",
      url: "https://drive.google.com/drive/folders/1_V-3M7AXzYW1ix1lbS4n_wrnRjrZceo8?usp=drive_link",
      description: "Français Langue Étrangère : supports et ressources pédagogiques.",
      tag: "Google Drive"
    }
  ];
  return NextResponse.json(data);
}
