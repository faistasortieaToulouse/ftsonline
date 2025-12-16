// src/app/api/museehg/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseeHG {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données des musées de la Haute-Garonne (31) avec coordonnées approximatives.
// Règles de capitalisation appliquées (première lettre majuscule, reste minuscule)
const museesHG: MuseeHG[] = [
  // 1. Fondation René Pous
  { commune: 'Auterive', nom: 'Fondation rené pous', categorie: 'Art', adresse: 'Les Escloupiès, route de Grépiac, 31190 Auterive', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/fondation-rene-pous-956718', lat: 43.3508, lng: 1.4883 },
  // 2. Musée André Abbal
  { commune: 'Carbonne', nom: 'Musée andré abbal', categorie: 'Art', adresse: '10 rue du sculpteur Abbal, 31390 Carbonne', url: 'http://www.ville-carbonne.fr/Musee-Abbal.html', lat: 43.2848, lng: 1.2294 },
  // 3. Musée de Rizla Croix
  { commune: 'Mazères-sur-salat', nom: 'Musée de rizla croix', categorie: 'Art', adresse: 'Rue du Stade, 31260 Mazères-sur-Salat', url: 'http://www.tourisme-occitanie.com/musee-rizla-croix/mazeres-sur-salat', lat: 43.1095, lng: 1.0505 },
  // 4. Musée de Peinture de Saint-Frajou
  { commune: 'Saint-frajou', nom: 'Musée de peinture de saint-frajou', categorie: 'Art', adresse: 'Place de la Mairie, 31230 Saint-Frajou', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-de-peinture-955606', lat: 43.2505, lng: 0.8142 },
];

export async function GET() {
  return NextResponse.json(museesHG);
}

// Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseeHG;
