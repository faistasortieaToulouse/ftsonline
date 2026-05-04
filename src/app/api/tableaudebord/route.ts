import { NextResponse } from 'next/server';

export async function GET() {
  // Cette route peut servir à l'avenir pour récupérer dynamiquement 
  // les liens ou vérifier l'état des sous-domaines (Up/Down)
  return NextResponse.json({
    message: "Tableau de Bord API opérationnel",
    timestamp: new Date().toISOString(),
    config: "FTS Toulouse Dashboard"
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Logique pour enregistrer des clics ou des logs de navigation
    console.log("Action enregistrée sur le dashboard :", data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
