import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dans un cas réel, vous feriez un fetch vers l'API Tisséo ici
    // avec vos credentials (API Key).
    const data = [
      {
        file: {
          thumbnail: false,
          filename: "documentation developpeur api 2.1 [fr].pdf",
          format: "pdf",
          id: "99ed97783e2ad57c59ece8e60ff4db98",
          url: "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/api-temps-reel-tisseo/files/99ed97783e2ad57c59ece8e60ff4db98"
        }
      }
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 });
  }
}
