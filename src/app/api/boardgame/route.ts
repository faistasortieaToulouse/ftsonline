// src/app/api/boardgame/route.ts

import { NextResponse } from 'next/server';

const BGG_CATAN_ID = 92;
// L'URL de l'API BGG XML2 est souvent juste 'https://boardgamegeek.com/xmlapi2/'
const BGG_API_URL = `https://boardgamegeek.com/xmlapi2/thing?id=${BGG_CATAN_ID}&stats=1`;

/**
 * Fonction GET pour récupérer les données d'un jeu de société depuis BGG.
 */
export async function GET() {
  try {
    // 1. Appel à l'API externe (Board Game Geek)
    const response = await fetch(BGG_API_URL, {
      // Configuration de la requête pour la rendre plus "amicale"
      // L'API BGG est sensible à la fréquence de requêtes
      // En l'absence d'User-Agent, certains serveurs peuvent le refuser.
      // Nous ajoutons un User-Agent simple.
      headers: {
         'User-Agent': 'BoardGameApp-PersonalProject/1.0',
         'Accept': 'application/xml', // Optionnel, mais explicite
      },
      // Pas besoin de revalidate ici, BGG API est lente et on veut les données
      cache: 'no-store', // S'assurer qu'il ne s'agit pas d'une vieille requête mise en cache
    });
    
    // NOTE TRÈS IMPORTANTE POUR BGG : L'API peut renvoyer 200 OK avec un corps vide
    // si elle est surchargée. Nous vérifions si la réponse est OK.
    if (!response.ok) {
        // Si l'erreur est un 404, 500, etc.
        const errorText = await response.text(); 
        console.error(`Erreur BGG: ${response.status} - ${errorText}`);
        return NextResponse.json({ 
            error: `Erreur lors de la récupération des données de BGG: Code ${response.status} ${response.statusText}`
        }, { status: 500 });
    }

    // 2. Traitement des données XML (Retourne du XML non parsé)
    const xmlText = await response.text();

    // 3. Vérification du corps de la réponse
    // Si la réponse est vide (le cas de surcharge de BGG)
    if (!xmlText || xmlText.includes('Not found')) {
        return NextResponse.json({
            error: 'L\'API BGG a retourné une réponse vide ou non trouvée. Réessayez plus tard.',
        }, { status: 503 }); // 503 Service Unavailable est plus approprié pour une surcharge
    }

    // 4. Retourner le résultat
    return NextResponse.json({ 
      data: xmlText, 
      source: 'Board Game Geek (XML non parsé)' 
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ 
      error: `Erreur interne du serveur lors de l'appel API.`,
      details: error instanceof Error ? error.message : 'Détails non disponibles'
    }, { status: 500 });
  }
}
