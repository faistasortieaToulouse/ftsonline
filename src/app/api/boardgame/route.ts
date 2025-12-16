// src/app/api/boardgame/route.ts

import { NextResponse } from 'next/server';

// ID Board Game Geek pour "Catan" (ID: 92) pour l'exemple
const BGG_CATAN_ID = 92; 
const BGG_API_URL = `https://boardgamegeek.com/xmlapi2/thing?id=${BGG_CATAN_ID}&stats=1`;

/**
 * Fonction GET pour récupérer les données d'un jeu de société depuis BGG.
 * Cette API interne agit comme un proxy.
 */
export async function GET() {
  try {
    // 1. Appel à l'API externe (Board Game Geek)
    const response = await fetch(BGG_API_URL, {
      // Optionnel : Mise en cache pour améliorer les performances si les données ne changent pas souvent
      next: { revalidate: 3600 }, // Revalidation toutes les heures
    });

    if (!response.ok) {
      // Gérer les erreurs de l'API externe
      return NextResponse.json({ 
        error: `Erreur lors de la récupération des données de BGG: ${response.statusText}` 
      }, { status: response.status });
    }

    // 2. Traitement des données XML
    // NOTE: L'API BGG renvoie du XML. Pour une application réelle,
    // vous devriez utiliser une librairie (ex: xml2js) pour parser le XML en JSON.
    // Pour cet exemple simple, nous renvoyons le XML brut comme texte pour démonstration.
    const xmlText = await response.text();

    // 3. Retourner le résultat (en XML pour cet exemple, mais idéalement en JSON parsé)
    // IMPORTANT: Pour éviter des erreurs CORS et de format, on le renvoie comme JSON
    // en encapsulant le texte XML.
    return NextResponse.json({ 
      data: xmlText, 
      source: 'Board Game Geek (XML non parsé)' 
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur lors de l\'appel API.' 
    }, { status: 500 });
  }
}
