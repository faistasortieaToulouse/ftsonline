import { NextResponse } from "next/server";

// Nouveau dataset demandé
const establishments = [
{ "address": "6 allées Soupirs", "name": "HLM", "lat": 43.59447, "lng": 1.45483 },
  { "address": "1 allées Soupirs", "name": "Cales du Radoub", "lat": 43.59492, "lng": 1.45376 },
  { "address": "allées Demoiselles", "name": "Villas allées Demoiselles", "lat": 43.58927, "lng": 1.45936 },
  { "address": "2 & 4 rue des Pyrénées", "name": "Maisons Martin (1910)", "lat": 43.58785, "lng": 1.45485 },
  { "address": "8 & 10 rue des Pyrénées", "name": "Villas", "lat": 43.58765, "lng": 1.45505 },
  { "address": "7 rue des Pyrénées", "name": "Maison", "lat": 43.58775, "lng": 1.45525 },
  { "address": "18 rue des Pyrénées", "name": "Maison", "lat": 43.58735, "lng": 1.45545 },
  { "address": "20-22 rue des Pyrénées", "name": "Maison", "lat": 43.58725, "lng": 1.45555 },
  { "address": "26 rue des Pyrénées", "name": "Maison", "lat": 43.58705, "lng": 1.45575 },
  { "address": "21 rue Demouilles", "name": "Toulousaine", "lat": 43.58985, "lng": 1.45465 },
  { "address": "31 rue Demouilles", "name": "Maison", "lat": 43.58925, "lng": 1.45525 },
  { "address": "35 rue Demouilles", "name": "Maison", "lat": 43.58905, "lng": 1.45545 },
  { "address": "38 rue Demouilles", "name": "Maison", "lat": 43.58895, "lng": 1.45535 },
  { "address": "40 rue Demouilles", "name": "Maison", "lat": 43.58885, "lng": 1.45545 },
  { "address": "42 rue Demouilles", "name": "Maison", "lat": 43.58875, "lng": 1.45555 },
  { "address": "32-34 rue Sainte-Philomène", "name": "Maison", "lat": 43.59015, "lng": 1.45335 },
  { "address": "22 rue Georges Picot", "name": "Maison", "lat": 43.58915, "lng": 1.45115 },
  { "address": "3 rue Félix Durrbach", "name": "Maison", "lat": 43.58885, "lng": 1.45195 },
  { "address": "43 allées des Demoiselles", "name": "Maison d'Antoine Labit", "lat": 43.59045, "lng": 1.45805 },
  { "address": "37 allées des Demoiselles", "name": "Maison", "lat": 43.59095, "lng": 1.45765 },
  { "address": "39 allées des Demoiselles", "name": "Maison", "lat": 43.59075, "lng": 1.45775 },
  { "address": "43 allées des Demoiselles", "name": "Maison", "lat": 43.59045, "lng": 1.45805 },
  { "address": "45 allées des Demoiselles", "name": "Villa Tourelles", "lat": 43.59025, "lng": 1.45825 },
  { "address": "9 rue André Delieux", "name": "Maison", "lat": 43.59125, "lng": 1.45635 },
  { "address": "14 rue André Delieux", "name": "Maison", "lat": 43.59145, "lng": 1.45615 },
  { "address": "10 rue Mondran", "name": "Lycée Gabriel Péri", "lat": 43.59465, "lng": 1.45125 },
  { "address": "10 rue Mondran", "name": "Ancienne usine à chaussures Myrys", "lat": 43.59465, "lng": 1.45125 },
  { "address": "rue des Martyrs de la Libération", "name": "Rue Martyrs Libération", "lat": 43.59195, "lng": 1.45195 },
  { "address": "21 rue Bégué-David", "name": "Maison", "lat": 43.59155, "lng": 1.46045 },
  { "address": "1 allées Paul Feuga", "name": "Maison Seube (bourreau)", "lat": 43.59315, "lng": 1.44295 },
  { "address": "7 allées Paul Feuga", "name": "Maison", "lat": 43.59285, "lng": 1.44355 },
  { "address": "5 rue des Trente-Six Ponts", "name": "Maison", "lat": 43.59255, "lng": 1.44435 },
  { "address": "25 rue des Trente-Six Ponts", "name": "Maison", "lat": 43.59125, "lng": 1.44525 },
  { "address": "47 rue des Trente-Six Ponts", "name": "Maison", "lat": 43.58985, "lng": 1.44625 },
  { "address": "38 rue des Trente-Six Ponts", "name": "Ancienne école véto", "lat": 43.59085, "lng": 1.44595 },
  { "address": "57 rue des Trente-Six Ponts", "name": "Toulousaine", "lat": 43.58925, "lng": 1.44665 },
  { "address": "66 rue des Trente-Six Ponts", "name": "Maison", "lat": 43.58885, "lng": 1.44715 },
  { "address": "68 rue des Trente-Six Ponts", "name": "Maison", "lat": 43.58875, "lng": 1.44725 },
  { "address": "1 rue Sainte-Catherine", "name": "Chapelle Sainte-Catherine", "lat": 43.59235, "lng": 1.44455 },
  { "address": "95 grande rue Saint-Michel", "name": "Chapelle des Lazaristes (prison)", "lat": 43.59055, "lng": 1.44915 },
  { "address": "1 rue des Abeilles", "name": "Immeuble avec tourelle", "lat": 43.58975, "lng": 1.45035 }
];

export async function GET() {
  return NextResponse.json(establishments);
}
