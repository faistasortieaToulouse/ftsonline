import { NextResponse } from 'next/server';

// URL stable alternative de secours directement reliée au flux open data rafraîchi
const URL_VIGILANCE = "https://files.data.gouv.fr/meteofrance/data/Vigilance/vignette_j.json";

const COULEURS: Record<number, { label: string; couleur: string }> = {
  1: { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
  2: { label: "Jaune - Soyez attentif", couleur: "bg-yellow-400 text-black" },
  3: { label: "Orange - Soyez très vigilant", couleur: "bg-orange-500 text-white animate-pulse" },
  4: { label: "Rouge - Vigilance absolue", couleur: "bg-red-600 text-white font-bold animate-bounce" },
};

const PHENOMENES: Record<number, string> = {
  1: "Vent violent",
  2: "Pluie-Inondation",
  3: "Orages",
  4: "Crues",
  5: "Grand froid",
  6: "Canicule",
  7: "Neige-Verglas",
  8: "Vagues-Submersion",
  9: "Avalanches",
};

export async function GET() {
  try {
    // Ajout d'un User-Agent pour éviter que data.gouv.fr ne bloque la fonction Vercel (Erreur 403/500)
    const response = await fetch(URL_VIGILANCE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 900 } // Réduit à 15 minutes d'antémémoire
    });

    if (!response.ok) {
      console.error(`Erreur HTTP Météo-France: ${response.status}`);
      return NextResponse.json({ error: `Le serveur distant a répondu avec un statut ${response.status}` }, { status: 502 });
    }

    const data = await response.json();

    // Vérification de sécurité pour s'assurer que la structure attendue existe bien
    if (!data || !data.depts) {
      console.error("Structure JSON invalide reçue de Météo-France", data);
      return NextResponse.json({ error: "Données météo malformées" }, { status: 502 });
    }

    const raw31 = data.depts["31"] || { max_color: 1, phenoms: [] };
    const raw11 = data.depts["11"] || { max_color: 1, phenoms: [] };

    const resultats = {
      misAJour: data.update_time || new Date().toISOString(),
      stations: [
        {
          nom: "Toulouse (Haute-Garonne)",
          codeDep: "31",
          couleurMax: COULEURS[raw31.max_color] || { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
          risques: (raw31.phenoms || []).map((p: any) => ({
            nom: PHENOMENES[p.phenom] || "Autre risque",
            couleur: COULEURS[p.color] || { label: "Vert", couleur: "bg-green-500" }
          }))
        },
        {
          nom: "Lézignan-Corbières (Aude)",
          codeDep: "11",
          couleurMax: COULEURS[raw11.max_color] || { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
          risques: (raw11.phenoms || []).map((p: any) => ({
            nom: PHENOMENES[p.phenom] || "Autre risque",
            couleur: COULEURS[p.color] || { label: "Vert", couleur: "bg-green-500" }
          }))
        }
      ]
    };

    return NextResponse.json(resultats);
  } catch (error: any) {
    console.error("Erreur crash API Vigilance:", error);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du bulletin", details: error.message },
      { status: 500 }
    );
  }
}
