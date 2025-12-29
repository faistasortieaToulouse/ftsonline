import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "parcellaire-de-1830.json"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 });
    }

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Filtrer et convertir
    const data = raw
      .filter(
        (p: any) =>
          p.geo_point_2d &&
          !isNaN(Number(p.geo_point_2d.lat)) &&
          !isNaN(Number(p.geo_point_2d.lon)) &&
          p.geo_shape?.geometry?.coordinates
      )
      .map((p: any, index: number) => ({
        id: index,
        centroid: {
          lat: Number(p.geo_point_2d.lat),
          lng: Number(p.geo_point_2d.lon),
        },
        geometry: p.geo_shape.geometry, // conserve la structure GeoJSON
        codeparcelle: p.codeparcelle,
        typologie: p.typologie,
        surface: p.surface,
        nom_prenom: p.nom_prenom,
      }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur parcellaire :", error);
    return NextResponse.json(
      { error: "Impossible de charger le parcellaire" },
      { status: 500 }
    );
  }
}
