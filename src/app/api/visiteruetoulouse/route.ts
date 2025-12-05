// app/api/visiteruetoulouse/route.ts
import { NextResponse } from "next/server";

// Données simplifiées, coordonnées fictives pour exemple
// Tu peux remplacer par des coordonnées réelles si disponibles
const lieux = [
  { id: 1, numero: "1", rue: "Albert Lautman", lieu: "bâtiment remarquable", lat: 43.611, lng: 1.444 },
  { id: 2, numero: "3", rue: "Albert Lautman", lieu: "bâtiment remarquable", lat: 43.612, lng: 1.444 },
  { id: 3, numero: "37", rue: "Armand Duportal", lieu: "immeuble", lat: 43.615, lng: 1.445 },
  { id: 4, numero: "49", rue: "Armand Duportal", lieu: "immeuble", lat: 43.616, lng: 1.446 },
  { id: 5, numero: "7", rue: "Arts", lieu: "hôtel Baichère, tour", lat: 43.617, lng: 1.447 },
  { id: 6, numero: "7", rue: "Arts", lieu: "hôtel Nolet disp ?", lat: 43.617, lng: 1.448 },
  { id: 7, numero: "10", rue: "Arts", lieu: "hôtel Dupuy-Montaut", lat: 43.618, lng: 1.448 },
  { id: 8, numero: "12", rue: "Arts", lieu: "Collège Boulbonne, couvent, auj, imm. 1910 ?", lat: 43.619, lng: 1.449 },
  { id: 9, numero: "14", rue: "Arts", lieu: "couvent Dame Andouin : 14-16", lat: 43.619, lng: 1.450 },
  { id: 10, numero: "16", rue: "Arts", lieu: "bâtiment remarquable", lat: 43.620, lng: 1.450 },
  // Ajoute tous les autres lieux ici en suivant le même format
];

export async function GET() {
  return NextResponse.json({ lieux });
}
