import { NextResponse } from 'next/server';

interface SiteLot {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const lotSites: SiteLot[] = [
  { id: 1, commune: 'Albas', site: 'Village et vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.463, lng: 1.201 },
  { id: 2, commune: 'Autoire', site: 'Cirque et cascade', niveau: 1, categorie: 'incontournable', lat: 44.855, lng: 1.763 },
  { id: 3, commune: 'Bélaye', site: 'Village et panorama sur le Lot', niveau: 1, categorie: 'incontournable', lat: 44.505, lng: 1.204 },
  { id: 4, commune: 'Cahors', site: 'Pont Valentré et centre historique', niveau: 1, categorie: 'incontournable', lat: 44.449, lng: 1.436 },
  { id: 5, commune: 'Calvignac', site: 'Village perché', niveau: 1, categorie: 'incontournable', lat: 44.483, lng: 1.781 },
  { id: 6, commune: 'Capdenac-le-Haut', site: 'Village médiéval fortifié', niveau: 1, categorie: 'incontournable', lat: 44.575, lng: 1.989 },
  { id: 7, commune: 'Cardaillac', site: 'Tours médiévales et village', niveau: 1, categorie: 'incontournable', lat: 44.665, lng: 1.931 },
  { id: 8, commune: 'Carennac', site: 'Prieuré clunisien', niveau: 1, categorie: 'incontournable', lat: 44.839, lng: 1.703 },
  { id: 9, commune: 'Carlucet', site: 'Village rural et patrimoine', niveau: 1, categorie: 'incontournable', lat: 44.689, lng: 1.527 },
  { id: 10, commune: 'Castelnau-Montratier', site: 'Bastide et place centrale', niveau: 1, categorie: 'incontournable', lat: 44.273, lng: 1.353 },
  { id: 11, commune: 'Creysse', site: 'Village et bords du Lot', niveau: 1, categorie: 'incontournable', lat: 44.828, lng: 1.673 },
  { id: 12, commune: 'Espagnac', site: 'Village et vallée du Célé', niveau: 1, categorie: 'incontournable', lat: 44.722, lng: 1.793 },
  { id: 13, commune: 'Espédaillac', site: 'Village du causse', niveau: 1, categorie: 'incontournable', lat: 44.671, lng: 1.681 },
  { id: 14, commune: 'Figeac', site: 'Centre historique et musée Champollion', niveau: 1, categorie: 'incontournable', lat: 44.608, lng: 2.031 },
  { id: 15, commune: 'Flaugnac', site: 'Village et panorama', niveau: 2, categorie: 'remarquable', lat: 44.356, lng: 1.337 },
  { id: 16, commune: 'Gigouzac', site: 'Village médiéval', niveau: 1, categorie: 'incontournable', lat: 44.567, lng: 1.445 },
  { id: 17, commune: 'Gluges', site: 'Falaises et vallée de la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.882, lng: 1.642 },
  { id: 18, commune: 'Goujounac', site: 'Village du Quercy', niveau: 2, categorie: 'remarquable', lat: 44.643, lng: 1.163 },
  { id: 19, commune: 'Gourdon', site: 'Ville médiévale perchée', niveau: 1, categorie: 'incontournable', lat: 44.739, lng: 1.386 },
  { id: 20, commune: 'Lacapelle-Marival', site: 'Château médiéval', niveau: 1, categorie: 'incontournable', lat: 44.726, lng: 1.923 },
  { id: 21, commune: 'Larroque-Toirac', site: 'Village et vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.498, lng: 1.828 },
  { id: 22, commune: 'Lavercantière', site: 'Village rural', niveau: 1, categorie: 'incontournable', lat: 44.688, lng: 1.284 },
  { id: 23, commune: 'Les Arques', site: 'Musée Zadkine et village', niveau: 1, categorie: 'incontournable', lat: 44.636, lng: 1.164 },
  { id: 24, commune: 'Lherm', site: 'Village et patrimoine rural', niveau: 1, categorie: 'incontournable', lat: 44.558, lng: 1.364 },
  { id: 25, commune: 'Loubressac', site: 'Village classé et panorama', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.784 },
  { id: 26, commune: 'Marcilhac-sur-Célé', site: 'Abbaye et vallée du Célé', niveau: 1, categorie: 'incontournable', lat: 44.642, lng: 1.807 },
  { id: 27, commune: 'Martel', site: 'Ville aux sept tours', niveau: 1, categorie: 'incontournable', lat: 44.936, lng: 1.608 },
  { id: 28, commune: 'Montcuq', site: 'Village perché et tour', niveau: 1, categorie: 'incontournable', lat: 44.339, lng: 1.209 },
  { id: 29, commune: 'Montvalent', site: 'Falaises et belvédères', niveau: 1, categorie: 'incontournable', lat: 44.872, lng: 1.680 },
  { id: 30, commune: 'Prudhomat', site: 'Château de Castelnau-Bretenoux', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.836 },
  { id: 31, commune: 'Puy-l’Évêque', site: 'Ville médiévale et port', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.135 },
  { id: 32, commune: 'Rocamadour', site: 'Cité sacrée et sanctuaire', niveau: 1, categorie: 'incontournable', lat: 44.799, lng: 1.618 },
  { id: 33, commune: 'Séniergues', site: 'Village et causse', niveau: 2, categorie: 'remarquable', lat: 44.693, lng: 1.655 },
  { id: 34, commune: 'Souillac', site: 'Abbaye Sainte-Marie', niveau: 1, categorie: 'incontournable', lat: 44.898, lng: 1.472 },
  { id: 35, commune: 'Saint-Cirq-Lapopie', site: 'Village médiéval emblématique', niveau: 1, categorie: 'incontournable', lat: 44.467, lng: 1.671 },
  { id: 36, commune: 'Saint-Martin-le-Redon', site: 'Village et vallée', niveau: 2, categorie: 'remarquable', lat: 44.613, lng: 1.044 },
  { id: 37, commune: 'Les Pechs du Vers', site: 'Causse et paysages', niveau: 2, categorie: 'remarquable', lat: 44.576, lng: 1.552 },
  { id: 38, commune: 'Saint-Vincent-Rive-d’Olt', site: 'Village et berges du Lot', niveau: 1, categorie: 'incontournable', lat: 44.464, lng: 1.286 },
  { id: 39, commune: 'Thégra', site: 'Village et patrimoine', niveau: 1, categorie: 'incontournable', lat: 44.735, lng: 1.625 },
];

export async function GET() {
  return NextResponse.json(lotSites);
}
