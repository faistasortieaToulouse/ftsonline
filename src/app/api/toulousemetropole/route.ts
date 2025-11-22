import { NextResponse } from "next/server";
// Importation de isBefore pour un filtrage de date robuste
import { isBefore } from "date-fns"; 

// L'API est déjà configurée pour trier par date_debut, mais nous filtrons et trions
// côté serveur pour garantir l'ordre et l'exclusion des dates passées.
const API_URL = "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=1000&sort=date_debut";

// URL de base pour construire le lien vers la fiche publique de l'événement
const DATA_PORTAL_BASE_URL = "https://data.toulouse-metropole.fr/explore/dataset/agenda-des-manifestations-culturelles-so-toulouse/record/";

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
    
    // Définir la date actuelle pour le filtrage
    const now = new Date();

    // 1. Filtrer les événements passés et mapper les champs
    const futureEvents = data.records
      .filter((rec: any) => {
          const dateDebut = rec.fields?.date_debut;
          if (!dateDebut) return false; // Exclure les enregistrements sans date de début
          
          const eventDate = new Date(dateDebut);
          
          // Conserver uniquement les événements qui NE SONT PAS strictement antérieurs à 'now' (donc aujourd'hui ou futur).
          return !isBefore(eventDate, now);
      })
      .map((rec: any) => {
          const fields = rec.fields || {};
          
          // Lien de réservation principal
          const primaryUrl = fields.reservation_site_internet;
          
          // Lien de secours construit à partir du recordid
          const fallbackUrl = `${DATA_PORTAL_BASE_URL}${rec.recordid}/`;

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
              // Utiliser le lien de réservation s'il existe, sinon utiliser le lien de secours vers la fiche du portail de données
              url: primaryUrl || fallbackUrl, 
          };
      });

    // 2. Trier explicitement les événements restants par date (ascendant : du plus proche au plus lointain)
    futureEvents.sort((a: any, b: any) => {
        // On sait que 'date' est défini à ce stade (grâce au filtre)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB; 
    });

    return NextResponse.json(futureEvents);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur inconnue" }, { status: 500 });
  }
}