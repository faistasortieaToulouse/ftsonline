import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), "data", "mairie");
    const fileContents = await fs.readFile(
      jsonDirectory + "/lieux-d-enseignement-culturel.json",
      "utf8"
    );
    
    const rawData = JSON.parse(fileContents);

    // 1. Tri par quartier (numérique) puis par nom (alphabétique)
    const sortedData = rawData.sort((a: any, b: any) => {
      // Tri par quartier
      const qA = parseFloat(a.eq_quartier) || 0;
      const qB = parseFloat(b.eq_quartier) || 0;
      if (qA !== qB) return qA - qB;
      
      // Si même quartier, tri par nom
      return a.eq_nom_equipement.localeCompare(b.eq_nom_equipement);
    });

    // 2. Formatage avec ID séquentiel pour les marqueurs
    const formattedData = sortedData.map((item: any, index: number) => ({
      id: index + 1, // Numéro d'ordre pour l'affichage
      nom: item.eq_nom_equipement,
      adresse: `${item.numero || ""} ${item.lib_off}, ${item.id_secteur_postal} ${item.eq_ville}`,
      telephone: item.eq_telephone,
      gestionnaire: item.eq_gestionnaire,
      siteWeb: item.eq_site_web,
      lat: item.geo_point_2d?.lat || null,
      lng: item.geo_point_2d?.lon || null,
      quartier: item.eq_quartier ? `Quartier ${item.eq_quartier}` : "Secteur non défini"
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}