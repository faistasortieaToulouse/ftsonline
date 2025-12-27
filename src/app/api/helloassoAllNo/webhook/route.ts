import { NextResponse } from "next/server";

let notifications: any[] = []; // stockage en mémoire

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ajouter la notification en mémoire
    notifications.push({
      id: Date.now(),
      receivedAt: new Date().toISOString(),
      payload: body,
    });

    console.log("Notification HelloAsso reçue :", body);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur traitement webhook" }, { status: 500 });
  }
}

// 👉 Route GET pour récupérer les notifications
export async function GET() {
  return NextResponse.json({ notifications });
}
