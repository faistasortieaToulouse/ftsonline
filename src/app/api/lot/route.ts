// src/app/api/lot/route.ts
import { NextResponse } from 'next/server';

interface SiteLot {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
}

const lotSites: SiteLot[] = [
  { id: 1, commune: 'Albas', site: 'Village et vallée du Lot', niveau: 1, categorie: 'incontournable' },
  { id: 2, commune: 'Autoire', site: 'Cirque et cascade', niveau: 1, categorie: 'incontournable' },
  { id: 3, commune: 'Bélaye', site: 'Village et panorama sur le Lot', niveau: 1, categorie: 'incontournable' },
  { id: 4, commune: 'Cahors', site: 'Pont Valentré et centre historique', niveau: 1, categorie: 'incontournable' },
  { id: 5, commune: 'Calvignac', site: 'Village perché', niveau: 1, categorie: 'incontournable' },
  { id: 6, commune: 'Capdenac-le-Haut', site: 'Village médiéval fortifié', niveau: 1, categorie: 'incontournable' },
  { id: 7, commune: 'Cardaillac', site: 'Tours médiévales et village', niveau: 1, categorie: 'incontournable' },
  { id: 8, commune: 'Carennac', site: 'Prieuré clunisien', niveau: 1, categorie: 'incontournable' },
  { id: 9, commune: 'Carlucet', site: 'Village rural et patrimoine', niveau: 1, categorie: 'incontournable' },
  { id: 10, commune: 'Castelnau-Montratier', site: 'Bastide et place centrale', niveau: 1, categorie: 'incontournable' },
  { id: 11, commune: 'Creysse', site: 'Village et bords du Lot', niveau: 1, categorie: 'incontournable' },
  { id: 12, commune: 'Espagnac', site: 'Village et vallée du Célé', niveau: 1, categorie: 'incontournable' },
  { id: 13, commune: 'Espédaillac', site: 'Village du causse', niveau: 1, categorie: 'incontournable' },
  { id: 14, commune: 'Figeac', site: 'Centre historique et musée Champollion', niveau: 1, categorie: 'incontournable' },
  { id: 15, commune: 'Flaugnac', site: 'Village et panorama', niveau: 2, categorie: 'remarquable' },
  { id: 16, commune: 'Gigouzac', site: 'Village médiéval', niveau: 1, categorie: 'incontournable' },
  { id: 17, commune: 'Gluges', site: 'Falaises et vallée de la Dordogne', niveau: 1, categorie: 'incontournable' },
  { id: 18, commune: 'Goujounac', site: 'Village du Quercy', niveau: 2, categorie: 'remarquable' },
  { id: 19, commune: 'Gourdon', site: 'Ville médiévale perchée', niveau: 1, categorie: 'incontournable' },
  { id: 20, commune: 'Lacapelle-Marival', site: 'Château médiéval', niveau: 1, categorie: 'incontournable' },
  { id: 21, commune: 'Larroque-Toirac', site: 'Village et vallée du Lot', niveau: 1, categorie: 'incontournable' },
  { id: 22, commune: 'Lavercantière', site: 'Village rural', niveau: 1, categorie: 'incontournable' },
  { id: 23, commune: 'Les Arques', site: 'Musée Zadkine et village', niveau: 1, categorie: 'incontournable' },
  { id: 24, commune: 'Lherm', site: 'Village et patrimoine rural', niveau: 1, categorie: 'incontournable' },
  { id: 25, commune: 'Loubressac', site: 'Village classé et panorama', niveau: 1, categorie: 'incontournable' },
  { id: 26, commune: 'Marcilhac-sur-Célé', site: 'Abbaye et vallée du Célé', niveau: 1, categorie: 'incontournable' },
  { id: 27, commune: 'Martel', site: 'Ville aux sept tours', niveau: 1, categorie: 'incontournable' },
  { id: 28, commune: 'Montcuq', site: 'Village perché et tour', niveau: 1, categorie: 'incontournable' },
  { id: 29, commune: 'Montvalent', site: 'Falaises et belvédères', niveau: 1, categorie: 'incontournable' },
  { id: 30, commune: 'Prudhomat', site: 'Château de Castelnau-Bretenoux', niveau: 1, categorie: 'incontournable' },
  { id: 31, commune: 'Puy-l’Évêque', site: 'Ville médiévale et port', niveau: 1, categorie: 'incontournable' },
  { id: 32, commune: 'Rocamadour', site: 'Cité sacrée et sanctuaire', niveau: 1, categorie: 'incontournable' },
  { id: 33, commune: 'Séniergues', site: 'Village et causse', niveau: 2, categorie: 'remarquable' },
  { id: 34, commune: 'Souillac', site: 'Abbaye Sainte-Marie', niveau: 1, categorie: 'incontournable' },
  { id: 35, commune: 'Saint-Cirq-Lapopie', site: 'Village médiéval emblématique', niveau: 1, categorie: 'incontournable' },
  { id: 36, commune: 'Saint-Martin-le-Redon', site: 'Village et vallée', niveau: 2, categorie: 'remarquable' },
  { id: 37, commune: 'Les Pechs du Vers', site: 'Causse et paysages', niveau: 2, categorie: 'remarquable' },
  { id: 38, commune: 'Saint-Vincent-Rive-d’Olt', site: 'Village et berges du Lot', niveau: 1, categorie: 'incontournable' },
  { id: 39, commune: 'Thégra', site: 'Village et patrimoine', niveau: 1, categorie: 'incontournable' },
];

export async function GET() {
  return NextResponse.json(lotSites);
}
