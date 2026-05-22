import { NextResponse } from 'next/server';

// OpenDataSoft vigilance météo départements 11 + 31 (J = aujourd'hui)
const URL_OPEN_DATA =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records?where=domain_id%20in%20(%2211%22%2C%2231%22)%20AND%20echeance%3D%22J%22&limit=50";

// Mapping couleurs UI
const COULEURS: Record<string, { label: string; couleur: string }> = {
  vert: { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
  jaune: { label: "Jaune - Soyez attentif", couleur: "bg-yellow-400 text-black" },
  orange: { label: "Orange - Soyez très vigilant", couleur: "bg-orange-500 text-white animate-pulse" },
  rouge: { label: "Rouge - Vigilance absolue", couleur: "bg-red-600 text-white font-bold animate-bounce" },
};

export async function GET() {
  try {
    const response = await fetch(URL_OPEN_DATA, {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      console.error(`Erreur HTTP OpenDataSoft: ${response.status}`);
      return NextResponse.json(
        { error: "Le serveur de données public ne répond pas." },
        { status: 502 }
      );
    }

    const json = await response.json();
    const records = json.results || [];

    // Séparation par département
    const lignes31 = records.filter((r: any) => r.domain_id === "31");
    const lignes11 = records.filter((r: any) => r.domain_id === "11");

    // Fonction couleur max
    const obtenirCouleurMax = (lignes: any[]) => {
      if (lignes.some(r => r.color === "rouge")) return "rouge";
      if (lignes.some(r => r.color === "orange")) return "orange";
      if (lignes.some(r => r.color === "jaune")) return "jaune";
      return "vert";
    };

    const couleurMax31 = obtenirCouleurMax(lignes31);
    const couleurMax11 = obtenirCouleurMax(lignes11);

    // Risques actifs
    const extraireRisquesActifs = (lignes: any[]) => {
      return lignes
        .filter((r: any) => r.color !== "vert" && r.phenomenon)
        .map((r: any) => ({
          nom: r.phenomenon.charAt(0).toUpperCase() + r.phenomenon.slice(1),
          couleur: COULEURS[r.color] || { label: "Inconnu", couleur: "bg-gray-500" }
        }));
    };

    // 🔵 LUCHON (vue logique basée sur le 31)
    const couleurMaxLuchon = couleurMax31;
    const risquesLuchon = extraireRisquesActifs(lignes31);

    const resultats = {
      misAJour: records[0]?.product_datetime || new Date().toISOString(),
      stations: [
        {
          nom: "Toulouse (Haute-Garonne)",
          codeDep: "31",
          couleurMax: COULEURS[couleurMax31],
          risques: extraireRisquesActifs(lignes31)
        },
        {
          nom: "Bagnères-de-Luchon (Haute-Garonne)",
          codeDep: "31",
          couleurMax: COULEURS[couleurMaxLuchon],
          risques: risquesLuchon
        },
        {
          nom: "Lézignan-Corbières (Aude)",
          codeDep: "11",
          couleurMax: COULEURS[couleurMax11],
          risques: extraireRisquesActifs(lignes11)
        }
      ]
    };

    return NextResponse.json(resultats);

  } catch (error: any) {
    console.error("Erreur dans la route API Vigilance:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données", details: error.message },
      { status: 500 }
    );
  }
}
