// src/app/api/jeusociete/route.ts (Proxy BGG - XML API2)

import { NextResponse } from 'next/server';

const BGG_CATAN_ID = 92;
const BGG_API_URL = `https://boardgamegeek.com/xmlapi2/thing?id=${BGG_CATAN_ID}&stats=1`;

/**
 * Endpoint pour BGG (XML API2).
 * Tente de contourner le 401 en ajoutant un User-Agent.
 */
export async function GET() {
  try {
    const response = await fetch(BGG_API_URL, {
      headers: {
         'User-Agent': 'BoardGameApp-BGG-Integration/1.0',
         'Accept': 'application/xml',
      },
      cache: 'no-store', // Important pour éviter les erreurs 401 mises en cache
    });
    
    // Gérer les erreurs (y compris l'inattendu 401 de BGG)
    if (!response.ok) {
        return NextResponse.json({ 
            error: `Erreur lors de la récupération des données BGG: Code ${response.status} ${response.statusText}`,
            details: `Vérifiez si l'API BGG est surchargée ou si votre IP est bloquée.`
        }, { status: response.status });
    }

    // BGG renvoie du XML
    const xmlText = await response.text();

    // Renvoie le XML brut (pour ne pas introduire de dépendance de parsing dans l'exemple)
    return NextResponse.json({ 
      data: xmlText, 
      source: 'Board Game Geek (XML non parsé)',
      game_id: BGG_CATAN_ID
    });

  } catch (error) {
    console.error("Erreur serveur BGG:", error);
    return NextResponse.json({ 
      error: `Erreur interne du serveur lors de l'appel BGG.`,
      details: error instanceof Error ? error.message : 'Détails non disponibles'
    }, { status: 500 });
  }
}
