import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, date, time } = data;

    // Validation
    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    // Ici vous pouvez ajouter l'envoi d'email (Resend, Nodemailer) 
    // ou l'insertion en base de données (Prisma, Supabase)
    console.log(`[Rendez-vous Rue Bornier] Nouveau message de ${name} (${email}) pour le ${date} à ${time}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
