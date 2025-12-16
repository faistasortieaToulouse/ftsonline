// src/app/api/museepo/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseePO {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données complètes des musées avec des coordonnées géographiques APPROXIMATIVES (à vérifier)
const museesPO: MuseePO[] = [
  { commune: 'Amélie-les-Bains', nom: 'Musée des Arts et Traditions Populaires', categorie: 'Arts & Traditions Populaires', adresse: 'Place du 8 Mai 1945, 66110 Amélie-les-Bains', url: 'https://www.amelie-les-bains.com/musee-arts-et-traditions-populaires', lat: 42.4746, lng: 2.6713 },
  { commune: 'Amélie-les-Bains', nom: 'Musée de la Poste', categorie: 'Musée thématique (Histoire de la Poste)', adresse: '2, avenue du Vallespir, 66110 Amélie-les-Bains', url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-de-la-poste-amelie-les-bains-palalda_1850785', lat: 42.4754, lng: 2.6719 },
  { commune: 'Amélie-les-Bains-Palalda', nom: 'MUSÉE AL CASAL DE PALALDA (CIAP)', categorie: "Centre d'Interprétation (Patrimoine)", adresse: 'Ancienne Mairie, 66110 Palalda', url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-al-casal-de-palalda-ciap_1850783', lat: 42.4839, lng: 2.6644 },
  { commune: 'Argelès-sur-Mer', nom: "Maison du Patrimoine Casa de l'Albera", categorie: 'Patrimoine Local', adresse: 'Rue du 14 Juillet, 66700 Argelès-sur-Mer', url: 'https://www.argeles-sur-mer.com/fr/maison-du-patrimoine-casa-de-lalbera', lat: 42.5482, lng: 3.0101 },
  { commune: 'Arles-sur-Tech', nom: 'Musée du Fer', categorie: 'Musée thématique (Métallurgie / Fer)', adresse: 'Foyer Rural, 66150 Arles-sur-Tech', url: 'https://www.pyrenees-ceret-suddefrance.com/musee-du-fer', lat: 42.4633, lng: 2.6288 },
  { commune: 'Banyuls-dels-Aspres', nom: 'Musée Vin, Vigne et Traditions au Château Montana', categorie: 'Musée thématique (Viniculture)', adresse: 'Château Montana, 66300 Banyuls-dels-Aspres', url: 'https://www.chateaux-montana.com/musee', lat: 42.5694, lng: 2.8797 },
  { commune: 'Banyuls-sur-Mer', nom: 'Musée Maillol de Banyuls-sur-Mer', categorie: 'Musée d’Art (sur Aristide Maillol)', adresse: 'Ferme de la Métairie, 66650 Banyuls-sur-Mer', url: 'https://www.museemaillol.com/banyuls-sur-mer', lat: 42.4578, lng: 3.1042 },
  { commune: 'Bélesta', nom: 'Château-musée de Préhistoire de Bélesta', categorie: 'Musée Archéologique / Préhistoire', adresse: 'D612, 66720 Bélesta', url: 'http://www.chateau-belesta.com', lat: 42.7483, lng: 2.6027 },
  { commune: 'Cases-de-Pène', nom: "Jau / Espace d'Art Contemporain", categorie: 'Art Contemporain', adresse: 'Château de Jau, Route de Cases de Pène, 66600 Cases-de-Pène', url: 'https://www.chateaudejau.com/espace-art-contemporain', lat: 42.7667, lng: 2.8020 },
  { commune: 'Le Boulou', nom: "MAISON DE L'EAU ET DE LA MÉDITERRANÉE", categorie: "Centre d'Interprétation (Eau et Nature)", adresse: '1, Avenue de la Mède, 66160 Le Boulou', url: 'https://www.tourisme-leboulou.fr/maison-de-leau-et-de-la-mediterranee-le-boulou', lat: 42.5458, lng: 2.8396 },
];

export async function GET() {
  return NextResponse.json(museesPO);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseePO;
