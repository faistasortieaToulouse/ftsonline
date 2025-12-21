// Liste des signes avec leurs dates de début
const ZODIAQUE = [
  { signe: "Capricorne", mois: 0, jour: 20 },
  { signe: "Verseau", mois: 1, jour: 19 },
  { signe: "Poissons", mois: 2, jour: 20 },
  { signe: "Bélier", mois: 3, jour: 20 },
  { signe: "Taureau", mois: 4, jour: 21 },
  { signe: "Gémeaux", mois: 5, jour: 21 },
  { signe: "Cancer", mois: 6, jour: 23 },
  { signe: "Lion", mois: 7, jour: 23 },
  { signe: "Vierge", mois: 8, jour: 23 },
  { signe: "Balance", mois: 9, jour: 23 },
  { signe: "Scorpion", mois: 10, jour: 22 },
  { signe: "Sagittaire", mois: 11, jour: 22 },
  { signe: "Capricorne", mois: 12, jour: 31 },
];

export function getSigneZodiaque(date: Date): string {
  const mois = date.getMonth();
  const jour = date.getDate();

  const astro = ZODIAQUE.find((z) => {
    if (mois < z.mois) return true;
    if (mois === z.mois && jour <= z.jour) return true;
    return false;
  });

  return astro ? astro.signe : "Capricorne";
}

/**
 * Calcul simplifié de l'ascendant basé sur l'heure de la journée.
 * (Note : Un vrai calcul nécessite la date précise et le lieu, 
 * ceci est une approximation symbolique basée sur le cycle solaire)
 */
export function getAscendant(date: Date): string {
  const heure = date.getHours();
  
  if (heure >= 6 && heure < 8) return "Bélier";
  if (heure >= 8 && heure < 10) return "Taureau";
  if (heure >= 10 && heure < 12) return "Gémeaux";
  if (heure >= 12 && heure < 14) return "Cancer";
  if (heure >= 14 && heure < 16) return "Lion";
  if (heure >= 16 && heure < 18) return "Vierge";
  if (heure >= 18 && heure < 20) return "Balance";
  if (heure >= 20 && heure < 22) return "Scorpion";
  if (heure >= 22 && heure < 0) return "Sagittaire";
  if (heure >= 0 && heure < 2) return "Capricorne";
  if (heure >= 2 && heure < 4) return "Verseau";
  return "Poissons";
}