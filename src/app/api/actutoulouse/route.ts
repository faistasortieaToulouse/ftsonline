// src/app/api/actutoulouse/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Point de terminaison API trouvé pour les événements d'Actu.fr/Infolocale
  const API_URL = "https://infolocale.actu.fr/api/lps/31555";
  
  try {
    // 1. Appel de l'API externe
    // Ajout de headers pour simuler une requête de navigateur et augmenter la compatibilité
    const res = await fetch(API_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS Fetch)',
            'Accept': 'application/json',
        },
    }); 

    // 2. Vérification des erreurs HTTP (par exemple, 404, 500)
    if (!res.ok) {
      const errorDetails = await res.text();
      console.error(
        `External API (Actu.fr) failed with status ${res.status}. Preview: ${errorDetails.substring(0, 150)}`
      );
      
      // Renvoie un statut 502 Bad Gateway au client pour indiquer l'échec de la source externe
      return NextResponse.json(
        { error: `External Data Fetch Failed with status: ${res.status}` },
        { status: 502 }
      );
    }

    // 3. Parsing de la réponse JSON
    const data = await res.json(); 
    
    // 4. Extraction du tableau d'événements
    // Nous utilisons la logique trouvée par succès, en supposant que le tableau se trouve 
    // sous 'events' (structure OpenDataSoft) ou à la racine de la réponse.
    const eventsArray = data.events || data.items || (Array.isArray(data) ? data : []);

    // 5. Retour des données
    // Le composant de page (page.tsx) attend la clé 'records'
    return NextResponse.json({ records: eventsArray });

  } catch (err) {
    // Gère les erreurs de réseau ou de parsing JSON inattendu
    console.error("API ERROR during fetch or JSON parsing:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}