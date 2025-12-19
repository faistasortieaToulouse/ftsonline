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
  { id: 2, commune: 'Autoire', site: 'Cirque naturel, cascade, falaises et Château des Anglais (fort de falaise)', niveau: 1, categorie: 'incontournable', lat: 44.855, lng: 1.763 },
  { id: 3, commune: 'Bélaye', site: 'Village et panorama remarquable sur la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.505, lng: 1.204 },
  { id: 4, commune: 'Cahors', site: 'Pont Valentré, centre historique et Cathédrale Saint-Étienne (art roman)', niveau: 1, categorie: 'incontournable', lat: 44.449, lng: 1.436 },
  { id: 5, commune: 'Calvignac', site: 'Village perché dominant la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.483, lng: 1.781 },
  { id: 6, commune: 'Capdenac-le-Haut', site: 'Village médiéval fortifié et panorama sur la vallée du Lot', niveau: 1, categorie: 'incontournable', lat: 44.575, lng: 1.989 },
  { id: 7, commune: 'Cardaillac', site: 'Vestiges du Fort Médiéval, bourg castral avec tours de Sagnes et de l’Horloge', niveau: 1, categorie: 'incontournable', lat: 44.665, lng: 1.931 },
  { id: 8, commune: 'Carennac', site: 'Prieuré clunisien, cloître roman et village classé', niveau: 1, categorie: 'incontournable', lat: 44.839, lng: 1.703 },
  { id: 9, commune: 'Carlucet', site: 'Village rural et patrimoine bâti du causse', niveau: 1, categorie: 'incontournable', lat: 44.689, lng: 1.527 },
  { id: 10, commune: 'Castelnau-Montratier', site: 'Bastide du Quercy et place centrale à arcades', niveau: 1, categorie: 'incontournable', lat: 44.273, lng: 1.353 },
  { id: 11, commune: 'Creysse', site: 'Village et bords de la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.828, lng: 1.673 },
  { id: 12, commune: 'Espagnac', site: 'Village et vallée du Célé, eaux vives et patrimoine naturel', niveau: 1, categorie: 'incontournable', lat: 44.722, lng: 1.793 },
  { id: 13, commune: 'Espédaillac', site: 'Village typique du causse et paysages ouverts', niveau: 1, categorie: 'incontournable', lat: 44.671, lng: 1.681 },
  { id: 14, commune: 'Figeac', site: 'Centre historique et Musée Champollion (Les Écritures)', niveau: 1, categorie: 'incontournable', lat: 44.608, lng: 2.031 },
  { id: 15, commune: 'Flaugnac', site: 'Village et panorama sur le Quercy Blanc', niveau: 2, categorie: 'remarquable', lat: 44.356, lng: 1.337 },
  { id: 16, commune: 'Gigouzac', site: 'Village médiéval et église romane', niveau: 1, categorie: 'incontournable', lat: 44.567, lng: 1.445 },
  { id: 17, commune: 'Gluges', site: 'Falaises et vallée de la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.882, lng: 1.642 },
  { id: 18, commune: 'Goujounac', site: 'Village du Quercy et patrimoine rural', niveau: 2, categorie: 'remarquable', lat: 44.643, lng: 1.163 },
  { id: 19, commune: 'Gourdon', site: 'Ville médiévale perchée et remparts', niveau: 1, categorie: 'incontournable', lat: 44.739, lng: 1.386 },
  { id: 20, commune: 'Lacapelle-Marival', site: 'Château médiéval MH (résidence des Cardaillac) et bourg historique', niveau: 1, categorie: 'incontournable', lat: 44.726, lng: 1.923 },
  { id: 21, commune: 'Larroque-Toirac', site: 'Château accroché à la falaise avec grottes et patrimoine troglodytique', niveau: 1, categorie: 'incontournable', lat: 44.498, lng: 1.828 },
  { id: 22, commune: 'Lavercantière', site: 'Village rural du Quercy', niveau: 1, categorie: 'incontournable', lat: 44.688, lng: 1.284 },
  { id: 23, commune: 'Les Arques', site: 'Musée Zadkine et village d’artistes', niveau: 1, categorie: 'incontournable', lat: 44.636, lng: 1.164 },
  { id: 24, commune: 'Lherm', site: 'Village et patrimoine rural du causse', niveau: 1, categorie: 'incontournable', lat: 44.558, lng: 1.364 },
  { id: 25, commune: 'Loubressac', site: 'Village classé, panorama exceptionnel sur la Dordogne', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.784 },
  { id: 26, commune: 'Marcilhac-sur-Célé', site: 'Abbaye Saint-Pierre et patrimoine en pierre sèche', niveau: 1, categorie: 'incontournable', lat: 44.642, lng: 1.807 },
  { id: 27, commune: 'Martel', site: 'Ville aux sept tours et patrimoine médiéval', niveau: 1, categorie: 'incontournable', lat: 44.936, lng: 1.608 },
  { id: 28, commune: 'Montcuq', site: 'Village perché du Quercy Blanc et tour médiévale', niveau: 1, categorie: 'incontournable', lat: 44.339, lng: 1.209 },
  { id: 29, commune: 'Montvalent', site: 'Falaises calcaires et belvédères du causse', niveau: 1, categorie: 'incontournable', lat: 44.872, lng: 1.680 },
  { id: 30, commune: 'Prudhomat', site: 'Château de Castelnau-Bretenoux, forteresse majeure sur éperon rocheux', niveau: 1, categorie: 'incontournable', lat: 44.873, lng: 1.836 },
  { id: 31, commune: 'Puy-l’Évêque', site: 'Ville médiévale, port ancien et vignoble', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.135 },
  { id: 32, commune: 'Rocamadour', site: 'Cité sacrée, Basilique Saint-Sauveur, Grotte des Merveilles et Remparts du XIVe', niveau: 1, categorie: 'incontournable', lat: 44.799, lng: 1.618 },
  { id: 33, commune: 'Séniergues', site: 'Village du causse et paysages karstiques', niveau: 2, categorie: 'remarquable', lat: 44.693, lng: 1.655 },
  { id: 34, commune: 'Souillac', site: 'Abbaye Sainte-Marie (art roman) et centre ancien', niveau: 1, categorie: 'incontournable', lat: 44.898, lng: 1.472 },
  { id: 35, commune: 'Saint-Cirq-Lapopie', site: 'Village emblématique et ruines du Château des Cardaillac', niveau: 1, categorie: 'incontournable', lat: 44.467, lng: 1.671 },
  { id: 36, commune: 'Saint-Martin-le-Redon', site: 'Village et vallée préservée', niveau: 2, categorie: 'remarquable', lat: 44.613, lng: 1.044 },
  { id: 37, commune: 'Les Pechs du Vers', site: 'Causse du Quercy et patrimoine karstique', niveau: 2, categorie: 'remarquable', lat: 44.576, lng: 1.552 },
  { id: 38, commune: 'Saint-Vincent-Rive-d’Olt', site: 'Village et berges du Lot', niveau: 1, categorie: 'incontournable', lat: 44.464, lng: 1.286 },
  { id: 39, commune: 'Thégra', site: 'Village et patrimoine bâti traditionnel', niveau: 1, categorie: 'incontournable', lat: 44.735, lng: 1.625 },
  { id: 40, commune: 'Saint-Céré', site: 'Ville historique proche du Château de Montal', niveau: 1, categorie: 'incontournable', lat: 44.858, lng: 1.924 },
  { id: 41, commune: 'Gramat', site: 'Parc animalier et canyon de l’Alzou', niveau: 1, categorie: 'incontournable', lat: 44.780, lng: 1.607 },
  { id: 42, commune: 'Prayssac', site: 'Bastide et vignoble de Cahors', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.187 },
  { id: 43, commune: 'Biars-sur-Cère', site: 'Bords de Cère et patrimoine industriel', niveau: 2, categorie: 'remarquable', lat: 44.926, lng: 1.848 },
  { id: 44, commune: 'Luzech', site: 'Méandre du Lot et tour médiévale', niveau: 1, categorie: 'incontournable', lat: 44.480, lng: 1.287 },
  { id: 45, commune: 'Bagnac-sur-Célé', site: 'Village et vallée du Célé', niveau: 1, categorie: 'incontournable', lat: 44.666, lng: 2.164 },
  { id: 46, commune: 'Lalbenque', site: 'Capitale de la truffe du Quercy', niveau: 2, categorie: 'remarquable', lat: 44.339, lng: 1.546 },
  { id: 47, commune: 'Padirac', site: 'Gouffre de Padirac (103m sous terre, effet Waouh)', niveau: 1, categorie: 'incontournable', lat: 44.858, lng: 1.759 },
  { id: 48, commune: 'Cabrerets', site: 'Grotte du Pech Merle, Château du XVe et Château du Diable (troglodyte)', niveau: 1, categorie: 'incontournable', lat: 44.504, lng: 1.651 },
  { id: 49, commune: 'Miers', site: 'Archéosite des Fieux', niveau: 1, categorie: 'incontournable', lat: 44.848, lng: 1.748 },
  { id: 50, commune: 'Payrignac', site: 'Grottes de Cougnac', niveau: 1, categorie: 'incontournable', lat: 44.743, lng: 1.386 },
  { id: 51, commune: 'Gréalou', site: 'Dolmen de Pech Laglaire (GR 65)', niveau: 2, categorie: 'remarquable', lat: 44.610, lng: 1.848 },
  { id: 52, commune: 'Bach', site: 'Phosphatières du Cloup d’Aural (Canyon et fossiles)', niveau: 1, categorie: 'incontournable', lat: 44.516, lng: 1.545 },
  { id: 53, commune: 'Lacave', site: 'Grottes de Lacave et Grotte des Carbonnières (le trésor caché du Causse)', niveau: 1, categorie: 'incontournable', lat: 44.875, lng: 1.584 },
  { id: 54, commune: 'Saint-Sozy', site: 'Grottes de Presque', niveau: 1, categorie: 'incontournable', lat: 44.900, lng: 1.780 },
  { id: 55, commune: 'Crégols', site: 'Igue de Crégols (curiosité géologique karstique)', niveau: 1, categorie: 'incontournable', lat: 44.456, lng: 1.696 },
  { id: 56, commune: 'Latouille-Lentillac', site: 'Ruisseaux du Cayla et du Tolerme', niveau: 3, categorie: 'suggéré', lat: 44.860, lng: 1.964 },
  { id: 57, commune: 'Lamativie', site: 'Ruisseaux du Cayla et d’Escalmels', niveau: 3, categorie: 'suggéré', lat: 44.928, lng: 2.040 },
  { id: 58, commune: 'Sabadel-Latronquière', site: 'Cascade du ruisseau du Bervezou', niveau: 3, categorie: 'suggéré', lat: 44.736, lng: 2.060 },
  { id: 59, commune: 'Cénevières', site: 'Château de Cénevières, joyau Renaissance sur falaise', niveau: 1, categorie: 'incontournable', lat: 44.463, lng: 1.751 },
  { id: 60, commune: 'Saint-Jean-Lespinasse', site: 'Château de Montal (chef-d’œuvre Renaissance)', niveau: 1, categorie: 'incontournable', lat: 44.861, lng: 1.919 },
  { id: 61, commune: 'Cœur de Causse', site: 'Château de Vaillac (XV-XVIIe siècle)', niveau: 1, categorie: 'incontournable', lat: 44.675, lng: 1.530 },
  { id: 62, commune: 'Saint-Front-sur-Lémance', site: 'Château de Bonaguil (architecture militaire exemplaire)', niveau: 1, categorie: 'incontournable', lat: 44.538, lng: 0.992 },
  { id: 63, commune: 'Saignes', site: 'Château de Saignes (édifice majeur du Quercy)', niveau: 1, categorie: 'incontournable', lat: 44.786, lng: 1.815 },
  { id: 64, commune: 'Couzou', site: 'Château de la Pannonie (Privé, classique XV-XVIIIe)', niveau: 1, categorie: 'incontournable', lat: 44.767, lng: 1.587 },
  { id: 65, commune: 'Bessonies', site: 'Château de Bessonies (Souvenir du Maréchal Ney)', niveau: 1, categorie: 'incontournable', lat: 44.811, lng: 2.148 },
  { id: 66, commune: 'Larnagol', site: 'Château de Larnagol et ses jardins', niveau: 1, categorie: 'incontournable', lat: 44.475, lng: 1.777 },
  { id: 67, commune: 'Assier', site: 'Château d’Assier (Témoignage art Renaissance)', niveau: 1, categorie: 'incontournable', lat: 44.675, lng: 1.878 },
  { id: 68, commune: 'Dégagnac', site: 'Château de Lantis (XV-XVIIIe)', niveau: 1, categorie: 'incontournable', lat: 44.665, lng: 1.314 },
  { id: 69, commune: 'Saint Géry-Vers', site: 'Château des Anglais de Vers (fort de falaise)', niveau: 1, categorie: 'incontournable', lat: 44.484, lng: 1.587 },
  { id: 70, commune: 'Bouziès', site: 'Château des Anglais (XI-XIIe) sur la falaise', niveau: 1, categorie: 'incontournable', lat: 44.484, lng: 1.642 },
  { id: 71, commune: 'Aujols', site: 'Igues d’Aujols (Ramade)', niveau: 1, categorie: 'incontournable', lat: 44.382, lng: 1.554 },
];

export async function GET() {
  return NextResponse.json(lotSites);
}
