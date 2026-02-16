import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=comptages-en-section-tous-vehicules&q=toulouse&rows=50",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();

    const pointsComptage = data.records.map((record: any) => {
      const f = record.fields;
      return {
        id: record.recordid,
        // On utilise 'street' pour la voie et 'commune' pour plus de précision
        voie: f.street ? `${f.street} (${f.commune})` : "Voie non précisée",
        // 'v85' est un indicateur de vitesse courant dans ces datasets
        vitesse: f.v85 || "N/C",
        // 'tmjo_tv' correspond souvent au trafic moyen journalier
        debit: f.tmjo_tv || 0, 
        // Les coordonnées sont dans geo_point_2d [lat, lng]
        coords: f.geo_point_2d || [43.6047, 1.4442],
        derniere_maj: f.date_maj_tab || record.record_timestamp
      };
    });

    return NextResponse.json(pointsComptage);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
