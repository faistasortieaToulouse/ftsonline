import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=comptages-en-section-tous-vehicules&q=&rows=50&facet=nom_voie&facet=type_vehicule",
      { next: { revalidate: 3600 } } // Cache d'une heure
    );

    if (!response.ok) throw new Error("Erreur lors de la récupération des données");

    const data = await response.json();

    // Transformation des données pour le frontend
    const pointsComptage = data.records.map((record: any) => ({
      id: record.recordid,
      voie: record.fields.nom_voie || "Voie non précisée",
      vitesse: record.fields.vitesse_moyenne || "N/C",
      debit: record.fields.debit_horaire || 0,
      coords: record.geometry.coordinates.reverse(), // [lat, lng]
      derniere_maj: record.fields.date_heure
    }));

    return NextResponse.json(pointsComptage);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de charger les données de trafic" }, { status: 500 });
  }
}
