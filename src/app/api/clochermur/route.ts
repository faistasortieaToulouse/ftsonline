import { NextResponse } from 'next/server';

export type ClocherMurSite = {
  id: number;
  commune: string;
  description: string;
  secteur: string;
  distanceKm: number;
  lat: number;
  lng: number;
};

const clochersData: ClocherMurSite[] = [
  { id: 1, commune: "Baziège", description: "Église Saint-Étienne (clocher-mur à 5 baies)", secteur: "Lauragais", distanceKm: 22, lat: 43.4542, lng: 1.6142 },
  { id: 2, commune: "Montgiscard", description: "Église Saint-André (clocher-mur typique)", secteur: "Lauragais", distanceKm: 20, lat: 43.4575, lng: 1.5739 },
  { id: 3, commune: "Villefranche-de-Lauragais", description: "Église avec clocher-mur monumental", secteur: "Lauragais", distanceKm: 35, lat: 43.3986, lng: 1.7186 },
  { id: 4, commune: "Auzielle", description: "Église Saint-Paul", secteur: "Sud-Est Toulousain", distanceKm: 15, lat: 43.5422, lng: 1.5653 },
  { id: 5, commune: "Lanta", description: "Église Notre-Dame de l'Assomption", secteur: "Est Toulousain", distanceKm: 20, lat: 43.5594, lng: 1.6553 },
  // Ajoutez ici vos autres communes...
];

export async function GET() {
  return NextResponse.json(clochersData);
}