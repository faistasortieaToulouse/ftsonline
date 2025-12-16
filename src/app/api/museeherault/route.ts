// src/app/api/museeherault/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseeHerault {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données des musées de l'Hérault avec des coordonnées géographiques APPROXIMATIVES (à vérifier)
const museesHerault: MuseeHerault[] = [
  { commune: 'AGDE', nom: 'MUSÉE AGATHOIS JULES BAUDOU', categorie: 'Archéologie / Arts & Traditions', adresse: '5, rue de la Fraternité, 34300 Agde', url: 'https://www.capdagde.com/musee-agathois', lat: 43.3134, lng: 3.4735 },
  { commune: 'AGDE', nom: 'CHÂTEAU LAURENS', categorie: 'Patrimoine / Art Déco', adresse: '65, Chemin de Notre-Dame-de-Grau, 34300 Agde', url: 'https://www.chateaulaurens.fr', lat: 43.3082, lng: 3.4709 },
  { commune: 'AGDE', nom: 'GALERIE DU PATRIMOINE', categorie: 'Galerie d\'exposition', adresse: 'Hôtel de Ville, Place du Jeu de Ballon, 34300 Agde', url: 'https://www.capdagde.com/galerie-du-patrimoine', lat: 43.3138, lng: 3.4731 },
  { commune: 'BASSAN', nom: 'LES CONTES DES MEUBLES MODESTES', categorie: 'Arts Décoratifs / Mobilier', adresse: '26, Grand\' Rue, 34290 Bassan', url: 'https://www.herault-tourisme.com/fiche/les-contes-des-meubles-modestes-bassan/', lat: 43.4079, lng: 3.2505 },
  { commune: 'BEDARIEUX', nom: 'MUSÉE DU TRAIN ET DE LA PHOTOGRAPHIE', categorie: 'Musée thématique (Train / Photo)', adresse: 'Place aux Herbes, 34600 Bédarieux', url: 'https://www.herault-tourisme.com/fiche/musee-du-train-et-de-la-photographie-bedarieux/', lat: 43.6062, lng: 3.1517 },
  { commune: 'BERLOU', nom: 'LA MAISON DU CAMBRIEN - MUSEE PALEONTOLOGIQUE', categorie: 'Paléontologie / Sciences', adresse: 'Hameau de Berlou, 34360 Berlou', url: 'https://www.maisonducambrien.fr', lat: 43.4912, lng: 3.0189 },
];

export async function GET() {
  return NextResponse.json(museesHerault);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseeHerault;
