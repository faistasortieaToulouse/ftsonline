import { NextResponse } from "next/server";

export async function GET() {
  const links = [
    {
      id: 1,
      title: "Toulouse Trafic",
      url: "https://toulousetrafic.com/",
      description: "L'état du trafic en temps réel sur le périphérique et les accès toulousains.",
      category: "Trafic Local",
      icon: "🚗"
    },
    {
      id: 2,
      title: "Bison Futé - Toulouse",
      url: "https://www.bison-fute.gouv.fr/toulouse,10265.html",
      description: "Prévisions nationales et conditions de circulation spécifiques au secteur de Toulouse.",
      category: "Info Route",
      icon: "🚥"
    },
    {
      id: 3,
      title: "Critères Location Voiture sur le Drive",
      url: "https://drive.google.com/drive/folders/1R1ArgHXyCokp8DPhOv4pnBS-VUdKbRfT?usp=drive_link",
      description: "Consultez les points essentiels à vérifier lors de l'état des lieux d'une location.",
      category: "Location / Google Drive",
      icon: "📄"
    },
    {
      id: 4,
      title: "Conseils Location Voiture sur le Drive",
      url: "https://drive.google.com/drive/folders/13QFsVRUBgQDFmGwMpfbuHyVjyZH-wkCx?usp=drive_link",
      description: "Guide et astuces pour éviter les pièges lors de la location d'un véhicule.",
      category: "Location / Google Drive",
      icon: "💡"
    }
  ];

  return NextResponse.json(links);
}
