import { NextResponse } from 'next/server';

// Définition des types pour sécuriser la structure des données
interface TendanceMensuelle {
  score: number;
  label: string;
}

interface CorrectionTerrain {
  code: string;
  score: number;
}

interface DonniesCalendrier {
  mensuel: Record<number, TendanceMensuelle>;
  corrections: Record<string, CorrectionTerrain>;
}

// 1. Base de données des règles extraites de votre fichier
const CALENDRIER_2025: DonniesCalendrier = {
  mensuel: {
    0: { score: 1, label: "Très calme (Post-fêtes, froid)" },  // Janvier (0)
    1: { score: 2, label: "Calme (Froid, fatigue)" },          // Février
    2: { score: 3, label: "Moyen (Météo instable)" },          // Mars
    3: { score: 4, label: "Bon (Retour des beaux jours)" },    // Avril
    4: { score: 5, label: "Très animé (Jours longs, ponts)" }, // Mai
    5: { score: 3, label: "Mixte (Examens / Partiels)" },      // Juin
    6: { score: 3, label: "Spécial (Vacances d'été)" },        // Juillet
    7: { score: 0, label: "Très vide (Ville désertée)" },      // Août
    8: { score: 5, label: "Très animé (Rentrée, nouveaux arrivants)" }, // Septembre
    9: { score: 5, label: "Animé (Météo clémente)" },          // Octobre
    10: { score: 2, label: "Calme (Mauvaise météo)" },         // Novembre
    11: { score: 3, label: "Très variable (Fêtes de Noël)" }   // Décembre
  },
  // Dates clés de vérification / corrections manuelles issues du terrain
  corrections: {
    "2025-01-14": { code: "mardi 2", score: 2 },
    "2025-02-04": { code: "mardi 2", score: 2 },
    "2025-02-11": { code: "mardi 3", score: 3 }, // Réajusté selon vos notes (encadré noir)
    "2025-09-02": { code: "mardi 3", score: 3 }, // Top rentrée
    "2025-10-07": { code: "mardi 3", score: 3 }
  }
};

// Jours fériés France 2025
const FERIES_2025: string[] = [
  "2025-01-01", "2025-04-21", "2025-05-01", "2025-05-08", 
  "2025-05-29", "2025-06-09", "2025-07-14", "2025-08-15", 
  "2025-11-01", "2025-11-11", "2025-12-25"
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const targetDate = new Date(dateString);
  const month = targetDate.getMonth();
  const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 2 = Mardi, 5 = Vendredi...

  // Récupération de la tendance de base du mois
  const tendanceMois = CALENDRIER_2025.mensuel[month] || { score: 2, label: "Inconnu" };
  let niveauAffluence = tendanceMois.score; 
  let details = `Tendance globale de ce mois : ${tendanceMois.label}.`;

  // Check si une correction manuelle terrain existe
  if (CALENDRIER_2025.corrections[dateString]) {
    const correction = CALENDRIER_2025.corrections[dateString];
    niveauAffluence = correction.score;
    details += ` (Donnée terrain validée pour ce jour : ${correction.code})`;
  } else {
    // Logique algorithmique par défaut (Règles générales de votre fichier)
    if (dayOfWeek === 2 || dayOfWeek === 5) { 
      // Les mardis et vendredis profitent de la dynamique des mois forts
      if (niveauAffluence >= 4) niveauAffluence = 5; 
    }
    if (dayOfWeek === 0 || FERIES_2025.includes(dateString)) {
      // Dimanches et fériés : baisse générale de l'affluence en ville
      niveauAffluence = Math.max(1, niveauAffluence - 2);
      details += " Ralentissement dû au jour férié ou au dimanche.";
    }
  }

  // Traduction du score (0 à 5) en libellé textuel
  const libellesScore = [
    "Désert", 
    "Très peu de monde (Style V1/D1)", 
    "Modéré (Style Mardi 2 / V2)", 
    "Pas mal de monde", 
    "Beaucoup de monde (Style Mardi 3 / V3)", 
    "Plein à craquer 🔥"
  ];
  
  return NextResponse.json({
    date: dateString,
    jourSemaine: targetDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
    score: niveauAffluence,
    affluenceTexte: libellesScore[niveauAffluence] || "Non défini",
    details: details,
    periodeFavorabilite: niveauAffluence >= 4 ? "Favorable aux sorties" : niveauAffluence <= 2 ? "Défavorable / Calme" : "Moyenne"
  });
}
