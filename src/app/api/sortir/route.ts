import { NextResponse } from 'next/server';

// 1. Matrice brute de votre tableau Excel (Lignes 1 à 31, Mois 0 à 11)
// On y retrouve vos codes : "🌞", "mardi 3 / 2", "V1", "D1", "Q", "Férié", etc.
const MATRICE_CALENDRIER_2025: Record<number, Record<number, string>> = {
  // jour: { moisIdx: "code" } (0 = Janvier, 11 = Décembre)
  1:  { 0: "Férié", 3: "mardi 3 / 2", 4: "🌞 Férié", 5: "🌞 D1", 6: "mardi 2 / 3", 7: "🌞 V1", 10: "Férié" },
  2:  { 1: "D2", 2: "D1", 3: "🌞", 4: "🌞 / Q", 5: "🌞", 6: "🌞", 7: "🌞", 8: "mardi 3", 10: "Q", 11: "mardi 2 / 1" },
  3:  { 0: "V1", 3: "🌞", 4: "🌞 / Q", 5: "mardi 1 / 2", 6: "🌞", 7: "🌞 D1", 9: "V3", 10: "Q" },
  4:  { 1: "mardi 2 / 3", 2: "mardi 1 / 3", 3: "🌞 V3 / 2", 4: "🌞 / Q D1", 5: "🌞", 6: "🌞 V1", 7: "🌞", 8: "V3", 10: "mardi 3 / 1", 11: "V2" },
  5:  { 0: "D1", 3: "🌞", 4: "🌞 / Q", 5: "🌞", 6: "🌞 / Q", 7: "mardi 1 / 3", 9: "D2" },
  6:  { 3: "🌞 D3 / 2", 4: "mardi 3 / 2", 5: "🌞 V1", 6: "🌞 / Q D1", 7: "🌞", 8: "D2", 10: "D2" },
  7:  { 0: "mardi 1", 1: "V2", 2: "V1", 3: "🌞", 4: "🌞", 5: "🌞", 6: "🌞 / Q", 7: "🌞", 9: "mardi 3", 10: "V3" },
  8:  { 3: "mardi 3 / 2", 4: "🌞 Férié", 5: "🌞 D1", 6: "mardi 2", 7: "🌞 V1", 8: "mardi 3 / 1", 10: "mardi 2 / 1", 12: "🌞" },
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get('date') || "2025-05-01";
    
    const targetDate = new Date(dateString);
    const jour = targetDate.getDate();
    const mois = targetDate.getMonth();
    const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 2 = Mardi, 5 = Vendredi

    // 1. Tendance de base du mois selon vos blocs de texte de droite
    let score = 2; // Par défaut moyen
    let motif = "Tendance mensuelle standard";

    if (mois === 0) { score = 1; motif = "❄️ Janvier : Très calme (post-fêtes, froid)"; }
    else if (mois === 1) { score = 1; motif = "🌧️ Février : Calme (froid, fatigue)"; }
    else if (mois === 2) { score = 2; motif = "🌱 Mars : Moyen (météo instable)"; }
    else if (mois === 3) { score = 2; motif = "🌸 Avril : Bon (retour des beaux jours)"; }
    else if (mois === 4) { score = 3; motif = "☀️ Mai : Très animé (jours longs, ponts)"; }
    else if (mois === 5) { score = 2; motif = "🎓 Juin : Mixte (examens/partiels)"; }
    else if (mois === 6) { score = 2; motif = "🏖️ Juillet : Spécial (vacances)"; }
    else if (mois === 7) { score = 1; motif = "❌ Août : Très vide (ville désertée)"; }
    else if (mois === 8) { score = 3; motif = "🎓 Septembre : Très animé (rentrée)"; }
    else if (mois === 9) { score = 3; motif = "🍂 Octobre : Animé (météo clémente)"; }
    else if (mois === 10) { score = 1; motif = "🌫️ Novembre : Calme (météo mauvaise)"; }
    else if (mois === 11) { score = 2; motif = "🎄 Décembre : Très variable (fêtes)"; }

    // 2. Extraction du code de votre cellule Excel
    const codeCellule = MATRICE_CALENDRIER_2025[jour]?.[mois] || "";
    let detailCellule = codeCellule ? `Cellule Excel : "${codeCellule}"` : "Journée standard";

    // Évaluation des codes de votre légende
    if (codeCellule.includes("mardi 3") || codeCellule.includes("V3") || codeCellule.includes("D3")) {
      score = 3; // Beaucoup de monde
    } else if (codeCellule.includes("mardi 2") || codeCellule.includes("V2") || codeCellule.includes("D2")) {
      score = 2; // Moyen
    } else if (codeCellule.includes("mardi 1") || codeCellule.includes("V1") || codeCellule.includes("D1") || codeCellule.includes("Férié")) {
      score = 1; // Peu de monde
    } else if (codeCellule.includes("🌞")) {
      // Si la case contient un soleil sans restriction basse, on pousse au max du mois
      score = Math.max(score, 2);
    }

    // 3. Injection des alertes météo réelles écrites sur vos volets de droite
    let alerteMeteo = "";
    
    // Alerte Tempêtes & Vents Forts (Mars)
    if (mois === 2 && jour === 20) alerteMeteo = "⚠️ Tempête historique détectée (107 km/h) ! Chute drastique des sorties.";
    if (mois === 2 && jour >= 3 && jour <= 9) alerteMeteo = "⚠️ Vents forts (≥ 60km/h). Prudence en extérieur.";
    if (mois === 2 && jour >= 19 && jour <= 21) alerteMeteo = "⚠️ Rafales violentes (≥ 100km/h).";

    // Alerte Canicule (Juin et Août)
    if (mois === 4 && jour === 30) alerteMeteo = "🔥 Pic de chaleur anormal à 34,5 °C !";
    if (mois === 4 && jour === 31) alerteMeteo = "🔥 Pic de chaleur à 32,0 °C !";
    if (mois === 5 && jour >= 17 && jour <= 25) alerteMeteo = "🥵 Canicule : 9 jours consécutifs ≥ 30 °C ! Les gens sortent uniquement tard le soir.";
    if (mois === 7 && jour >= 7 && jour <= 17) alerteMeteo = "🥵 Alerte Canicule Extrême (11j ≥ 30°C). Pic annuel à 41,5 °C le 11 Août ! Ville totalement vide.";

    // Alerte Orages
    if ((mois === 4 && jour === 31) || (mois === 5 && jour === 1)) alerteMeteo = "⛈️ Risque d'orages violents.";
    if (mois === 5 && jour === 3) alerteMeteo = "⛈️ Soirée perturbée par des orages.";
    if (mois === 5 && jour >= 13 && jour <= 15) alerteMeteo = "⛈️ Week-end instable, orages isolés.";
    if (mois === 5 && jour === 25) alerteMeteo = "⛈️ Orages en fin de journée.";

    // Si grosse alerte météo défavorable (vent ou canicule l'après-midi), on bride le score
    if (alerteMeteo.includes("Tempête") || alerteMeteo.includes("41,5 °C") || alerteMeteo.includes("violents")) {
      score = 1;
    }

    const libellesNiveaux: Record<number, string> = {
      1: "Peu de gens (Sorties limitées) 🔴",
      2: "Nombre de gens moyen 🟡",
      3: "Beaucoup de monde (Idéal pour sortir !) 🟢"
    };

    return NextResponse.json({
      date: dateString,
      jourSemaine: targetDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
      score: score,
      affluenceTexte: libellesNiveaux[score] || "Moyen",
      details: `${motif}. ${detailCellule}.`,
      meteo: alerteMeteo || "Météo conforme aux normales saisonnières."
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
