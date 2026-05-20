import { NextResponse } from 'next/server';

// URL stable du flux de vigilance de Météo-France sur data.gouv.fr
const URL_VIGILANCE = "https://files.data.gouv.fr/meteofrance/data/Vigilance/vignette_j.json";

// Correspondance des codes couleurs Météo-France
const COULEURS: Record<number, { label: string; couleur: string }> = {
  1: { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
  2: { label: "Jaune - Soyez attentif", couleur: "bg-yellow-400 text-black" },
  3: { label: "Orange - Soyez très vigilant", couleur: "bg-orange-500 text-white animate-pulse" },
  4: { label: "Rouge - Vigilance absolue", couleur: "bg-red-600 text-white font-bold animate-bounce" },
};

// Correspondance des codes phénomènes
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
    const response = await fetch(URL_VIGILANCE, {
      next: { revalidate: 1800 } // Cache de 30 minutes pour éviter de surcharger le serveur
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les données météo");
    }

    const data = await response.json();

    // Extraction des données brutes pour le 31 et le 11
    const raw31 = data.depts["31"];
    const raw11 = data.depts["11"];

    // Formatage propre des données
    const resultats = {
      misAJour: data.update_time,
      stations: [
        {
          nom: "Toulouse (Haute-Garonne)",
          codeDep: "31",
          couleurMax: COULEURS[raw31.max_color] || { label: "Inconnu", couleur: "bg-gray-400" },
          risques: raw31.phenoms.map((p: any) => ({
            nom: PHENOMENES[p.phenom] || "Autre risque",
            couleur: COULEURS[p.color]
          }))
        },
        {
          nom: "Lézignan-Corbières (Aude)",
          codeDep: "11",
          couleurMax: COULEURS[raw11.max_color] || { label: "Inconnu", couleur: "bg-gray-400" },
          risques: raw11.phenoms.map((p: any) => ({
            nom: PHENOMENES[p.phenom] || "Autre risque",
            couleur: COULEURS[p.color]
          }))
        }
      ]
    };

    return NextResponse.json(resultats);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du bulletin de vigilance" },
      { status: 500 }
    );
  }
}
