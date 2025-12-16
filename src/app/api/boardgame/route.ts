// src/app/api/boardgame/route.ts (Proxy BGA - JSON API)

import { NextResponse } from 'next/server';

// ⚠️ REMPLACEZ PAR VOTRE VRAIE CLÉ BGA !
const BGA_CLIENT_ID = 'VOTRE_CLIENT_ID_BGA'; 
// Recherche de 'Ticket to Ride' pour l'exemple
const BGA_SEARCH_URL = `https://api.boardgameatlas.com/api/search?name=Ticket to Ride&client_id=${BGA_CLIENT_ID}`;

/**
 * Endpoint pour BGA (JSON API).
 */
export async function GET() {
  if (BGA_CLIENT_ID === 'VOTRE_CLIENT_ID_BGA') {
    return NextResponse.json({
        error: "Erreur de configuration: Clé API Board Game Atlas manquante ou invalide.",
        details: "Veuillez remplacer 'VOTRE_CLIENT_ID_BGA' dans route.ts par votre client_id BGA réel."
    }, { status: 500 });
  }

  try {
    const response = await fetch(BGA_SEARCH_URL, { cache: 'no-store' });

    if (!response.ok) {
        const errorDetails = await response.text();
        return NextResponse.json({
            error: `Erreur BGA: Code ${response.status} ${response.statusText}`,
            details: errorDetails
        }, { status: response.status });
    }

    // BGA renvoie du JSON, que nous traitons directement
    const jsonData = await response.json();
    
    return NextResponse.json({ 
      data: jsonData, 
      source: 'Board Game Atlas (JSON parsé)',
      search_term: 'Ticket to Ride'
    });

  } catch (error) {
    console.error("Erreur serveur BGA:", error);
    return NextResponse.json({ 
      error: `Erreur interne du serveur lors de l'appel BGA.`,
      details: error instanceof Error ? error.message : 'Détails non disponibles'
    }, { status: 500 });
  }
}
