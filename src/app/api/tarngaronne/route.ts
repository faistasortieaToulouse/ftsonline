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
  { id: 1, commune: 'Montauban', site: 'Cathédrale Notre-Dame-de-l’Assomption, centre historique, musées Ingres-Bourdelle, Cours Foucault, Lac Balat David, Le Jardin des Plantes, Le Jardin de Simples, Lac de la Clare, Lac d’Austrie, Port Canal', niveau: 1, categorie: 'incontournable', lat: 44.0174, lng: 1.3544 },
  { id: 2, commune: 'Castelsarrasin', site: 'Canal des Deux-Mers, passerelle Eiffel, patrimoine fluvial, Parc de Clairefont', niveau: 1, categorie: 'incontournable', lat: 44.0672, lng: 1.0990 },
  { id: 3, commune: 'Moissac', site: 'Abbaye Saint-Pierre, cloître roman classé UNESCO, Carmel, bords du Tarn, l’île de Beaucaire, Point de vue du Calvaire', niveau: 1, categorie: 'incontournable', lat: 44.0207, lng: 1.3522 },
  { id: 4, commune: 'Caussade', site: 'Centre ancien, chapellerie traditionnelle, fontaine du Thouron', niveau: 2, categorie: 'remarquable', lat: 44.0580, lng: 1.4000 },
  { id: 5, commune: 'Nègrepelisse', site: 'Château, parc et patrimoine local, île de Nègrepelisse, Forêt d’Agre ou forêt de Montech', niveau: 2, categorie: 'remarquable', lat: 44.0720, lng: 1.5220 },
  { id: 6, commune: 'Montech', site: 'Pente d’eau, canal de Garonne, patrimoine industriel, Forêt d’Agre ou forêt de Montech', niveau: 2, categorie: 'remarquable', lat: 43.9570, lng: 1.2350 },
  { id: 7, commune: 'Valence d’Agen', site: 'Bords de Garonne, bastide et patrimoine fluvial, Jardin de Pontus', niveau: 2, categorie: 'remarquable', lat: 44.1100, lng: 0.8900 },
  { id: 8, commune: 'Grisolles', site: 'Ancienne bastide et patrimoine ferroviaire', niveau: 2, categorie: 'remarquable', lat: 43.8270, lng: 1.2980 },
  { id: 9, commune: 'Verdun-sur-Garonne', site: 'Village fluvial et paysages de la Garonne', niveau: 2, categorie: 'remarquable', lat: 43.8570, lng: 1.2350 },
  { id: 10, commune: 'Saint-Nicolas-de-la-Grave', site: 'Base de loisirs, ornithologie et château, Le Jardin des Indiens, Réserve ornithologique du confluent du Tarn et de la Garonne', niveau: 2, categorie: 'remarquable', lat: 44.0630, lng: 1.0230 },
  { id: 11, commune: 'Lauzerte', site: 'Bastide sur ciel, barbacane, église Saint-Barthélemy, place des Cornières, Jardin du Pèlerin, Jardin des Sculptures, chemin de Saint-Jacques', niveau: 1, categorie: 'incontournable', lat: 44.1305, lng: 1.3638 },
  { id: 12, commune: 'Réalville', site: 'Abbaye Saint-Marcel, patrimoine religieux et village ancien', niveau: 2, categorie: 'remarquable', lat: 44.1080, lng: 1.4830 },
  { id: 13, commune: 'Lafrançaise', site: 'Collégiale Saint-Martin, château de la Baronnie, pont-cascade de Pontalaman, points de vue, Point de vue Lafrançaise', niveau: 2, categorie: 'remarquable', lat: 44.1330, lng: 1.2450 },
  { id: 14, commune: 'Auvillar', site: 'Halle circulaire, place triangulaire, église Saint-Pierre, port fluvial, étape Saint-Jacques', niveau: 1, categorie: 'incontournable', lat: 44.0781, lng: 1.3041 },
  { id: 15, commune: 'Dunes', site: 'Bastide médiévale, maisons à pans de bois, Tour des Templiers, remparts', niveau: 1, categorie: 'incontournable', lat: 44.0182, lng: 1.3975 },
  { id: 16, commune: 'Donzac', site: 'Village ancien et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.1000, lng: 1.0200 },
  { id: 17, commune: 'Gramont', site: 'Château médiéval et village perché', niveau: 1, categorie: 'incontournable', lat: 43.9680, lng: 0.8350 },
  { id: 18, commune: 'Maubec', site: 'Oppidum gaulois, remparts médiévaux, panorama', niveau: 2, categorie: 'remarquable', lat: 44.0684, lng: 1.4352 },
  { id: 19, commune: 'Montaigu-de-Quercy', site: 'Village perché, panorama du Quercy Blanc, églises', niveau: 1, categorie: 'incontournable', lat: 44.1274, lng: 1.3876 },
  { id: 20, commune: 'Roquecor', site: 'Village médiéval, Roc des Nobis', niveau: 2, categorie: 'remarquable', lat: 44.1020, lng: 1.1150 },
  { id: 21, commune: 'Lacour', site: 'Village et patrimoine rural', niveau: 3, categorie: 'suggéré', lat: 44.0850, lng: 1.1850 },
  { id: 22, commune: 'Bourg-de-Visa', site: 'Ancienne bastide et lavoir du Théron', niveau: 2, categorie: 'remarquable', lat: 44.1600, lng: 1.2800 },
  { id: 23, commune: 'Montjoi', site: 'Castelnau médiéval, tour féodale, maisons à pans de bois', niveau: 1, categorie: 'incontournable', lat: 44.1360, lng: 1.7475 },
  { id: 24, commune: 'Castelsagrat', site: 'Bastide médiévale, place à couverts, église et retable', niveau: 3, categorie: 'suggéré', lat: 44.1850, lng: 1.0500 },
  { id: 25, commune: 'Montpezat-de-Quercy', site: 'Collégiale gothique, maisons Renaissance, dolmens, Point de vue du Faillal, Point de vue des Remparts', niveau: 1, categorie: 'incontournable', lat: 44.1345, lng: 1.4278 },
  { id: 26, commune: 'Cayriech', site: 'Roc des Nobis et paysages naturels', niveau: 2, categorie: 'remarquable', lat: 44.1200, lng: 1.7050 },
  { id: 27, commune: 'Lacapelle-Livron', site: 'Dolmens, patrimoine rural, Notre-Dame des Grâces, Point de vue de la Chapelle Notre Dame Des Grâces', niveau: 2, categorie: 'remarquable', lat: 44.0470, lng: 1.2186 },
  { id: 28, commune: 'Parisot', site: 'Bastide médiévale et panorama', niveau: 2, categorie: 'remarquable', lat: 44.1620, lng: 1.8340 },
  { id: 29, commune: 'Caylus', site: 'Castelnau médiéval, maisons anciennes, dolmens, gorges de l’Aveyron, Vallée de la Bonnette, Point de vue de la croix Caylus, Espace naturel sensible du Lac de Labarthe', niveau: 1, categorie: 'incontournable', lat: 44.0505, lng: 1.8177 },
  { id: 30, commune: 'Saint-Antonin-Noble-Val', site: 'Cité médiévale, gorges de l’Aveyron, cirque de Bône, jardin-belvédère, source de la Gourgue, Jardin Cantous, Point de vue "Route de la Corniche"', niveau: 1, categorie: 'incontournable', lat: 44.0931, lng: 1.6992 },
  { id: 31, commune: 'Varen', site: 'Petite cité médiévale, château, église romane, berges de l’Aveyron', niveau: 2, categorie: 'remarquable', lat: 44.0870, lng: 1.7400 },
  { id: 32, commune: 'Laguépie', site: 'Confluence Viaur-Aveyron et village ancien', niveau: 1, categorie: 'incontournable', lat: 44.0623, lng: 1.7287 },
  { id: 33, commune: 'Bioule', site: 'Village, château et patrimoine rural', niveau: 2, categorie: 'remarquable', lat: 44.0635, lng: 1.5372 },
  { id: 34, commune: 'Montricoux', site: 'Donjon des Templiers, château-musée Marcel-Lenoir, dolmens', niveau: 2, categorie: 'remarquable', lat: 44.0653, lng: 1.7452 },
  { id: 35, commune: 'Bruniquel', site: 'Châteaux perchés classés et panorama sur l’Aveyron', niveau: 1, categorie: 'incontournable', lat: 44.0637, lng: 1.7167 },
  { id: 36, commune: 'Cordes-Tolosannes', site: 'Abbaye de Belleperche et patrimoine fluvial, Point de vue de Cordes-Tolosannes', niveau: 1, categorie: 'incontournable', lat: 44.0000, lng: 1.1500 },
  { id: 37, commune: 'Ginals', site: 'Abbaye de Beaulieu-en-Rouergue (Belloc)', niveau: 1, categorie: 'incontournable', lat: 44.2750, lng: 1.8050 },
  { id: 38, commune: 'Mirabel', site: 'Abbaye de la Garde-Dieu et village rural', niveau: 2, categorie: 'remarquable', lat: 44.1350, lng: 1.5850 },
  { id: 39, commune: 'Mas-Grenier', site: 'Abbaye du Mas-Grenier et bords de Garonne', niveau: 2, categorie: 'remarquable', lat: 43.8850, lng: 1.1980 },
  { id: 40, commune: 'Piquecos', site: 'Point de vue majeur sur la vallée de la Garonne, Point de vue Piquecos', niveau: 2, categorie: 'remarquable', lat: 44.033, lng: 1.185 },
  { id: 41, commune: 'Bourret', site: 'Point de vue de Bourret sur la Garonne', niveau: 3, categorie: 'suggéré', lat: 43.966, lng: 1.253 },
  { id: 42, commune: 'Beaumont-de-Lomagne', site: 'Bastide royale, halle XIVe, statues de Fermat, point de vue du Pépil, Point de vue depuis la tour Fermat, Point de vue de la Tapole', niveau: 1, categorie: 'incontournable', lat: 43.882, lng: 0.989 },
  { id: 43, commune: 'Boudou', site: 'Belvédère dominant la vallée de la Garonne, Point de vue de Boudou', niveau: 3, categorie: 'suggéré', lat: 44.028, lng: 1.287 },
  { id: 44, commune: 'Merles', site: 'Chêne remarquable et patrimoine rural, Le chêne Henri IV', niveau: 3, categorie: 'suggéré', lat: 44.019, lng: 1.172 },
  { id: 45, commune: 'Varennes', site: 'Point de vue de Varennes de Puylauron', niveau: 3, categorie: 'suggéré', lat: 44.062, lng: 1.420 },
  { id: 46, commune: 'Saint-Projet', site: 'Moulin de Saillagol et patrimoine rural', niveau: 1, categorie: 'incontournable', lat: 44.091, lng: 1.780 },
  { id: 47, commune: 'Septfonds', site: 'Dolmens et patrimoine mégalithique, Le Jardin du Colombier', niveau: 1, categorie: 'incontournable', lat: 44.163, lng: 1.620 },
  { id: 48, commune: 'Saint-Cirq', site: 'Dolmen de Bousquettis', niveau: 3, categorie: 'suggéré', lat: 44.114, lng: 1.678 },
  { id: 49, commune: 'Cazals', site: 'Dolmen du Frau, Sentier expo de Cazes Mondenard', niveau: 3, categorie: 'suggéré', lat: 44.121, lng: 1.610 },
  { id: 50, commune: 'Espinas', site: 'Dolmen de la Palenquière', niveau: 1, categorie: 'incontournable', lat: 44.115, lng: 1.703 },
  { id: 51, commune: 'Féneyrols', site: 'Dolmen de la Serre', niveau: 1, categorie: 'incontournable', lat: 44.123, lng: 1.742 },
  { id: 52, commune: 'Cazes-Mondenard', site: 'Pont de Lissart et patrimoine rural, Sentier expo de Cazes Mondenard', niveau: 1, categorie: 'incontournable', lat: 44.155, lng: 1.296 },
  { id: 53, commune: 'Verfeil-sur-Seye', site: 'Village, vallée de la Seye et Jardins de Quercy', niveau: 2, categorie: 'remarquable', lat: 44.099, lng: 1.671 },
  { id: 54, commune: 'Monteils', site: 'Parc de la Lère et lac', niveau: 1, categorie: 'incontournable', lat: 44.188, lng: 1.574 },
  { id: 55, commune: 'Lamothe-Capdeville', site: 'Plage d’Ardus et accès à l’Aveyron', niveau: 2, categorie: 'remarquable', lat: 44.020, lng: 1.485 },
  { id: 56, commune: 'Tréjouls', site: 'Sentier d’exposition paysager', niveau: 3, categorie: 'suggéré', lat: 44.122, lng: 1.350 },
  { id: 57, commune: 'Castelnau-Montratier', site: 'Bastide médiévale du Quercy Blanc', niveau: 1, categorie: 'incontournable', lat: 44.267, lng: 1.354 },
  { id: 58, commune: 'Villemade', site: 'Lac de Villemade', niveau: 2, categorie: 'remarquable', lat: 44.050, lng: 1.300 },
  { id: 59, commune: 'Albias', site: 'Espace Naturel des Berges de l’Aveyron', niveau: 1, categorie: 'incontournable', lat: 44.020, lng: 1.350 },
  { id: 60, commune: 'Labastide-du-Temple', site: 'Lac des Planques, Domaine du Gazania', niveau: 3, categorie: 'suggéré', lat: 44.025, lng: 1.360 },
  { id: 61, commune: 'Génébrières', site: 'Le lac du Tordre', niveau: 3, categorie: 'suggéré', lat: 44.050, lng: 1.320 },
  { id: 62, commune: 'Vaïssac', site: 'Le Lac du Gouyre', niveau: 1, categorie: 'incontournable', lat: 44.050, lng: 1.300 },
  { id: 63, commune: 'Belbèse', site: 'Point de vue de Belbèze-en-Lomagne', niveau: 2, categorie: 'remarquable', lat: 44.050, lng: 1.270 },
  { id: 64, commune: 'Escatalens', site: 'Jardin de Laroque', niveau: 3, categorie: 'suggéré', lat: 44.050, lng: 1.310 },
  { id: 65, commune: 'Le Causé', site: 'Point de vue du Causé', niveau: 2, categorie: 'remarquable', lat: 44.060, lng: 1.330 },
  { id: 66, commune: 'Barry-d\'Islemade', site: 'Lac de Jendraux', niveau: 3, categorie: 'suggéré', lat: 44.040, lng: 1.200 },
  { id: 67, commune: 'Marsac', site: 'Point de vue sur la vallée de l\'Arratz', niveau: 1, categorie: 'incontournable', lat: 44.070, lng: 1.320 },
  { id: 68, commune: 'Labastide-du-Temple', site: 'Lac des Planques, Domaine du Gazania', niveau: 3, categorie: 'suggéré', lat: 44.025, lng: 1.360 },
  { id: 69, commune: 'Puylaroque', site: 'Point de vue place de la Citadelle, Lac du Fourquet, Point de vue du château d\'eau', niveau: 1, categorie: 'incontournable', lat: 44.067, lng: 1.703 },
  { id: 70, commune: 'Saint-Nicolas-de-la-Grave', site: 'Réserve ornithologique du confluent du Tarn et de la Garonne, Le Jardin des Indiens', niveau: 1, categorie: 'incontournable', lat: 44.063, lng: 1.023 },
  { id: 71, commune: 'Auty', site: 'Point de vue d\'Auty', niveau: 1, categorie: 'incontournable', lat: 44.050, lng: 1.200 },
  { id: 72, commune: 'Cumont', site: 'Point du vue sur les Pyrénées', niveau: 3, categorie: 'suggéré', lat: 44.100, lng: 1.150 },
  { id: 73, commune: 'Gasques', site: 'Sentier nature du Vallon de Gasques', niveau: 2, categorie: 'remarquable', lat: 44.080, lng: 1.360 },
];

export async function GET() {
  return NextResponse.json(tgSites);
}
