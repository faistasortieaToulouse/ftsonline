import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    /* ===============================
       1. Charger lacs existants (JSON)
       =============================== */
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "lacs.json"
    );

    let lacsCentre: any[] = [];

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const rawData = JSON.parse(fileContents);

      if (Array.isArray(rawData)) {
        lacsCentre = rawData;
      }
    }

    /* ===============================
       2. Lacs de TOULOUSE (Ajouts manuels)
       =============================== */
    const lacsToulouseManuels = [
      {
        nom: "Lac de THIBAULT",
        lat: 43.553986,
        lng: 1.401019,
      },
      {
        nom: "Balastières",
        lat: 43.553768,
        lng: 1.435361,
      },
      {
        nom: "Balastières",
        lat: 43.550809,
        lng: 1.435144,
      },
      {
        nom: "Balastières",
        lat: 43.549105,
        lng: 1.434793,
      },
    ];

    /* ===============================
       3. Lacs de BANLIEUE (en dur)
       =============================== */
    const lacsBanlieue = [
      {
        nom: "Balastières (Portet-sur-Garonne)",
        lat: 43.544127,
        lng: 1.428277,
      },
      {
        nom: "Ramiers de Palayre (Portet-sur-Garonne)",
        lat: 43.544127,
        lng: 1.429467,
      },
      {
        nom: "Lac des Quinze Sols (Blagnac)",
        lat: 43.662685,
        lng: 1.398310,
      },
      {
        nom: "Lac de Lacourtensourt (Aucamville)",
        lat: 43.6661, // Coordonnées ajustées sur le bleu du lac
        lng: 1.4202,
      },
      {
        nom: "Lac de Saint-Caprais (L'Union)",
        lat: 43.66218, // Coordonnées ajustées JFVJ+VMX
        lng: 1.49218,
      },
      {
        nom: "Lac de la Justice (Labège)",
        lat: 43.552191,
        lng: 1.498549,
      },
      {
        nom: "La Saudrune (Portet-sur-Garonne)",
        lat: 43.539232,
        lng: 1.417085,
      },
      {
        nom: "Lac des Alouettes (Portet-sur-Garonne)",
        lat: 43.533874,
        lng: 1.392387,
      },
      {
        nom: "Lac de Roussimort (Cugnaux)",
        lat: 43.536944,
        lng: 1.382077,
      },
      {
        nom: "Lac du Vieux Pigeonnier (Tournefeuille)",
        lat: 43.584445,
        lng: 1.358635,
      },
      {
        nom: "Lac Arc-en-Ciel (Tournefeuille)",
        lat: 43.587832,
        lng: 1.362308,
      },
    ];

    /* ===============================
       4. Normalisation + fusion
       =============================== */
    
    // 1. Lacs issus du JSON Mairie
    const formattedLacsCentre = lacsCentre.map((item, index) => ({
      id: index + 1,
      nom: item.n0mdulac,
      description: `Superficie: ${item.superficie}, Prof. max: ${item.profmax}, Usages: ${item.usages}`,
      lat: item.geo_point_2d?.lat ?? null,
      lng: item.geo_point_2d?.lon ?? null,
      geo_shape: item.geo_shape ?? null,
    }));

    // 2. Ajouts manuels Toulouse (Thibault, Balastières)
    const formattedLacsToulouseManuels = lacsToulouseManuels.map((lac, index) => ({
      id: formattedLacsCentre.length + index + 1,
      nom: lac.nom,
      description: "Lac de Toulouse",
      lat: lac.lat,
      lng: lac.lng,
      geo_shape: null,
    }));

    // 3. Lacs de banlieue
    const totalToulouse = formattedLacsCentre.length + formattedLacsToulouseManuels.length;
    const formattedLacsBanlieue = lacsBanlieue.map((lac, index) => ({
      id: totalToulouse + index + 1,
      nom: lac.nom,
      description: "Lac de banlieue",
      lat: lac.lat,
      lng: lac.lng,
      geo_shape: null,
    }));

    // Fusion finale
    const data = [
      ...formattedLacsCentre,
      ...formattedLacsToulouseManuels,
      ...formattedLacsBanlieue,
    ];

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture lacs :", error);
    return NextResponse.json(
      { error: "Impossible de charger les lacs" },
      { status: 500 }
    );
  }
}