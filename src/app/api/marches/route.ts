import { NextResponse } from "next/server";
import marches from "../../../../data/mairie/marches-couverts-et-de-plein-vent.json";

function getCommune(codePostal: number | null, nom: string): string {
  if (nom.toUpperCase().includes("LEGION")) return "Toulouse";
  if (!codePostal || codePostal === -9999) return "Toulouse";

  if (codePostal === 31130) return "Balma";
  if (codePostal === 31170) return "Tournefeuille";
  if (String(codePostal).startsWith("31")) return "Toulouse";

  return "Commune inconnue";
}

export async function GET() {
  const data = marches.map((m: any, index: number) => {
    const isLegion = m.nom?.toUpperCase().includes("LEGION");

    const adresse = isLegion
      ? "Place de la Légion d'Honneur"
      : m.adresse ?? "Adresse non renseignée";

    const codePostal = isLegion
      ? 31500
      : m.code_postal ?? null;

    const commune = getCommune(codePostal, m.nom);

    return {
      id: index,
      nom: m.nom,
      type: m.type,
      adresse,
      code_postal: codePostal,
      commune,
      jours_de_tenue: m.jours_de_tenue,
      horaires: {
        lundi: m.lundi,
        mardi: m.mardi,
        mercredi: m.mercredi,
        jeudi: m.jeudi,
        vendredi: m.vendredi,
        samedi: m.samedi,
        dimanche: m.dimanche,
      },
      lat: m.geo_point_2d.lat,
      lon: m.geo_point_2d.lon,
    };
  });

  return NextResponse.json(data);
}
