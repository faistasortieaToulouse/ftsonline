import { NextResponse } from 'next/server';

// Matrice brute de votre tableau Excel (Lignes 1 à 31, Mois 0 à 11)
const MATRICE_CALENDRIER_2025: Record<number, Record<number, string>> = {
  1:  { 0: "Férié", 3: "mardi 3 / 2", 4: "🌞 Férié", 5: "🌞 D1", 6: "mardi 2 / 3", 7: "🌞 V1", 10: "Férié" },
  2:  { 1: "D2", 2: "D1", 3: "🌞", 4: "🌞 / Q", 5: "🌞", 6: "🌞", 7: "🌞", 8: "mardi 3", 10: "Q", 11: "mardi 2 / 1" },
  3:  { 0: "V1", 3: "🌞", 4: "🌞 / Q", 5: "mardi 1 / 2", 6: "🌞", 7: "🌞 D1", 9: "V3", 10: "Q" },
  4:  { 1: "mardi 2 / 3", 2: "mardi 1 / 3", 3: "🌞 V3 / 2", 4: "🌞 / Q D1", 5: "🌞", 6: "🌞 V1", 7: "🌞", 8: "V3", 10: "mardi 3 / 1", 11: "V2" },
  5:  { 0: "D1", 3: "🌞", 4: "🌞 / Q", 5: "🌞", 6: "🌞 / Q", 7: "mardi 1 / 3", 9: "D2" },
  6:  { 3: "🌞 D3 / 2", 4: "mardi 3 / 2", 5: "🌞 V1", 6: "🌞 / Q D1", 7: "🌞", 8: "D2", 10: "D2" },
  7:  { 0: "mardi 1", 1: "V2", 2: "V1", 3: "🌞", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞", 9: "mardi 3", 10: "V3" },
  8:  { 3: "mardi 3 / 2", 4: "🌞 Férié", 5: "🌞 D1", 6: "mardi 2", 7: "🌞 V1", 8: "mardi 3 / 1", 10: "mardi 2 / 1", 11: "🌞" },
  9:  { 1: "D2", 2: "D1", 3: "🌞", 4: "🌞", 5: "🌞 Férié", 6: "🌞 / Q", 7: "🌞", 10: "D3" },
  10: { 0: "V1", 3: "🌞", 4: "🌞", 5: "mardi 3 / 2", 6: "🌞 / Q", 7: "🌞 D1", 9: "V3" },
  11: { 1: "mardi 2 / 3", 2: "mardi 2 / 3", 3: "🌞 V3", 4: "🌞 D1", 5: "🌞", 6: "🌞 / Q V1", 7: "🌞", 8: "V3", 10: "mardi Férié 0", 11: "V2" },
  12: { 0: "D1", 3: "🌞", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "mardi 1", 9: "D2" },
  13: { 3: "🌞 D3", 4: "mardi 3 / 2", 5: "🌞 V1", 6: "🌞 / Q D1", 7: "🌞", 8: "D2", 10: "D2" },
  14: { 0: "mardi 1 / 3", 1: "V2", 2: "V2", 3: "🌞", 4: "🌞", 5: "🌞", 6: "🌞 Férié", 7: "🌞", 9: "mardi 3", 10: "V3" },
  15: { 3: "mardi 3 / 1", 4: "🌞", 5: "🌞 D1", 6: "mardi 2", 7: "🌞 Férié V0", 8: "mardi 3 / 2", 10: "mardi 2 / 1" },
  16: { 1: "D2", 2: "D2", 3: "🌞", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞 / Q", 10: "D3" },
  17: { 0: "V1 / 3", 3: "🌞", 4: "🌞", 5: "mardi 1 / 2", 6: "🌞 / Q", 7: "🌞 / Q D1", 9: "V3" },
  18: { 1: "mardi 2 / 3", 2: "mardi 2", 3: "🌞 V1", 4: "🌞 D1", 5: "🌞", 6: "🌞 / Q V1", 7: "🌞 / Q", 9: "Q", 10: "mardi 3 / 1" },
  19: { 0: "D1 / 3", 2: "🌞 / Q", 3: "🌞", 4: "🌞", 5: "🌞 / Q", 6: "mardi 2 / 1", 7: "V3", 8: "Q", 10: "V1" },
  20: { 2: "🌞 / Q D1", 3: "mardi 2", 4: "🌞 V1", 5: "🌞 / Q D1", 6: "🌞 / Q", 8: "Q" },
  21: { 0: "mardi 1", 1: "V2", 3: "🌞 Férié", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞 / Q", 8: "D2", 9: "mardi 2 / 1", 10: "V3", 11: "D1" },
  22: { 3: "mardi 2 / 1", 4: "🌞", 5: "🌞 D1", 6: "mardi 2", 7: "🌞 / Q V1", 8: "Q" },
  23: { 1: "D1", 2: "D2", 3: "🌞 / Q", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞 / Q", 8: "mardi 3 / 1", 9: "Q", 10: "D3", 11: "mardi 1" },
  24: { 0: "V1", 3: "🌞 / Q", 4: "🌞", 5: "mardi 1 / 3", 6: "🌞 / Q", 7: "🌞 / Q D1", 9: "Q" },
  25: { 1: "mardi 1 / 3", 2: "mardi 2 / 3", 3: "🌞 / Q V1", 4: "🌞 D1", 5: "🌞", 6: "🌞 / Q V1", 7: "🌞 / Q", 8: "V3", 9: "Q", 10: "mardi 3 / 1", 11: "Férié V0" },
  26: { 0: "D1", 3: "🌞 / Q", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "mardi 2 / 3", 9: "Q" },
  27: { 3: "🌞 / Q D1", 4: "mardi 2 / 3", 5: "🌞", 6: "🌞 / Q D1", 7: "🌞 / Q", 8: "D2", 9: "Q", 11: "D1" },
  28: { 0: "mardi 1", 1: "V1", 3: "🌞 / Q", 4: "🌞", 5: "🌞 V1 / 3", 6: "🌞 / Q", 7: "🌞 / Q", 9: "mardi 2 / 1" },
  29: { 3: "mardi 2", 4: "🌞 Férié", 5: "🌞", 6: "mardi 2 / 3", 7: "🌞 / Q V1", 8: "mardi 3", 9: "Q", 10: "V3", 11: "mardi 1" },
  30: { 1: "D0", 2: "D2", 3: "🌞 / Q", 4: "🌞", 5: "🌞 D1 / 3", 6: "🌞 / Q", 7: "🌞 / Q", 9: "Q" },
  31: { 0: "V1", 3: "🌞 / Q", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞 / Q D1", 9: "Q", 10: "D3" }
};

const FERIES_2025 = [
  "2025-01-01", "2025-04-21", "2025-05-01", "2025-05-08", "2025-05-29",
  "2025-06-09", "2025-07-14", "2025-08-15", "2025-11-01", "2025-11-11", "2025-12-25"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get('date') || "2025-05-01";
    const targetDate = new Date(dateString);
    const jour = targetDate.getDate();
    const mois = targetDate.getMonth(); 
    
    let score = 2;
    let contextes: string[] = [];
    let alertesMeteo: string[] = [];
    let meteoTypes: string[] = [];
    let estFerie = false;
    let estVacances = false;
    let nomVacances = "";

    // 1. Durée du jour > 19h30 (Mai à Août)
    if (mois >= 4 && mois <= 7) {
      meteoTypes.push('jour-long');
      contextes.push("⌛ Journée longue (Durée du jour > 19h30)");
    }

    // 2. Températures mensuelles par défaut
    if (mois === 0) {
      score = 1;
      meteoTypes.push('grand-froid');
      contextes.push("🥶 Grand froid : < 5°C en moyenne");
    } else if (mois === 1 || mois === 10) {
      score = 1;
      meteoTypes.push('frais');
      contextes.push("🧥 Fraîcheur : Entre 5°C et 10°C");
    } else if (mois === 4) {
      score = 3; contextes.push("🌸 Mai : Jours longs, forte animation urbaine");
    } else if (mois === 7) {
      score = 1; contextes.push("❌ Août : Ville déserte");
    } else if (mois === 8 || mois === 9) {
      score = 3; contextes.push("🎓 Période de rentrée : Très forte dynamique");
    }

    // 3. Jours Fériés Civils
    if (FERIES_2025.includes(dateString)) {
      score = 1; 
      estFerie = true;
      contextes.push("🛑 Jour Férié Officiel");
    }

    // 4. Vacances Scolaires Officielles 2025 - Zone C (Toulouse)
    if (dateString >= "2025-02-15" && dateString <= "2025-03-03") {
      estVacances = true;
      nomVacances = "🎒 Vacances d'Hiver (Zone C - Toulouse)";
      contextes.push(nomVacances);
    } else if (dateString >= "2025-04-12" && dateString <= "2025-04-28") {
      estVacances = true;
      nomVacances = "🌱 Vacances de Printemps (Zone C - Toulouse)";
      contextes.push(nomVacances);
    } else if (dateString >= "2025-07-05" && dateString <= "2025-09-01") {
      estVacances = true;
      nomVacances = "🏖️ Vacances d'Été (Zone C - Toulouse)";
      contextes.push(nomVacances);
    } else if (dateString >= "2025-10-18" && dateString <= "2025-11-03") {
      estVacances = true;
      nomVacances = "🍂 Vacances de la Toussaint (Zone C - Toulouse)";
      contextes.push(nomVacances);
    } else if (dateString >= "2025-12-20" || dateString <= "2025-01-05") {
      estVacances = true;
      nomVacances = "🎄 Vacances de Noël (Zone C - Toulouse)";
      contextes.push(nomVacances);
    }

    // 5. Lecture Matrice
    const codeCellule = MATRICE_CALENDRIER_2025[jour]?.[mois] || "";
    if (codeCellule) {
      contextes.push(`Cellule Excel : "${codeCellule}"`);
      if (codeCellule.includes("mardi 3") || codeCellule.includes("V3") || codeCellule.includes("D3")) score = 3;
      else if (codeCellule.includes("mardi 1") || codeCellule.includes("V1") || codeCellule.includes("D1")) score = 1;
      else if (codeCellule.includes("🌞") && (mois >= 4 && mois <= 7)) score = 3;
    }

    // 6. Alertes Météo Critiques
    if ((mois === 4 && jour === 31) || (mois === 5 && [1, 3].includes(jour))) {
      meteoTypes.push('orage');
      alertesMeteo.push("⛈️ Orages violents en soirée");
      score = 1;
    }
    if (mois === 5 && [13, 14, 15, 25].includes(jour)) {
      meteoTypes.push('pluie');
      alertesMeteo.push("🌧️ Fortes pluies continues");
      score = Math.max(1, score - 1);
    }
    if (mois === 2 && jour >= 3 && jour <= 9) {
      meteoTypes.push('vent');
      alertesMeteo.push("💨 Vents forts (≥ 60 km/h)");
      score = Math.max(1, score - 1);
    }
    if (mois === 2 && jour >= 19 && jour <= 21) {
      meteoTypes.push('vent');
      alertesMeteo.push(jour === 20 ? "🌪️ Tempête Historique (107 km/h)" : "💨 Rafales violentes (≥ 100 km/h)");
      score = 1;
    }
    if (mois === 4 && [30, 31].includes(jour)) {
      meteoTypes.push('canicule');
      alertesMeteo.push(`🔥 Pic de chaleur précoce (${jour === 30 ? '34.5°C' : '32°C'})`);
    }
    if (mois === 5 && jour >= 17 && jour <= 25) {
      meteoTypes.push('canicule');
      alertesMeteo.push("🥵 Canicule : Blocage de chaleur ≥ 30°C sur 9 jours consécutifs");
      score = 1;
    }
    if (mois === 7 && jour >= 7 && jour <= 17) {
      meteoTypes.push('canicule');
      alertesMeteo.push(jour === 11 ? "🚨 Canicule Extrême : Pic Annuel à 41.5°C !" : "🥵 Alerte Canicule (11 jours ≥ 30°C)");
      score = 1;
    }

    meteoTypes = Array.from(new Set(meteoTypes));

    return NextResponse.json({
      date: dateString,
      score: score,
      affluenceTexte: { 1: "Peu de monde 🔴", 2: "Modéré 🟡", 3: "Beaucoup de monde 🟢" }[score] || "Modéré",
      details: contextes.join(" | "),
      meteo: alertesMeteo.length > 0 ? alertesMeteo.join(" / ") : "Météo standard.",
      meteoTypes: meteoTypes,
      estFerie: estFerie,
      estVacances: estVacances,
      nomVacances: nomVacances
    });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
