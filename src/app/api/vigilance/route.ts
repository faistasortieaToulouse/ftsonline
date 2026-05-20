import { NextResponse } from 'next/server';

// URL stable, publique et sans Token fournie par la plateforme OpenData (OpenDataSoft)
const URL_OPEN_DATA = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records?where=code_departement%20in%20(%2211%22%2C%2231%22)&limit=2";

// Correspondance des couleurs de vigilance
const COULEURS: Record<string, { label: string; couleur: string }> = {
  "Vert": { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
  "Jaune": { label: "Jaune - Soyez attentif", couleur: "bg-yellow-400 text-black" },
  "Orange": { label: "Orange - Soyez très vigilant", couleur: "bg-orange-500 text-white animate-pulse" },
  "Rouge": { label: "Rouge - Vigilance absolue", couleur: "bg-red-600 text-white font-bold animate-bounce" },
};

export async function GET() {
  try {
    // Requête simple sans aucun Header d'autorisation ou de Token !
    const response = await fetch(URL_OPEN_DATA, {
      next: { revalidate: 900 } // Cache de 15 minutes sur Vercel
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Erreur serveur open data (${response.status})` }, { status: 502 });
    }

    const json = await response.json();
    const records = json.results || [];

    // Recherche des lignes pour le 31 et le 11
    const data31 = records.find((r: any) => r.code_departement === "31");
    const data11 = records.find((r: any) => r.code_departement === "11");

    const resultats = {
      misAJour: data31?.date || new Date().toISOString(),
      stations: [
        {
          nom: "Toulouse (Haute-Garonne)",
          codeDep: "31",
          // Récupération de la couleur du jour (ex: "Vert", "Jaune", "Orange")
          couleurMax: COULEURS[data31?.couleur_couleur || "Vert"] || { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
          // Liste des risques actifs extraits du texte de l'API
          risques: data31?.risque_valeur && data31.risque_valeur !== "Pas de vigilance particulière" 
            ? [{ nom: data31.risque_valeur, couleur: COULEURS[data31.couleur_couleur] }] 
            : []
        },
        {
          nom: "Lézignan-Corbières (Aude)",
          codeDep: "11",
          couleurMax: COULEURS[data11?.couleur_couleur || "Vert"] || { label: "Vert - RAS", couleur: "bg-green-500 text-white" },
          risques: data11?.risque_valeur && data11.risque_valeur !== "Pas de vigilance particulière" 
            ? [{ nom: data11.risque_valeur, couleur: COULEURS[data11.couleur_couleur] }] 
            : []
        }
      ]
    };

    return NextResponse.json(resultats);
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur lors du traitement", details: error.message }, { status: 500 });
  }
}
