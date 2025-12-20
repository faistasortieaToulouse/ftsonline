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
  { id: 3, commune: 'Alban', site: 'Château et village pittoresque', niveau: 2, categorie: 'remarquable', lat: 43.812, lng: 2.140 },
  { id: 4, commune: 'Anglès', site: 'Village historique et église', niveau: 2, categorie: 'remarquable', lat: 43.610, lng: 2.570 },
  { id: 5, commune: 'Beauvais-sur-Tescou', site: 'Village et bords de rivière', niveau: 2, categorie: 'remarquable', lat: 43.745, lng: 1.810 },
  { id: 6, commune: 'Blaye-les-Mines', site: 'Village minier et Musée du charbon', niveau: 2, categorie: 'remarquable', lat: 43.720, lng: 2.410 },
  { id: 7, commune: 'Brassac', site: 'Village médiéval et patrimoine local', niveau: 2, categorie: 'remarquable', lat: 43.567, lng: 2.280 },
  { id: 8, commune: 'Burlats', site: 'Pavillon d’Adélaïde et village médiéval', niveau: 1, categorie: 'incontournable', lat: 43.636, lng: 2.317 },
  { id: 9, commune: 'Cadalen', site: 'Église et village historique', niveau: 3, categorie: 'suggéré', lat: 43.920, lng: 1.910 },
  { id: 10, commune: 'Carbes', site: 'Église et village typique', niveau: 3, categorie: 'suggéré', lat: 43.810, lng: 2.170 },
  { id: 11, commune: 'Carmaux', site: 'Musée de la Mine et Domaine de la Verrerie', niveau: 1, categorie: 'incontournable', lat: 44.053, lng: 2.158 },
  { id: 12, commune: 'Castelnau-de-Bonne', site: 'Village et patrimoine rural', niveau: 2, categorie: 'remarquable', lat: 43.882, lng: 2.230 },
  { id: 13, commune: 'Castelnau-de-Montmiral', site: 'Bastide et place aux arcades', niveau: 1, categorie: 'incontournable', lat: 43.965, lng: 1.820 },
  { id: 14, commune: 'Castres', site: 'Maisons sur l’Agout et Musée Goya', niveau: 1, categorie: 'incontournable', lat: 43.606, lng: 2.241 },
  { id: 15, commune: 'Cug-Toulza', site: 'Village et patrimoine local', niveau: 2, categorie: 'remarquable', lat: 43.767, lng: 1.893 },
  { id: 16, commune: 'Damiatte', site: 'Église et village historique', niveau: 3, categorie: 'suggéré', lat: 43.792, lng: 2.047 },
  { id: 17, commune: 'Dourgne', site: 'Abbaye d’En-Calcat et Sainte-Scholastique et village historique', niveau: 1, categorie: 'incontournable', lat: 43.550, lng: 2.135 },
  { id: 18, commune: 'Durfort', site: 'Village des chaudronniers et artisans du cuivre', niveau: 2, categorie: 'remarquable', lat: 43.438, lng: 2.068 },
  { id: 19, commune: 'Gaillac', site: 'Abbaye Saint-Michel et vignobles', niveau: 1, categorie: 'incontournable', lat: 43.901, lng: 1.897 },
  { id: 20, commune: 'Giroussens', site: 'Jardins et village historique', niveau: 1, categorie: 'incontournable', lat: 43.855, lng: 1.920 },
  { id: 21, commune: 'Graulhet', site: 'Musée du cuir et ville industrielle', niveau: 2, categorie: 'remarquable', lat: 43.816, lng: 2.144 },
  { id: 22, commune: 'Hautpoul', site: 'Berceau médiéval de Mazamet et passerelle', niveau: 1, categorie: 'incontournable', lat: 43.475, lng: 2.378 },
  { id: 23, commune: 'Labastide-Rouairoux', site: 'Village et patrimoine textile', niveau: 3, categorie: 'suggéré', lat: 43.544, lng: 2.321 },
  { id: 24, commune: 'Labastide-de-Lévis', site: 'Bastide et Château de la Guiraudie', niveau: 1, categorie: 'incontournable', lat: 43.926, lng: 2.011 },
  { id: 25, commune: 'Lacaune', site: 'Village thermal et tradition fromagère', niveau: 1, categorie: 'incontournable', lat: 43.633, lng: 2.670 },
  { id: 26, commune: 'Lacaze', site: 'Village et château médiéval', niveau: 2, categorie: 'remarquable', lat: 43.721, lng: 2.092 },
  { id: 27, commune: 'Lacrouz', site: 'Site du Sidobre et patrimoine naturel', niveau: 1, categorie: 'incontournable', lat: 43.612, lng: 2.503 },
  { id: 28, commune: 'Lautrec', site: 'Village médiéval et production de sel', niveau: 1, categorie: 'incontournable', lat: 43.724, lng: 2.120 },
  { id: 29, commune: 'Lescure-d\'Albigeois', site: 'Église et village typique', niveau: 2, categorie: 'remarquable', lat: 43.910, lng: 2.020 },
  { id: 30, commune: 'Lisle-sur-Tarn', site: 'Bastide de rive et Place aux Couverts', niveau: 1, categorie: 'incontournable', lat: 43.852, lng: 1.810 },
  { id: 31, commune: 'Lombers', site: 'Village et église médiévale', niveau: 3, categorie: 'suggéré', lat: 43.873, lng: 2.058 },
  { id: 32, commune: 'Mazamet', site: 'Ancienne cité lainière et Maison des Mémoires', niveau: 1, categorie: 'incontournable', lat: 43.491, lng: 2.373 },
  { id: 33, commune: 'Monestiés', site: 'Mise au Tombeau et village médiéval', niveau: 1, categorie: 'incontournable', lat: 44.071, lng: 2.097 },
  { id: 34, commune: 'Montgaillard', site: 'Village et patrimoine local', niveau: 1, categorie: 'incontournable', lat: 43.898, lng: 2.043 },
  { id: 35, commune: 'Montredon-Labessonnié', site: 'Village et patrimoine textile', niveau: 2, categorie: 'remarquable', lat: 43.750, lng: 2.130 },
  { id: 36, commune: 'Pampelonne', site: 'Village historique et paysages locaux', niveau: 1, categorie: 'incontournable', lat: 43.788, lng: 2.240 },
  { id: 37, commune: 'Penne', site: 'Forteresse médiévale sur l’éperon rocheux', niveau: 1, categorie: 'incontournable', lat: 44.077, lng: 1.730 },
  { id: 38, commune: 'Puycelsi', site: 'Forteresse aux portes du massif de la Grésigne', niveau: 1, categorie: 'incontournable', lat: 43.993, lng: 1.710 },
  { id: 39, commune: 'Puylaurens', site: 'Village historique et paysages du Sidobre', niveau: 2, categorie: 'remarquable', lat: 43.590, lng: 2.420 },
  { id: 40, commune: 'Rabastens', site: 'Centre médiéval et bords du Tarn', niveau: 2, categorie: 'remarquable', lat: 43.836, lng: 1.895 },
  { id: 41, commune: 'Réalmont', site: 'Place centrale et patrimoine religieux', niveau: 2, categorie: 'remarquable', lat: 43.784, lng: 2.060 },
  { id: 42, commune: 'Roquecourbe', site: 'Village et patrimoine religieux', niveau: 1, categorie: 'incontournable', lat: 43.733, lng: 2.040 },
  { id: 43, commune: 'Salvagnac', site: 'Village médiéval et moulin', niveau: 2, categorie: 'remarquable', lat: 43.910, lng: 1.995 },
  { id: 44, commune: 'Saint-Amans-Soult', site: 'Village et musée local', niveau: 1, categorie: 'incontournable', lat: 43.500, lng: 2.080 },
  { id: 45, commune: 'Saint-Juéry', site: 'Village historique et église', niveau: 2, categorie: 'remarquable', lat: 43.620, lng: 2.210 },
  { id: 46, commune: 'Saint-Paul-Cap-de-Joux', site: 'Église et village typique', niveau: 1, categorie: 'incontournable', lat: 43.777, lng: 1.900 },
  { id: 47, commune: 'Saint-Pons-de-Thomières', site: 'Abbaye et village historique', niveau: 1, categorie: 'incontournable', lat: 43.600, lng: 2.450 },
  { id: 48, commune: 'Saint-Sulpice-la-Pointe', site: 'Église et patrimoine industriel', niveau: 2, categorie: 'remarquable', lat: 43.826, lng: 1.970 },
  { id: 49, commune: 'Saint-Urcisse', site: 'Village et patrimoine local', niveau: 1, categorie: 'incontournable', lat: 43.844, lng: 2.003 },
  { id: 50, commune: 'Sorèze', site: 'Abbaye-ÉcoleNotre-Dame de la Sagne et Musée Dom Robert', niveau: 1, categorie: 'incontournable', lat: 43.452, lng: 2.067 },
  { id: 51, commune: 'Técou', site: 'Église et village médiéval', niveau: 3, categorie: 'suggéré', lat: 43.867, lng: 2.220 },
  { id: 52, commune: 'Vaour', site: 'Village médiéval et château', niveau: 1, categorie: 'incontournable', lat: 43.973, lng: 1.830 },
  { id: 53, commune: 'Vabre', site: 'Village et patrimoine industriel', niveau: 2, categorie: 'remarquable', lat: 43.730, lng: 2.330 },
  { id: 54, commune: 'Valderiès', site: 'Village et patrimoine local', niveau: 2, categorie: 'remarquable', lat: 43.780, lng: 2.150 },
  { id: 55, commune: 'Valence-d\'Albigeois', site: 'Village médiéval et château', niveau: 3, categorie: 'suggéré', lat: 43.900, lng: 2.170 },
  { id: 56, commune: 'Villefranche-d\'Albigeois', site: 'Village et bastide', niveau: 3, categorie: 'suggéré', lat: 43.920, lng: 2.160 },
  { id: 57, commune: 'Murat-sur-Vèbre', site: 'Centre d\'interprétation des mégalithes', niveau: 1, categorie: 'incontournable', lat: 43.620, lng: 2.500 },
  { id: 58, commune: 'Ponteilla', site: 'Village et patrimoine local', niveau: 3, categorie: 'suggéré', lat: 43.705, lng: 2.210 },
  { id: 59, commune: 'La Sauzière-Saint-Jean', site: 'Village et église', niveau: 1, categorie: 'remarquable', lat: 43.746, lng: 2.040 },
  { id: 60, commune: 'Lempaut', site: 'Abbaye d’Ardorel', niveau: 1, categorie: 'remarquable', lat: 43.966, lng: 2.370 },
  { id: 61, commune: 'Montdragon', site: 'Abbaye de la Salvetat', niveau: 1, categorie: 'remarquable', lat: 43.940, lng: 2.480 },
  { id: 62, commune: 'Vielmur-sur-Agout', site: 'Abbaye de Vielmur', niveau: 1, categorie: 'remarquable', lat: 43.905, lng: 2.565 },
];

export async function GET() {
  return NextResponse.json(tarnSites);
}
