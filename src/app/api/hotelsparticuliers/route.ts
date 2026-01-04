import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "toulouse",
      "hotels_geocode.json" // ✅ bon fichier
    );

    const jsonData = fs.readFileSync(filePath, "utf-8");
    const hotels = JSON.parse(jsonData);

    // sécurité : ne garder que ceux avec lat/lng valides
    const filtered = hotels.filter(
      (h: any) =>
        typeof h.lat === "number" &&
        typeof h.lng === "number"
    );

    return NextResponse.json(filtered);
  } catch (err) {
    console.error("❌ Erreur lecture hotels_geocode.json :", err);
    return NextResponse.json(
      { error: "Impossible de charger les hôtels géocodés." },
      { status: 500 }
    );
  }
}
