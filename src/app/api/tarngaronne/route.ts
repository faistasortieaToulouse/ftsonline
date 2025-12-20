import { NextResponse } from 'next/server';

interface SiteTG {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const tgSites: SiteTG[] = [
  { id: 1, commune: 'Montauban', site: 'Cathédrale Notre-Dame-de-l’Assomption, centre historique, musées Ingres-Bourdelle', niveau: 1, categorie: 'incontournable', lat: 44.0174, lng: 1.3544 },
  { id: 2, commune: 'Castelsarrasin', site: 'Canal des Deux-Mers, passerelle Eiffel, patrimoine fluvial', niveau: 1, categorie: 'incontournable', lat: 44.0672, lng: 1.0990 },
  { id: 3, commune: 'Moissac', site: 'Abbaye Saint-Pierre, cloître roman classé UNESCO, Carmel, bords du Tarn', niveau: 1, categorie: 'incontournable', lat: 44.0207, lng: 1.3522 },
  { id: 4, commune: 'Caussade', site: 'Centre ancien, chapellerie traditionnelle, fontaine du Thouron', niveau: 2, categorie: 'remarquable', lat: 44.0580, lng: 1.4000 },
  { id: 5, commune: 'Nègrepelisse', site: 'Château, parc et patrimoine local', niveau: 2, categorie: 'remarquable', lat: 44.0720, lng: 1.5220 },
  { id: 6, commune: 'Montech', site: 'Pente d’eau, canal de Garonne, patrimoine industriel', niveau: 2, categorie: 'remarquable', lat: 43.9570, lng: 1.2350 },
  { id: 7, commune: 'Valence d’Agen', site: 'Bords de Garonne, bastide et patrimoine fluvial', niveau: 2, categorie: 'remarquable', lat: 44.1100, lng: 0.8900 },
  { id: 8, commune: 'Grisolles', site: 'Ancienne bastide et patrimoine ferroviaire', niveau: 2, categorie: 'remarquable', lat: 43.8270, lng: 1.2980 },
  { id: 9, commune: 'Verdun-sur-Garonne', site: 'Village fluvial et paysages de la Garonne', niveau: 2, categorie: 'remarquable', lat: 43.8570, lng: 1.2350 },
  { id: 10, commune: 'Saint-Nicolas-de-la-Grave', site: 'Base de loisirs, ornithologie et château', niveau: 2, categorie: 'remarquable', lat: 44.0630, lng: 1.0230 },
  { id: 11, commune: 'Lauzerte', site: 'Bastide médiévale classée, dolmens, panorama du Quercy Blanc', niveau: 1, categorie: 'incontournable', lat: 44.1305, lng: 1.3638 },
  { id: 12, commune: 'Réalville', site: 'Abbaye Saint-Marcel, patrimoine religieux et village ancien', niveau: 2, categorie: 'remarquable', lat: 44.1080, lng: 1.4830 },
  { id: 13, commune: 'Lafrançaise', site: 'Point de vue, collégiale Saint-Martin, pont-cascade de Pontalaman', niveau: 2, categorie: 'remarquable', lat: 44.1330, lng: 1.2450 },
  { id: 14, commune: 'Auvillar', site: 'Halle circulaire, village classé, chemin de Saint-Jacques', niveau: 1, categorie: 'incontournable', lat: 44.0781, lng: 1.3041 },
  { id: 15, commune: 'Dunes', site: 'Bastide et église fortifiée', niveau: 1, categorie: 'incontournable', lat: 44.0182, lng: 1.3975 },
  { id: 16, commune: 'Donzac', site: 'Village ancien et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.1000, lng: 1.0200 },
  { id: 17, commune: 'Gramont', site: 'Château médiéval et village perché', niveau: 1, categorie: 'incontournable', lat: 43.9680, lng: 0.8350 },
  { id: 18, commune: 'Maubec', site: 'Village et panorama sur la vallée', niveau: 2, categorie: 'remarquable', lat: 44.0684, lng: 1.4352 },
  { id: 19, commune: 'Montaigu-de-Quercy', site: 'Village perché et panorama du Quercy Blanc', niveau: 1, categorie: 'incontournable', lat: 44.1274, lng: 1.3876 },
  { id: 20, commune: 'Roquecor', site: 'Village médiéval, Roc des Nobis', niveau: 2, categorie: 'remarquable', lat: 44.1020, lng: 1.1150 },
  { id: 21, commune: 'Lacour', site: 'Village et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.0850, lng: 1.1850 },
  { id: 22, commune: 'Bourg-de-Visa', site: 'Ancienne bastide, lavoir du Théron', niveau: 2, categorie: 'remarquable', lat: 44.1600, lng: 1.2800 },
  { id: 23, commune: 'Montjoi', site: 'Village fortifié du Quercy', niveau: 1, categorie: 'incontournable', lat: 44.1360, lng: 1.7475 },
  { id: 24, commune: 'Castelsagrat', site: 'Village et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.1850, lng: 1.0500 },
  { id: 25, commune: 'Montpezat-de-Quercy', site: 'Collégiale Saint-Martin, dolmens et patrimoine gothique', niveau: 1, categorie: 'incontournable', lat: 44.1345, lng: 1.4278 },
  { id: 26, commune: 'Cayriech', site: 'Roc des Nobis et patrimoine naturel', niveau: 2, categorie: 'remarquable', lat: 44.1200, lng: 1.7050 },
  { id: 27, commune: 'Lacapelle-Livron', site: 'Dolmens, patrimoine rural et Notre-Dame des Grâces', niveau: 2, categorie: 'remarquable', lat: 44.0470, lng: 1.2186 },
  { id: 28, commune: 'Parisot', site: 'Bastide médiévale et panorama', niveau: 2, categorie: 'remarquable', lat: 44.1620, lng: 1.8340 },
  { id: 29, commune: 'Caylus', site: 'Village médiéval, dolmens, gorges de l’Aveyron', niveau: 1, categorie: 'incontournable', lat: 44.0505, lng: 1.8177 },
  { id: 30, commune: 'Saint-Antonin-Noble-Val', site: 'Village médiéval, dolmens, gorges et randonnées', niveau: 1, categorie: 'incontournable', lat: 44.0931, lng: 1.6992 },
  { id: 31, commune: 'Varen', site: 'Village de caractère et vallée de l’Aveyron', niveau: 2, categorie: 'remarquable', lat: 44.0870, lng: 1.7400 },
  { id: 32, commune: 'Laguépie', site: 'Confluence Viaur-Aveyron et village ancien', niveau: 1, categorie: 'incontournable', lat: 44.0623, lng: 1.7287 },
  { id: 33, commune: 'Bioule', site: 'Village, château et patrimoine rural', niveau: 2, categorie: 'remarquable', lat: 44.0635, lng: 1.5372 },
  { id: 34, commune: 'Montricoux', site: 'Village médiéval, dolmens et Maison du Peintre', niveau: 2, categorie: 'remarquable', lat: 44.0653, lng: 1.7452 },
  { id: 35, commune: 'Bruniquel', site: 'Châteaux perchés et panorama sur l’Aveyron', niveau: 1, categorie: 'incontournable', lat: 44.0637, lng: 1.7167 },
  { id: 36, commune: 'Cordes-Tolosannes', site: 'Abbaye de Belleperche et patrimoine fluvial', niveau: 1, categorie: 'incontournable', lat: 44.0000, lng: 1.1500 },
  { id: 37, commune: 'Ginals', site: 'Abbaye de Beaulieu-en-Rouergue (Belloc)', niveau: 1, categorie: 'incontournable', lat: 44.2750, lng: 1.8050 },
  { id: 38, commune: 'Mirabel', site: 'Abbaye de la Garde-Dieu et village rural', niveau: 2, categorie: 'remarquable', lat: 44.1350, lng: 1.5850 },
  { id: 39, commune: 'Mas-Grenier', site: 'Abbaye du Mas-Grenier et bords de Garonne', niveau: 2, categorie: 'remarquable', lat: 43.8850, lng: 1.1980 },
  { id: 40, commune: 'Piquecos', site: 'Point de vue naturel sur la Garonne', niveau: 2, categorie: 'remarquable', lat: 44.033, lng: 1.185 },
  { id: 41, commune: 'Bourret', site: 'Point de vue de Bourret sur la Garonne', niveau: 3, categorie: 'suggéré', lat: 43.966, lng: 1.253 },
  { id: 42, commune: 'Beaumont-de-Lomagne', site: 'Statues de Fermat et bastide historique', niveau: 1, categorie: 'incontournable', lat: 43.882, lng: 0.989 },
  { id: 43, commune: 'Boudou', site: 'Belvédère dominant la vallée de la Garonne', niveau: 3, categorie: 'suggéré', lat: 44.028, lng: 1.287 },
  { id: 44, commune: 'Merles', site: 'Chêne remarquable et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.019, lng: 1.172 },
  { id: 45, commune: 'Varennes', site: 'Point de vue et paysages agricoles', niveau: 3, categorie: 'suggéré', lat: 44.062, lng: 1.420 },
  { id: 46, commune: 'Saint-Projet', site: 'Moulin de Saillagol et patrimoine rural', niveau: 1, categorie: 'incontournable', lat: 44.091, lng: 1.780 },
  { id: 47, commune: 'Septfonds', site: 'Dolmens et patrimoine mégalithique', niveau: 1, categorie: 'incontournable', lat: 44.163, lng: 1.620 },
  { id: 48, commune: 'Saint-Cirq', site: 'Dolmen de Bousquettis', niveau: 3, categorie: 'suggéré', lat: 44.114, lng: 1.678 },
  { id: 49, commune: 'Cazals', site: 'Dolmen du Frau', niveau: 3, categorie: 'suggéré', lat: 44.121, lng: 1.610 },
  { id: 50, commune: 'Espinas', site: 'Dolmen de la Palenquière', niveau: 1, categorie: 'incontournable', lat: 44.115, lng: 1.703 },
  { id: 51, commune: 'Féneyrols', site: 'Dolmen de la Serre', niveau: 1, categorie: 'incontournable', lat: 44.123, lng: 1.742 },
  { id: 52, commune: 'Cazes-Mondenard', site: 'Pont de Lissart et patrimoine rural', niveau: 1, categorie: 'incontournable', lat: 44.155, lng: 1.296 },
  { id: 53, commune: 'Verfeil-sur-Seye', site: 'Village et vallée de la Seye', niveau: 2, categorie: 'remarquable', lat: 44.099, lng: 1.671 },
];

export async function GET() {
  return NextResponse.json(tgSites);
}
