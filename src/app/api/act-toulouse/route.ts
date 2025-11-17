// app/act-toulouse/route.ts
import { NextResponse } from 'next/server';

// Définition de l'URL et des paramètres pour l'API OpenDataSoft Infolocale
const API_BASE_URL = "http://datainfolocale.opendatasoft.com/api/records/1.0/search/";
const DATASET_ID = "agenda_culturel";
const ROWS_LIMIT = 200; 
const DEPARTMENT_CODE = "31"; // Code de la Haute-Garonne

// Les champs pour le tri et le filtre
const FIELD_DATE = "date_debut"; 
const FIELD_DEPT = "departement_code";

// Encodage robuste du filtre de plage de date (Aujourd'hui jusqu'à l'infini)
const DATE_RANGE = encodeURIComponent(`[NOW/DAY TO *]`);
const DEPT_CODE = encodeURIComponent(DEPARTMENT_CODE);

export async function GET() {
  const url =
    `${API_BASE_URL}?dataset=${DATASET_ID}` +
    `&rows=${ROWS_LIMIT}&sort=${FIELD_DATE}` +
    `&refine.${FIELD_DEPT}=${DEPT_CODE}` + // Filtre Département 31
    `&refine.${FIELD_DATE}=${DATE_RANGE}`; // Filtre Dates futures

  try {
    const res = await fetch(url, {
      // Configuration pour s'assurer que les données ne sont pas trop anciennes
      next: { revalidate: 3600 } // Revalidation toutes les heures
    });

    if (!res.ok) {
      // Retourne une erreur si l'API ODS ne répond pas correctement
      return NextResponse.json(
        { message: "Erreur lors de la récupération des données Infolocale.", error: res.statusText },
        { status: res.status }
      );
    }

    const json = await res.json();
    const records = json.records || [];

    // Mapping et nettoyage des données avant l'envoi au client
    const events = records.map((r: any) => {
      const f = r.fields || {};
      return {
        id: f.id_event || r.recordid,
        name: f.titre || f.chapeau || "Événement sans titre",
        date: f.date_debut || new Date().toISOString(),
        location: f.lieu_commune || "Lieu non spécifié",
        description: f.chapeau || "Pas de description.",
        image: f.photo,
        source: 'Infolocale'
      };
    });

    return NextResponse.json(events);
    
  } catch (error) {
    console.error("Erreur Infolocale:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur lors du fetch Infolocale.", error },
      { status: 500 }
    );
  }
}
