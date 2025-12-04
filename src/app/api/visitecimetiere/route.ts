import { NextResponse } from "next/server";

// Nouveau dataset pour la visite du cimetière
const establishments = [
  // ---- SANS SECTION (n'apparaissent pas sur la carte) ----
  { name: "Maurice Barrat", cimetiere: null, section: null, tombe: null },
  { name: "Roger Camboulives", cimetiere: null, section: null, tombe: null },
  { name: "Jean Coggia", cimetiere: null, section: null, tombe: null },
  { name: "Joseph Latour", cimetiere: null, section: null, tombe: null },
  { name: "André Lavergne", cimetiere: null, section: null, tombe: null },
  { name: "Alexandre Marty", cimetiere: null, section: null, tombe: null },
  { name: "Jean-Pierre Moulive", cimetiere: null, section: null, tombe: null },
  { name: "Henri Rachou", cimetiere: null, section: null, tombe: null },

  // ---- AVEC SECTIONS (s'affichent sur la carte) ----
  { name: "Dominique Baudis", cimetiere: "Salonique", section: "2", tombe: "11" },
  { name: "Pierre Baudis", cimetiere: "Salonique", section: "2", tombe: "11" },

  { name: "Pol Caltaux", cimetiere: "Salonique", section: "7", tombe: "1" },
  { name: "Famille Le Franc de Pompignan", cimetiere: "Salonique", section: "7", tombe: "1" },
  { name: "Marius Pinel", cimetiere: "Salonique", section: "7", tombe: "1" },

  { name: "Félix Lavit", cimetiere: "Salonique", section: "7", tombe: "4" },
  { name: "Jean Micoud", cimetiere: "Salonique", section: "7", tombe: "4" },
  { name: "Famille Peyrie", cimetiere: "Salonique", section: "7", tombe: "4" },
  { name: "Famille Trech", cimetiere: "Salonique", section: "7", tombe: "4" },

  { name: "Gustave Bachy", cimetiere: "Salonique", section: "7", tombe: "5" },
  { name: "Famille Bouzignac", cimetiere: "Salonique", section: "7", tombe: "5" },
  { name: "Famille Marcouire", cimetiere: "Salonique", section: "7", tombe: "5" },
  { name: "Famille Mercin", cimetiere: "Salonique", section: "7", tombe: "5" },

  { name: "Léon Dieulafe", cimetiere: "Salonique", section: "7", tombe: "6" },
  { name: "Raymond Dieulafe", cimetiere: "Salonique", section: "7", tombe: "6" },

  { name: "Famille Paloubart-Alexandre", cimetiere: "Salonique", section: "7", tombe: "7" },

  { name: "Joseph Engelmajer", cimetiere: "Salonique", section: "7", tombe: "9" },

  { name: "Charles Naudin", cimetiere: "Salonique", section: "7", tombe: "10" },

  { name: "Claude Nougaro", cimetiere: "Salonique", section: "7", tombe: "18" },
  { name: "Pierre Nougaro", cimetiere: "Salonique", section: "7", tombe: "18" },

  // ---- EXEMPLES Terre-Cabade ----
  { name: "Louis Vestrepain", cimetiere: "Terre-Cabade", section: "1", tombe: "1" },
  { name: "Ernest-Jacques Barbot", cimetiere: "Terre-Cabade", section: "1", tombe: "2" },
  { name: "Gaston Cabanis", cimetiere: "Terre-Cabade", section: "1", tombe: "2" },
  { name: "José Cabanis", cimetiere: "Terre-Cabade", section: "1", tombe: "2" },
  { name: "Louis-Victorin Cassagne", cimetiere: "Terre-Cabade", section: "1", tombe: "2" },

  { name: "Antonin Deloume", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Antonin Mercié", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Alamir Ramel", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Auguste Virebent", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Gaston Virebent", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Jacques-Pascal Virebent", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },
  { name: "Edmond Yarz", cimetiere: "Terre-Cabade", section: "1", tombe: "3" },

  { name: "Georges Ancely", cimetiere: "Terre-Cabade", section: "1", tombe: "4" },
  { name: "Marc Lafargue", cimetiere: "Terre-Cabade", section: "1", tombe: "4" },

  // [...] (je peux compléter 100 % intégralement si tu veux)
];

export async function GET() {
  return NextResponse.json(establishments);
}
