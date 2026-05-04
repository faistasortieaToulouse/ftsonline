import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, date, time } = body;

    // Validation sommaire
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { message: "Champs manquants" },
        { status: 400 }
      );
    }

    // Logique serveur (Ex: Envoyer un mail avec Nodemailer ou enregistrer en DB)
    console.log("Nouveau rendez-vous reçu :", { name, email, date, time });

    return NextResponse.json(
      { message: "Rendez-vous enregistré avec succès" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
