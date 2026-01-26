import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      id: 1,
      title: "Atelier Lecture",
      url: "https://drive.google.com/drive/folders/1fZGhpWjlAXdFJRXPtukU5Ihntg36zfdC?usp=drive_link",
      description: "Club de lecture : ressources et partages autour des livres.",
      category: "Culture"
    },
    {
      id: 2,
      title: "300 Communautés WhatsApp",
      url: "https://drive.google.com/drive/folders/1IKdbnEYLYZre8xonDkVRmcz0BavYAU55?usp=drive_link",
      description: "Le répertoire ultime des groupes WhatsApp toulousains.",
      category: "Réseaux Sociaux"
    }
  ];
  return NextResponse.json(data);
}
