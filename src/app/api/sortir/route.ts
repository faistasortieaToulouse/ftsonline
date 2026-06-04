import { NextResponse } from 'next/server';

// Dictionnaire strict de vos données terrain nettoyées (Format AAAA-MM-JJ)
const DATA_TERRAIN_2025: Record<string, number> = {
  // Janvier
  "2025-01-07": 1, "2025-01-14": 3, "2025-01-21": 1, "2025-01-28": 1,
  // Février
  "2025-02-04": 3, "2025-02-11": 3, "2025-02-18": 3, "2025-02-25": 3,
  // Mars
  "2025-03-04": 3, "2025-03-11": 3, "2025-03-18": 2, "2025-03-25": 3,
  // Avril
  "2025-04-01": 2, "2025-04-15": 2, "2025-04-22": 1, "2025-04-29": 1,
  // Mai
  "2025-05-06": 2, "2025-05-13": 2, "2025-05-20": 2, "2025-05-27": 3,
  // Juin
  "2025-03-06": 2, "2025-06-10": 2, "2025-06-17": 2, "2025-06-24": 3,
  // Juillet
  "2025-07-01": 3, "2025-07-08": 2, "2025-07-15": 2, "2025-07-22": 2, "2025-07-29": 3,
  // Août
  "2025-08-05": 3, "2025-08-12": 1, "2025-08-19": 1, "2025-08-26": 3,
  // Septembre
  "2025-09-02": 3, "2025-09-09": 1, "2025-09-16": 2, "2025-09-23": 1, "2025-09-30": 3,
  // Octobre
  "2025-01-07": 3, "2025-10-14": 3, "2025-10-21": 1, "2025-10-28": 1,
  // Novembre
  "2025-11-04": 1, "2025-11-12": 1, "2025-11-18": 1, "2025-11-25": 1,
  // Décembre
  "2025-12-02": 1, "2025-12-09": 1, "2025-12-16": 1, "2025-12-23": 1, "2025-12-30": 1
};

// Jours fériés 2025 impactant les sorties
const FERIES_2025: string[] = [
  "2025-01-01", "2025-04-21", "2025-05-01", "2025-05-08", 
  "2025-05-29", "2025-06-09", "2025-07-14", "2025-08-15", 
  "2025-11-01", "2025-11-11", "2025-12-25"
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const targetDate = new Date(dateString);
  const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 2 = Mardi, 5 = Vendredi...
  
  let niveauCalculé = 1;
  let sourceInfo = "Calculé par extrapolation";

  // 1. Si la date demandée est explicitement dans vos données de référence (vos Mardis)
  if (DATA_TERRAIN_2025[dateString] !== undefined) {
    niveauCalculé = DATA_TERRAIN_2025[dateString];
    sourceInfo = "Donnée terrain exacte (Mardi)";
  } else {
    // 2. Extrapolation pour les autres jours de la semaine
    // On cherche le mardi le plus proche dans la même semaine pour calquer la tendance mensuelle/hebdomadaire
    const copieDate = new Date(targetDate);
    const distanceAuMardi = 2 - dayOfWeek;
    copieDate.setDate(copieDate.getDate() + distanceAuMains);
    const mardiProcheStr = copieDate.toISOString().split('T')[0];
    
    // Niveau de référence de la semaine courante
    const niveauReferenceSemaine = DATA_TERRAIN_2025[mardiProcheStr] || 2;

    if (dayOfWeek === 5) { // Vendredi : Forte tendance à sortir
      niveauCalculé = Math.min(3, niveauReferenceSemaine + 1);
      sourceInfo = `Extrapolé du Vendredi (Basé sur Mardi Référence niveau ${niveauReferenceSemaine})`;
    } else if (dayOfWeek === 0 || FERIES_2025.includes(dateString)) { // Dimanche ou Férié : Calme
      niveauCalculé = 1;
      sourceInfo = "Jour férié ou Dimanche (Systématiquement calme)";
    } else { // Lundi, Mercredi, Jeudi, Samedi
      niveauCalculé = niveauReferenceSemaine;
      sourceInfo = `Jour de semaine standard (Aligné sur Mardi Référence niveau ${niveauReferenceSemaine})`;
    }
  }

  // Correspondance stricte avec vos libellés de niveaux
  const libellesNiveaux: Record<number, string> = {
    1: "Peu de gens (Niveau 1)",
    2: "Nombre de gens moyen (Niveau 2)",
    3: "Beaucoup de monde (Niveau 3)"
  };

  return NextResponse.json({
    date: dateString,
    jourSemaine: targetDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
    score: niveauCalculé, // Valeur stricte 1, 2 ou 3
    affluenceTexte: libellesNiveaux[niveauCalculé] || "Inconnu",
    details: sourceInfo
  });
}
