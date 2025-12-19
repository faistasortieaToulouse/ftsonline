import { NextResponse } from 'next/server';

interface SiteTarn {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const tarnSites: SiteTarn[] = [
  { id: 1, commune: 'Albi', site: 'Cité Épiscopale et Cathédrale Sainte-Cécile', niveau: 1, categorie: 'incontournable', lat: 43.928, lng: 2.142 },
  { id: 2, commune: 'Ambialet', site: 'Prieuré et méandre du Tarn', niveau: 1, categorie: 'incontournable', lat: 43.945, lng: 2.379 },
  { id: 3, commune: 'Burlats', site: 'Pavillon d’Adélaïde et village médiéval', niveau: 1, categorie: 'incontournable', lat: 43.636, lng: 2.317 },
  { id: 4, commune: 'Carmaux', site: 'Musée de la Mine et Domaine de la Verrerie', niveau: 1, categorie: 'incontournable', lat: 44.053, lng: 2.158 },
  { id: 5, commune: 'Castres', site: 'Maisons sur l’Agout et Musée Goya', niveau: 1, categorie: 'incontournable', lat: 43.606, lng: 2.241 },
  { id: 6, commune: 'Castelnau-de-Montmiral', site: 'Bastide et place aux arcades', niveau: 1, categorie: 'incontournable', lat: 43.965, lng: 1.820 },
  { id: 7, commune: 'Cordes-sur-Ciel', site: 'Cité médiévale perchée', niveau: 1, categorie: 'incontournable', lat: 44.063, lng: 1.953 },
  { id: 8, commune: 'Durfort', site: 'Village des chaudronniers et artisans du cuivre', niveau: 2, categorie: 'remarquable', lat: 43.438, lng: 2.068 },
  { id: 9, commune: 'Gaillac', site: 'Abbaye Saint-Michel et vignobles', niveau: 1, categorie: 'incontournable', lat: 43.901, lng: 1.897 },
  { id: 10, commune: 'Hautpoul', site: 'Berceau médiéval de Mazamet et passerelle', niveau: 1, categorie: 'incontournable', lat: 43.475, lng: 2.378 },
  { id: 11, commune: 'Labastide-de-Lévis', site: 'Bastide et Château de la Guiraudie', niveau: 1, categorie: 'incontournable', lat: 43.926, lng: 2.011 },
  { id: 12, commune: 'Lisle-sur-Tarn', site: 'Bastide de rive et Place aux Couverts', niveau: 1, categorie: 'incontournable', lat: 43.852, lng: 1.810 },
  { id: 13, commune: 'Mazamet', site: 'Ancienne cité lainière et Maison des Mémoires', niveau: 1, categorie: 'incontournable', lat: 43.491, lng: 2.373 },
  { id: 14, commune: 'Monestiès', site: 'Mise au Tombeau et village médiéval', niveau: 1, categorie: 'incontournable', lat: 44.071, lng: 2.097 },
  { id: 15, commune: 'Penne', site: 'Forteresse médiévale sur l’éperon rocheux', niveau: 1, categorie: 'incontournable', lat: 44.077, lng: 1.730 },
  { id: 16, commune: 'Puycelsi', site: 'Forteresse aux portes du massif de la Grésigne', niveau: 1, categorie: 'incontournable', lat: 43.993, lng: 1.710 },
  { id: 17, commune: 'Sorèze', site: 'Abbaye-École et Musée Dom Robert', niveau: 1, categorie: 'incontournable', lat: 43.452, lng: 2.067 },
];

export async function GET() {
  return NextResponse.json(tarnSites);
}
