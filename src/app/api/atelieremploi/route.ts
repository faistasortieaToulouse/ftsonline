import { NextResponse } from "next/server";

export async function GET() {
  const resources = [
    {
      id: 1,
      title: "Dossier Complet : Atelier Emploi sur le Drive",
      url: "https://drive.google.com/drive/folders/1cqy4Kmu9ZLDtiWRoQZvm69qrHsnBoKs1?usp=drive_link",
      description: "Accédez à l'ensemble des documents, guides et supports pour booster votre recherche d'emploi.",
      category: "Ressources Google Drive",
      type: "Dossier Partagé"
    }
  ];

  return NextResponse.json(resources);
}
