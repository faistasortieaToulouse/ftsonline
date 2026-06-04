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

// Jours fériés France 2025
const FERIES_2025 = [
  "2025-01-01", "2025-04-21", "2025-05-01", "2025-05-08", "2025-05-29",
  "2025-06-09", "2025-07-14", "2025-08-15", "2025-11-01", "2025-11-11", "2025-12-25"
];

// Fonction utilitaire pour vérifier les vacances 2025 selon vos notes
function obtenirVacances2025(date: Date, dateStr: string): string {
  // Toussaint : 18 Octobre au 3 Novembre 2025
  if (dateStr >= "2025-10-18" && dateStr <= "2025-11-03") return "🍂 Vacances de la Toussaint";
  // Noël : 20 Décembre 2025 au 5 Janvier 2026
  if (dateStr >= "2025-12-20" || dateStr <= "2025-01-05") return "🎄 Vacances de Noël";
  // Été : 5 Juillet au 31 Août 2025
  if (dateStr >= "2025-07-05" && dateStr <= "2025-08-31") return "🏖️ Vacances d'Été";
  return "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get('date') || "2025-05-01";
    
    const targetDate = new Date(dateString);
    const jour = targetDate.getDate();
    const mois = targetDate.getMonth(); // 0 = Janvier, 11 = Décembre
    
    let score = 2; // Par défaut moyen
    let contextes: string[] = [];
    let alertesMeteo: string[] = [];

    // --- 1. GESTION DES TIMINGS & DURÉE DU JOUR ---
    // Vos critères : "mai à août -> durée du jour > 19h30 -> forte animation"
    const aJourLong = mois >= 4 && mois <= 7; 
    if (aJourLong) {
      contextes.push("☀️ Durée du jour supérieure à 19h30 (Ensoleillement max)");
    }

    // --- 2. TENDANCES MENSUELLES (FROID / CHAUD DE BASE) ---
    if (mois === 0) { score = 1; contextes.push("❄️ Janvier : Froid hivernal (~15°C), contrecoup post-fêtes, ville très calme."); }
    else if (mois === 1) { score = 1; contextes.push("🌧️ Février : Froid persistant (15°C-18°C), fatigue générale."); }
    else if (mois === 2) { score = 2; contextes.push("🌱 Mars : Météo de transition instable."); }
    else if (mois === 3) { score = 2; contextes.push("🌸 Avril : Redoux, retour progressif des sorties."); }
    else if (mois === 4) { score = 3; contextes.push("🔥 Mai : Très forte animation (jours longs, nombreux ponts)."); }
    else if (mois === 5) { score = 2; contextes.push("🎓 Juin : Mixte (Chaleur vs examens/partiels universitaires)."); }
    else if (mois === 6) { score = 2; contextes.push("🏖️ Juillet : Période estivale (départs en vacances)."); }
    else if (mois === 7) { score = 1; contextes.push("❌ Août : Ville désertée (fermetures annuelles, grosse baisse d'activité)."); }
    else if (mois === 8) { score = 3; contextes.push("🎓 Septembre : Rentrée universitaire et scolaire, pic d'animation."); }
    else if (mois === 9) { score = 3; contextes.push("🍂 Octobre : Automne doux, bonne dynamique de sorties."); }
    else if (mois === 10) { score = 1; contextes.push("🌫️ Novembre : Très calme (chute des températures, grisaille)."); }
    else if (mois === 11) { score = 2; contextes.push("🎄 Décembre : Préparation des fêtes, animation ciblée le week-end (Partiels début de mois)."); }

    // --- 3. FIXATION DU SCORE SELON LES CODES DU TABLEAU EXCEL ---
    const codeCellule = MATRICE_CALENDRIER_2025[jour]?.[mois] || "";
    if (codeCellule) contextes.push(`Code Excel : "${codeCellule}"`);

    if (codeCellule.includes("mardi 3") || codeCellule.includes("V3") || codeCellule.includes("D3")) {
      score = 3;
    } else if (codeCellule.includes("mardi 2") || codeCellule.includes("V2") || codeCellule.includes("D2")) {
      score = 2;
    } else if (codeCellule.includes("mardi 1") || codeCellule.includes("V1") || codeCellule.includes("D1")) {
      score = 1;
    } else if (codeCellule.includes("🌞") && aJourLong) {
      score = 3; // Un jour ensoleillé quand les journées font plus de 19h30 = Carton plein
    }

    // --- 4. CALENDRIER CIVIL : FERIÉS & VACANCES SCOLAIRES ---
    if (FERIES_2025.includes(dateString)) {
      score = 1; // Un jour férié casse l'affluence en ville dans vos critères
      contextes.push("🛑 Jour Férié Officiel 2025 (Ville au repos)");
    }

    const typeVacances = obtenirVacances2025(targetDate, dateString);
    if (typeVacances) {
      contextes.push(typeVacances);
    }

    // --- 5. MICRO-CLIMATOLOGIE SPECIFIQUE DE VOTRE TABLEAU ---
    // Épisodes de Pluie intense & Orages violents
    if ((mois === 4 && jour === 31) || (mois === 5 && jour === 1) || (mois === 5 && jour === 3)) {
      alertesMeteo.push("⛈️ Alerte Orages Violents en soirée (Annulation des terrasses)");
      score = 1;
    }
    if (mois === 5 && ((jour >= 13 && jour <= 15) || jour === 25)) {
      alertesMeteo.push("🌧️ Fortes Précipitations cumulées (Pluie continue)");
      score = Math.max(1, score - 1);
    }

    // Épisodes de Vents Violents (Mars)
    if (mois === 2 && jour >= 3 && jour <= 9) {
      alertesMeteo.push("⚠️ Vents Forts continus (≥ 60 km/h)");
      score = Math.max(1, score - 1);
    }
    if (mois === 2 && jour >= 19 && jour <= 21) {
      alertesMeteo.push(jour === 20 ? "🌪️ Tempête Historique (Rafales à 107 km/h)" : "⚠️ Rafales violentes (≥ 100 km/h)");
      score = 1;
    }

    // Pics de Chaleur et Canicule de votre étude
    if (mois === 4 && (jour === 30 || jour === 31)) {
      alertesMeteo.push(`🔥 Pic de chaleur anormal (${jour === 30 ? '34.5°C' : '32°C'})`);
    }
    if (mois === 5 && jour >= 17 && jour <= 25) {
      alertesMeteo.push("🥵 Canicule : 9 jours consécutifs ≥ 30°C. Sorties bloquées en journée.");
      score = 1; // La canicule vide les rues en journée
    }
    if (mois === 7 && jour >= 7 && jour <= 17) {
      alertesMeteo.push(jour === 11 ? "🚨 Canicule Extrême : Pic Annuel à 41.5°C !" : "🥵 Alerte Canicule : Températures étouffantes (11j ≥ 30°C)");
      score = 1; // Ville totalement vidée par la chaleur
    }

    const libellesNiveaux: Record<number, string> = {
      1: "Peu de monde (Basse affluence) 🔴",
      2: "Modéré (Affluence normale) 🟡",
      3: "Beaucoup de monde (Forte affluence !) 🟢"
    };

    return NextResponse.json({
      date: dateString,
      score: score,
      affluenceTexte: libellesNiveaux[score],
      details: contextes.join(" | "),
      meteo: alertesMeteo.length > 0 ? alertesMeteo.join(" / ") : "☀️ Météo clémente ou conforme aux normales."
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
