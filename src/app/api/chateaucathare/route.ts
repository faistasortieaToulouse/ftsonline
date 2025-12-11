// src/app/api/chateaucathare/route.ts

import { NextResponse } from 'next/server';

// --- Interface pour les données des châteaux ---
// --- Interface pour les données des châteaux ---
export interface Chateau {
  id: number;
  name: string;
  city: string;
  // AJOUT DE 'Tarn' et 'Tarn et Garonne'
  department: 'Ariège' | 'Aude' | 'Hérault'| 'Pyrénées Orientales' | 'Tarn' | 'Tarn et Garonne' | 'Lérida';
  type: 'Emblematic' | 'Secondary'; // 'Emblematic' pour Principal, 'Secondary' pour Secondaire
  lat: number; // Latitude (À REMPLACER)
  lng: number; // Longitude (À REMPLACER)
}

// --- Données des châteaux Cathares ---
// L'exportation 'export const' permet d'importer directement ces données dans page.tsx.
// **ATTENTION : Les coordonnées (lat/lng) ci-dessous sont FICTIVES et doivent être remplacées par les coordonnées GPS réelles.**
export const chateauxData: Chateau[] = [
  // I. Les Sites Emblématiques (Citadelles du Vertige) - IDs 1 à 13
  { id: 1, name: "Aguilar", city: "Aguilar", department: "Aude", type: "Emblematic", lat: 43.0841, lng: 2.5701 },
  { id: 2, name: "Arques", city: "Arques", department: "Aude", type: "Emblematic", lat: 42.9515, lng: 2.3789 },
  { id: 3, name: "Foix", city: "Foix", department: "Ariège", type: "Emblematic", lat: 42.9667, lng: 1.6000 },
  { id: 4, name: "Lastours (Cabaret)", city: "Lastours", department: "Aude", type: "Emblematic", lat: 43.3444, lng: 2.3888 },
  { id: 5, name: "Lordat", city: "Lordat", department: "Ariège", type: "Emblematic", lat: 42.8406, lng: 1.7645 },
  { id: 6, name: "Miglos", city: "Miglos", department: "Ariège", type: "Emblematic", lat: 42.8532, lng: 1.6371 },
  { id: 7, name: "Montségur", city: "Montségur", department: "Ariège", type: "Emblematic", lat: 42.8809, lng: 1.8329 },
  { id: 8, name: "Peyrepertuse", city: "Duilhac-sous-Peyrepertuse", department: "Aude", type: "Emblematic", lat: 42.8687, lng: 2.5513 },
  { id: 9, name: "Puilaurens", city: "Puilaurens", department: "Aude", type: "Emblematic", lat: 42.8252, lng: 2.3275 },
  { id: 10, name: "Quéribus", city: "Cucugnan", department: "Aude", type: "Emblematic", lat: 42.8427, lng: 2.6580 },
  { id: 11, name: "Roquefixade", city: "Roquefixade", department: "Ariège", type: "Emblematic", lat: 42.9461, lng: 1.7161 },
  { id: 12, name: "Termes", city: "Termes", department: "Aude", type: "Emblematic", lat: 43.0336, lng: 2.4184 },
  { id: 13, name: "Villerouge-Termenès", city: "Villerouge-Termenès", department: "Aude", type: "Emblematic", lat: 43.0232, lng: 2.5937 },

  // II. Autres Forteresses Médiévales et Sites Associés - IDs consécutifs à partir de 14
  
  // Châteaux existants (IDs 14-25)
  { id: 14, name: "Aumelas", city: "Aumelas", department: "Hérault", type: "Secondary", lat: 43.6000, lng: 3.5850 },
  { id: 15, name: "Auriac", city: "Auriac", department: "Aude", type: "Secondary", lat: 43.0230, lng: 2.4900 },
  { id: 16, name: "Belcastel-et-Buc", city: "Belcastel-et-Buc", department: "Aude", type: "Secondary", lat: 43.0650, lng: 2.3780 },
  { id: 17, name: "Bézu", city: "Bézu", department: "Aude", type: "Secondary", lat: 42.9400, lng: 2.2280 },
  { id: 18, name: "Capendu", city: "Capendu", department: "Aude", type: "Secondary", lat: 43.1550, lng: 2.4900 },
  { id: 19, name: "Chalabre", city: "Chalabre", department: "Aude", type: "Secondary", lat: 43.0560, lng: 2.0100 },
  { id: 20, name: "Coustaussa", city: "Coustaussa", department: "Aude", type: "Secondary", lat: 42.9800, lng: 2.2900 },
  { id: 21, name: "Durban-Corbières", city: "Durban-Corbières", department: "Aude", type: "Secondary", lat: 42.9600, lng: 2.8000 },
  { id: 22, name: "Durban-sur-Arize", city: "Durban-sur-Arize", department: "Ariège", type: "Secondary", lat: 43.0200, lng: 1.3400 },
  { id: 23, name: "Durfort", city: "Durfort", department: "Ariège", type: "Secondary", lat: 43.0800, lng: 1.3600 },
  { id: 24, name: "Fenouillet", city: "Fenouillet", department: "Pyrénées Orientales", type: "Secondary", lat: 42.8000, lng: 2.4000 },
  { id: 25, name: "Gruissan", city: "Gruissan", department: "Aude", type: "Secondary", lat: 43.1100, lng: 3.1000 },
  { id: 26, name: "Gósol", city: "Gósol", department: "Lérida", type: "Secondary", lat: 42.2600, lng: 1.6300 }, // Espagne, à vérifier
  { id: 27, name: "Lagarde", city: "Lagarde", department: "Ariège", type: "Secondary", lat: 43.0600, lng: 1.8900 }, 
  { id: 28, name: "Lauzières", city: "Lauzières", department: "Hérault", type: "Secondary", lat: 43.6100, lng: 3.1900 },
  { id: 29, name: "Le Caylar", city: "Le Caylar", department: "Hérault", type: "Secondary", lat: 43.8800, lng: 3.3200 },
  { id: 30, name: "Malavieille", city: "Malavieille", department: "Hérault", type: "Secondary", lat: 43.5000, lng: 3.1800 },
  { id: 31, name: "Mas-des-Cours", city: "Mas-des-Cours", department: "Aude", type: "Secondary", lat: 43.0800, lng: 2.3000 },
  { id: 32, name: "Mirabat", city: "Mirabat", department: "Ariège", type: "Secondary", lat: 42.8000, lng: 1.4000 },
  { id: 33, name: "Miramont", city: "Miramont", department: "Aude", type: "Secondary", lat: 43.2000, lng: 0.1000 }, 
  { id: 34, name: "Montaillou", city: "Montaillou", department: "Ariège", type: "Secondary", lat: 42.8200, lng: 1.9100 },
  { id: 35, name: "Montaragou", city: "Montaragou", department: "Ariège", type: "Secondary", lat: 43.4000, lng: 2.4000 },
  { id: 36, name: "Montferrand", city: "Montferrand", department: "Aude", type: "Secondary", lat: 43.3400, lng: 1.8300 },
  { id: 37, name: "Montmaur", city: "Montmaur", department: "Aude", type: "Secondary", lat: 43.3700, lng: 1.7000 }, 
  { id: 38, name: "Montpeyroux", city: "Montpeyroux", department: "Hérault", type: "Secondary", lat: 43.7200, lng: 3.5000 },
  { id: 39, name: "Montréal-de-Sos", city: "Montréal-de-Sos", department: "Ariège", type: "Secondary", lat: 42.8300, lng: 1.5800 },
  { id: 40, name: "Montséret", city: "Montséret", department: "Aude", type: "Secondary", lat: 43.1000, lng: 2.9000 },
  { id: 41, name: "Mourcairol", city: "Mourcairol", department: "Ariège", type: "Secondary", lat: 42.8600, lng: 1.7000 },
  { id: 42, name: "Nègrepelisse", city: "Nègrepelisse", department: "Tarn et Garonne", type: "Secondary", lat: 44.0800, lng: 1.5500 },
  { id: 43, name: "Opoul", city: "Opoul-Périllos", department: "Pyrénées Orientales", type: "Secondary", lat: 42.8700, lng: 2.9200 },
  { id: 44, name: "Padern", city: "Padern", department: "Aude", type: "Secondary", lat: 42.8800, lng: 2.7200 },
  { id: 45, name: "Pailhès", city: "Pailhès", department: "Ariège", type: "Secondary", lat: 43.0800, lng: 1.4800 },
  { id: 46, name: "Penne d'Albigeois", city: "Penne d'Albigeois", department: "Tarn", type: "Secondary", lat: 44.0700, lng: 1.7300 },
  { id: 47, name: "Puivert", city: "Puivert", department: "Aude", type: "Secondary", lat: 42.9300, lng: 2.0500 },
  { id: 48, name: "Puycelci", city: "Puycelsi", department: "Tarn", type: "Secondary", lat: 43.9900, lng: 1.7600 },
  { id: 49, name: "Quérigut", city: "Quérigut", department: "Aude", type: "Secondary", lat: 42.7900, lng: 2.1900 },
  { id: 50, name: "Quillan", city: "Quillan", department: "Aude", type: "Secondary", lat: 42.8700, lng: 2.1800 },
  { id: 51, name: "Roquefort-sur-le-Sor", city: "Roquefort-sur-le-Sor", department: "Ariège", type: "Secondary", lat: 42.9200, lng: 1.3400 },
  { id: 52, name: "Saint-Pierre-des-Clars", city: "Saint-Pierre-des-Clars", department: "Aude", type: "Secondary", lat: 43.3000, lng: 2.3000 },
  { id: 53, name: "Saissac", city: "Saissac", department: "Aude", type: "Secondary", lat: 43.3400, lng: 2.1500 },
  { id: 54, name: "Tautavel", city: "Tautavel", department: "Pyrénées Orientales", type: "Secondary", lat: 42.8700, lng: 2.7600 },
  { id: 55, name: "Usson", city: "Usson", department: "Aude", type: "Secondary", lat: 42.7900, lng: 2.1800 },
  { id: 56, name: "Valros", city: "Valros", department: "Hérault", type: "Secondary", lat: 43.4100, lng: 3.3200 },
  { id: 57, name: "Ventajou (Félines-Minervois)", city: "Félines-Minervois", department: "Hérault", type: "Secondary", lat: 43.3200, lng: 2.7000 },
  { id: 58, name: "Villerouge-la-Crémade", city: "Villerouge-la-Crémade", department: "Aude", type: "Secondary", lat: 43.1500, lng: 2.8000 },
  { id: 59, name: "Viviourès (Valflaunès)", city: "Valflaunès", department: "Hérault", type: "Secondary", lat: 43.7600, lng: 3.8200 },
];

// Fonction GET pour la route API /api/chateaucathare
export async function GET() {
  return NextResponse.json(chateauxData);
}
