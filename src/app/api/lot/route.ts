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
  { id: 1, commune: 'Albas', site: 'Village perché et vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.463, lng: 1.201 },
  { id: 2, commune: 'Autoire', site: 'Cirque naturel, cascade et falaises spectaculaires', niveau: 1, categorie: 'incontournable', lat: 44.855, lng: 1.763 },
  { id: 3, commune: 'Bélaye', site: 'Village et panorama remarquable sur la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.505, lng: 1.204 },
  { id: 4, commune: 'Cahors', site: 'Centre historique, Pont Valentré (pont médiéval à trois tours) et cathédrale Saint-Étienne', niveau: 1, categorie: 'incontournable', lat: 44.449, lng: 1.436 },
  { id: 5, commune: 'Calvignac', site: 'Village perché dominant la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.483, lng: 1.781 },
  { id: 6, commune: 'Capdenac-le-Haut', site: 'Village médiéval fortifié et panorama sur la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.575, lng: 1.989 },
  { id: 7, commune: 'Cardaillac', site: 'Village médiéval, tours seigneuriales et patrimoine défensif', niveau: 1, categorie: 'incontournable', lat: 44.665, lng: 1.931 },
  { id: 8, commune: 'Carennac', site: 'Prieuré clunisien, cloître roman et village classé', niveau: 1, categorie: 'incontournable', lat: 44.839, lng: 1.703 },
  { id: 9, commune: 'Carlucet', site: 'Village rural et patrimoine bâti du causse', niveau: 1, categorie: 'incontournable', lat: 44.689, lng: 1.527 },
  { id: 10, commune: 'Castelnau-Montratier', site: 'Bastide du Quercy et place centrale à arcades', niveau: 1, categorie: 'incontournable', lat: 44.273, lng: 1.353 },
  { id: 11, commune: 'Creysse', site: 'Village et bords de la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.828, lng: 1.673 },
  { id: 12, commune: 'Espagnac', site: 'Village et vallée du Célé, eaux vives et patrimoine naturel', niveau: 1, categorie: 'incontournable', lat: 44.722, lng: 1.793 },
  { id: 13, commune: 'Espédaillac', site: 'Village typique du causse et paysages ouverts', niveau: 1, categorie: 'incontournable', lat: 44.671, lng: 1.681 },
  { id: 14, commune: 'Figeac', site: 'Centre historique remarquable et musée Champollion', niveau: 1, categorie: 'incontournable', lat: 44.608, lng: 2.031 },
  { id: 15, commune: 'Flaugnac', site: 'Village et panorama sur le Quercy Blanc', niveau: 2, categorie: 'remarquable', lat: 44.356, lng: 1.337 },
  { id: 16, commune: 'Gigouzac', site: 'Village médiéval et église romane', niveau: 1, categorie: 'incontournable', lat: 44.567, lng: 1.445 },
  { id: 17, commune: 'Gluges', site: 'Falaises et vallée de la Dordogne, à proximité des grottes de Lacave', niveau: 1, categorie: 'incontournable', lat: 44.882, lng: 1.642 },
  { id: 18, commune: 'Goujounac', site: 'Village du Quercy et patrimoine rural', niveau: 2, categorie: 'remarquable', lat: 44.643, lng: 1.163 },
  { id: 19, commune: 'Gourdon', site: 'Ville médiévale perchée et remparts', niveau: 1, categorie: 'incontournable', lat: 44.739, lng: 1.386 },
  { id: 20, commune: 'Lacapelle-Marival', site: 'Château médiéval et bourg historique', niveau: 1, categorie: 'incontournable', lat: 44.726, lng: 1.923 },
  { id: 21, commune: 'Larroque-Toirac', site: 'Village et vallée du Lot, patrimoine troglodytique', niveau: 1, categorie: 'incontournable', lat: 44.498, lng: 1.828 },
  { id: 22, commune: 'Lavercantière', site: 'Village rural du Quercy', niveau: 1, categorie: 'incontournable', lat: 44.688, lng: 1.284 },
  { id: 23, commune: 'Les Arques', site: 'Musée Zadkine et village d’artistes', niveau: 1, categorie: 'incontournable', lat: 44.636, lng: 1.164 },
  { id: 24, commune: 'Lherm', site: 'Village et patrimoine rural du causse', niveau: 1, categorie: 'incontournable', lat: 44.558, lng: 1.364 },
  { id: 25, commune: 'Loubressac', site: 'Village classé, panorama exceptionnel sur la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.784 },
  { id: 26, commune: 'Marcilhac-sur-Célé', site: 'Abbaye Saint-Pierre, vallée du Célé et patrimoine bâti rural en pierre sèche', niveau: 1, categorie: 'incontournable', lat: 44.642, lng: 1.807 },
  { id: 27, commune: 'Martel', site: 'Ville aux sept tours, patrimoine médiéval et proximité des grottes de Presque', niveau: 1, categorie: 'incontournable', lat: 44.936, lng: 1.608 },
  { id: 28, commune: 'Montcuq', site: 'Village perché du Quercy Blanc et tour médiévale', niveau: 1, categorie: 'incontournable', lat: 44.339, lng: 1.209 },
  { id: 29, commune: 'Montvalent', site: 'Falaises calcaires, belvédères et paysages du causse de Rocamadour', niveau: 1, categorie: 'incontournable', lat: 44.872, lng: 1.680 },
  { id: 30, commune: 'Prudhomat', site: 'Château de Castelnau-Bretenoux, forteresse médiévale majeure', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.836 },
  { id: 31, commune: 'Puy-l’Évêque', site: 'Ville médiévale, port ancien et vignoble de Cahors', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.135 },
  { id: 32, commune: 'Rocamadour', site: 'Cité sacrée, sanctuaire marial, basilique Saint-Sauveur et grotte des Merveilles', niveau: 1, categorie: 'incontournable', lat: 44.799, lng: 1.618 },
  { id: 33, commune: 'Séniergues', site: 'Village du causse et paysages karstiques', niveau: 2, categorie: 'remarquable', lat: 44.693, lng: 1.655 },
  { id: 34, commune: 'Souillac', site: 'Abbaye Sainte-Marie, chef-d’œuvre de l’art roman, et centre ancien', niveau: 1, categorie: 'incontournable', lat: 44.898, lng: 1.472 },
  { id: 35, commune: 'Saint-Cirq-Lapopie', site: 'Village médiéval emblématique dominant le Lot, proche de la grotte du Pech Merle', niveau: 1, categorie: 'incontournable', lat: 44.467, lng: 1.671 },
  { id: 36, commune: 'Saint-Martin-le-Redon', site: 'Village et vallée préservée du Lot', niveau: 2, categorie: 'remarquable', lat: 44.613, lng: 1.044 },
  { id: 37, commune: 'Les Pechs du Vers', site: 'Causse du Quercy, paysages ouverts et patrimoine karstique', niveau: 2, categorie: 'remarquable', lat: 44.576, lng: 1.552 },
  { id: 38, commune: 'Saint-Vincent-Rive-d’Olt', site: 'Village et berges du Lot', niveau: 1, categorie: 'incontournable', lat: 44.464, lng: 1.286 },
  { id: 39, commune: 'Thégra', site: 'Village et patrimoine bâti traditionnel', niveau: 1, categorie: 'incontournable', lat: 44.735, lng: 1.625 },
    { id: 40, commune: 'Saint-Céré', site: 'Ville historique et château de Montal à proximité', niveau: 1, categorie: 'incontournable', lat: 44.858, lng: 1.924 },
  { id: 41, commune: 'Gramat', site: 'Parc animalier et causse', niveau: 1, categorie: 'incontournable', lat: 44.780, lng: 1.607 },
  { id: 42, commune: 'Prayssac', site: 'Bastide et vignoble de Cahors', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.187 },
  { id: 43, commune: 'Biars-sur-Cère', site: 'Bords de Cère et patrimoine industriel', niveau: 2, categorie: 'remarquable', lat: 44.926, lng: 1.848 },
  { id: 44, commune: 'Luzech', site: 'Méandre du Lot et tour médiévale', niveau: 1, categorie: 'incontournable', lat: 44.480, lng: 1.287 },
  { id: 45, commune: 'Bagnac-sur-Célé', site: 'Village et vallée du Célé', niveau: 1, categorie: 'incontournable', lat: 44.666, lng: 2.164 },
  { id: 46, commune: 'Lalbenque', site: 'Capitale de la truffe du Quercy', niveau: 2, categorie: 'remarquable', lat: 44.339, lng: 1.546 },
  { id: 47, commune: 'Cahors', site: 'Cathédrale Saint-Étienne', niveau: 1, categorie: 'incontournable', lat: 44.449, lng: 1.441 },
  { id: 48, commune: 'Rocamadour', site: 'Basilique Saint-Sauveur', niveau: 1, categorie: 'incontournable', lat: 44.799, lng: 1.619 },
  { id: 49, commune: 'Padirac', site: 'Gouffre de Padirac', niveau: 1, categorie: 'incontournable', lat: 44.858, lng: 1.759 },
  { id: 50, commune: 'Cabrerets', site: 'Grotte du Pech Merle (art préhistorique)', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.651 },
  { id: 51, commune: 'Miers', site: 'Archéosite des Fieux', niveau: 1, categorie: 'incontournable', lat: 44.848, lng: 1.748 },
  { id: 52, commune: 'Payrignac', site: 'Grottes de Cougnac', niveau: 1, categorie: 'incontournable', lat: 44.743, lng: 1.386 },
  { id: 53, commune: 'Rocamadour', site: 'Grotte des Merveilles', niveau: 1, categorie: 'incontournable', lat: 44.801, lng: 1.617 },
  { id: 54, commune: 'Gréalou', site: 'Dolmen de Pech Laglaire (GR 65)', niveau: 2, categorie: 'remarquable', lat: 44.610, lng: 1.848 },
  { id: 55, commune: 'Bach', site: 'Phosphatières du Cloup d’Aural', niveau: 1, categorie: 'incontournable', lat: 44.516, lng: 1.545 },
  { id: 56, commune: 'Lacave', site: 'Grottes de Lacave', niveau: 1, categorie: 'incontournable', lat: 44.875, lng: 1.584 },
  { id: 57, commune: 'Saint-Sozy', site: 'Grottes de Presque', niveau: 1, categorie: 'incontournable', lat: 44.900, lng: 1.780 },
];

export async function GET() {
  return NextResponse.json(lotSites);
}
