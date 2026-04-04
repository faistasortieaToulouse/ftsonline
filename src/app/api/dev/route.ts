import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Récupération des variables d'environnement
    const discordUrl = process.env.API_DEV_TOLOSA;
    const whatsappUrl = process.env.API_WA_DEV;

    // On prépare les données
    const devLinks = [
      {
        id: "discord-tolosa",
        title: "Serveur Discord Dev Tolosa",
        description: "Rejoindre le serveur de la communauté des développeurs.",
        url: discordUrl || "",
        category: "Communication",
        image: "/images/icons/discord.png", // Optionnel
        source: "Vercel Env",
      },
      {
        id: "whatsapp-dev",
        title: "Groupe WhatsApp Dev",
        description: "Échanges rapides et coordination de l'équipe.",
        url: whatsappUrl || "",
        category: "Communication",
        image: "/images/icons/whatsapp.png", // Optionnel
        source: "Vercel Env",
      }
    ];

    // On retourne le même format que ton autre API
    return NextResponse.json({ links: devLinks }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json(
      { links: [], error: err.message },
      { status: 500 }
    );
  }
}
