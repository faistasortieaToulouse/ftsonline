import { NextResponse } from "next/server";

const API_URL = "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=1000&sort=date_debut";

export async function GET() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      return NextResponse.json({ error: `API HTTP error: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    if (!data.records || !Array.isArray(data.records)) {
      return NextResponse.json([], { status: 200 });
    }

    // Mapping complet des événements
    const events = data.records.map((rec: any) => {
      const fields = rec.fields || {};

      return {
        id: rec.recordid,
        title: fields.nom_de_la_manifestation || "Sans titre",
        description: fields.descriptif_long || fields.descriptif_court || "",
        date: fields.date_debut,
        lieu_nom: fields.lieu_nom || "",
        lieu_adresse_1: fields.lieu_adresse_1 || "",
        lieu_adresse_2: fields.lieu_adresse_2 || "",
        lieu_adresse_3: fields.lieu_adresse_3 || "",
        code_postal: fields.code_postal || "",
        commune: fields.commune || "",
        category: fields.categorie_de_la_manifestation || "",
        type: fields.type_de_manifestation || "",
        theme: fields.theme_de_la_manifestation || "",
        url: fields.reservation_site_internet || null,
      };
    });

    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur inconnue" }, { status: 500 });
  }
}
