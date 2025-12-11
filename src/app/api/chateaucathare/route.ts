// src/app/api/chateaucathare/route.ts

import { NextResponse } from 'next/server';

// --- Interface pour les données des châteaux ---
interface Chateau {
  id: number;
  name: string;
  city: string;
  department: 'Aude' | 'Ariège' | 'Other';
  type: 'Emblematic' | 'Secondary'; // Pour le filtrage
  lat: number; // Latitude (À REMPLACER)
  lng: number; // Longitude (À REMPLACER)
}

// --- Données des châteaux (Mise en page des données que vous avez fournies) ---
// **ATTENTION : Les coordonnées (lat/lng) ci-dessous sont FICTIVES et doivent être remplacées par les coordonnées GPS réelles.**
const chateauxData: Chateau[] = [
  // I. Les Sites Emblématiques (Citadelles du Vertige)
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

  // II. Autres Forteresses Médiévales et Sites Associés
  { id: 14, name: "Aumelas", city: "Aumelas", department: "Other", type: "Secondary", lat: 43.6000, lng: 3.5850 },
  { id: 15, name: "Auriac", city: "Auriac", department: "Aude", type: "Secondary", lat: 43.0230, lng: 2.4900 },
  { id: 16, name: "Belcastel-et-Buc", city: "Belcastel-et-Buc", department: "Aude", type: "Secondary", lat: 43.0650, lng: 2.3780 },
  { id: 17, name: "Bézu", city: "Bézu", department: "Aude", type: "Secondary", lat: 42.9400, lng: 2.2280 },
  { id: 18, name: "Capendu", city: "Capendu", department: "Aude", type: "Secondary", lat: 43.1550, lng: 2.4900 },
  { id: 19, name: "Chalabre", city: "Chalabre", department: "Aude", type: "Secondary", lat: 43.0560, lng: 2.0100 },
  // ... (Ajouter ici tous les autres châteaux secondaires avec leurs coordonnées)
  { id: 20, name: "Coustaussa", city: "Coustaussa", department: "Aude", type: "Secondary", lat: 42.9800, lng: 2.2900 },
  { id: 21, name: "Durban-Corbières", city: "Durban-Corbières", department: "Aude", type: "Secondary", lat: 42.9600, lng: 2.8000 },
  { id: 22, name: "Durban-sur-Arize", city: "Durban-sur-Arize", department: "Ariège", type: "Secondary", lat: 43.0200, lng: 1.3400 },
  { id: 23, name: "Durfort", city: "Durfort", department: "Ariège", type: "Secondary", lat: 43.0800, lng: 1.3600 },
  { id: 24, name: "Fenouillet", city: "Fenouillet", department: "Other", type: "Secondary", lat: 42.8000, lng: 2.4000 },
  { id: 25, name: "Gruissan", city: "Gruissan", department: "Aude", type: "Secondary", lat: 43.1100, lng: 3.1000 },
  { id: 26, name: "Penne d'Albigeois", city: "Penne d'Albigeois", department: "Other", type: "Secondary", lat: 44.0700, lng: 1.7300 },
  { id: 27, name: "Puivert", city: "Puivert", department: "Aude", type: "Secondary", lat: 42.9300, lng: 2.0500 },
  { id: 28, name: "Quillan", city: "Quillan", department: "Aude", type: "Secondary", lat: 42.8700, lng: 2.1800 },
  { id: 29, name: "Saissac", city: "Saissac", department: "Aude", type: "Secondary", lat: 43.3400, lng: 2.1500 },
  { id: 30, name: "Usson", city: "Usson", department: "Aude", type: "Secondary", lat: 42.7900, lng: 2.1800 },
  // NOTE: Veuillez ajouter toutes les autres lignes ici avec leurs coordonnées réelles.
];

export async function GET() {
  // Simule une petite latence réseau
  // await new Promise(resolve => setTimeout(resolve, 500)); 
  
  return NextResponse.json(chateauxData);
}

export type ChateauType = Chateau; // Exporte l'interface pour le composant client
