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
  "2025-06-03": 2, "2025-06-10": 2, "2025-06-17": 2, "2025-06-24": 3,
  // Juillet
  "2025-07-01": 3, "2025-07-08": 2, "2025-07-15": 2, "2025-07-22": 2, "2025-07-29": 3,
  // Août
  "2025-08-05": 3, "2025-08-12": 1, "2025-08-19": 1, "2025-08-26": 3,
  // Septembre
  "2025-09-02": 3, "2025-09-09": 1, "2025-09-16": 2, "2025-09-23": 1, "2025-09-30": 3,
  // Octobre
  "2025-10-07": 3, "2025-10-14": 3, "2025-10-21": 1, "2025-10-28": 1,
  // Novembre
  "2025-11-04": 1, "2025-11-12": 1, "2025-11-18": 1, "2025-11-25": 1,
  // Décembre
  "2025-12-02": 1, "2025-12-09": 1, "2025-12-16": 1, "2025-12-23": 1, "2025-12-30": 1
};

// Jours fériés France 2025
const FERIES_2025: string[] = [
  "2025-01-01", "2025-04-21", "2025-05-01", "2025-05-08", 
  "2025-05-29", "2025-06-09", "2025-07-14", "2025-08-15", 
  "2025-11-01", "2025-11-11", "2025-12-25"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateString = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const targetDate = new Date(dateString);
    const dayOfWeek = targetDate.getDay(); // 0 = Dimanche, 2 = Mardi, 5 = Vendredi...
    
    let niveauCalcule = 1;
    let sourceInfo = "Calculé par extrapolation";

    // 1. Si la date demandée possède sa propre donnée terrain de référence (nos Mardis)
    if (DATA_TERRAIN_2025[dateString] !== undefined) {
      niveauCalcule = DATA_TERRAIN_2025[dateString];
      sourceInfo = "Donnée terrain exacte (Mardi)";
    } else {
      // 2. Extrapolation pour les autres jours de la semaine
      // On cherche le mardi le plus proche dans la même semaine
      const copieDate = new Date(targetDate);
      const distanceAuMardi = 2 - dayOfWeek;
      
      copieDate.setDate(copieDate.getDate() + distanceAuMardi);
      const mardiProcheStr = copieDate.toISOString().split('T')[0];
      
      // Niveau de référence du mardi de la semaine courante (par défaut niveau 2 si introuvable)
      const niveauReferenceSemaine = DATA_TERRAIN_2025[mardiProcheStr] !== undefined ? DATA_TERRAIN_2025[mardiProcheStr] : 2;

      if (dayOfWeek === 5) { 
        // Vendredi : Dynamique de sortie plus forte que le mardi
        niveauCalcule = Math.min(3, niveauReferenceSemaine + 1);
        sourceInfo = `Extrapolé pour Vendredi (Basé sur le Mardi de référence de Niveau ${niveauReferenceSemaine})`;
      } else if (dayOfWeek === 0 || FERIES_2025.includes(dateString)) { 
        // Dimanche ou Férié : Calme par défaut
        niveauCalcule = 1;
        sourceInfo = "Jour férié ou Dimanche (Systématiquement calme)";
      } else { 
        // Lundi, Mercredi, Jeudi, Samedi
        niveauCalcule = niveauReferenceSemaine;
        sourceInfo = `Jour standard (Calibré sur le Mardi de référence de Niveau ${niveauReferenceSemaine})`;
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
      score: niveauCalcule, // Valeur stricte 1, 2 ou 3
      affluenceTexte: libellesNiveaux[niveauCalcule] || "Inconnu",
      details: sourceInfo
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne lors du calcul de la date." },
      { status: 500 }
    );
  }
}
