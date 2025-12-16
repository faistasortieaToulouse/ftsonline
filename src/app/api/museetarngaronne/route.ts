// src/app/api/museetarngaronne/route.ts
import { NextResponse } from 'next/server';

export interface MuseeTarnGaronne {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number;
  lng: number;
}

const museesTarnGaronne: MuseeTarnGaronne[] = [
  { commune: 'Auvillar', nom: 'Musée du Vieil Auvillar (Faïence et Batellerie)', categorie: 'Musée', adresse: '3, rue du Château, 82340 Auvillar', url: 'http://www.auvillar.com/le-musee/', lat: 44.0538, lng: 0.8870 },
  { commune: 'Bardigues', nom: 'Château de Lamotte', categorie: 'Château', adresse: 'Château de Lamotte, 82340 Bardigues', url: 'https://chateaudelamottebardigues.com/', lat: 44.0500, lng: 0.9380 },
  { commune: 'Beaumont-de-Lomagne', nom: 'Maison Natale Pierre Fermat', categorie: 'Maison/Musée', adresse: '3 rue Pierre Fermat, 82500 Beaumont-de-Lomagne', url: 'http://www.museefermat.com/', lat: 43.8320, lng: 0.9080 },
  { commune: 'Bioule', nom: 'Château de Bioule', categorie: 'Château', adresse: '82800 Bioule', url: 'https://www.fondation-patrimoine.org/les-projets/chateau-de-bioule/103673', lat: 44.0680, lng: 1.4880 },
  { commune: 'Bouillac', nom: 'Abbaye de Grandselve', categorie: 'Abbaye', adresse: 'Lieu dit Grandselve, 82600 Bouillac', url: 'https://www.abbayedegrandselve.fr/', lat: 43.8900, lng: 1.2500 },
  { commune: 'Brassac', nom: 'Château de Brassac', categorie: 'Château', adresse: '82190 Brassac', url: 'https://monumentum.fr/monument-historique/pa00095712/brassac-chateau', lat: 44.1720, lng: 1.7050 },
  { commune: 'Bruniquel', nom: 'Les Châteaux de Bruniquel', categorie: 'Château', adresse: 'Rue du Château, 82800 Bruniquel', url: 'http://www.bruniquel.fr/les-chateaux-de-bruniquel/', lat: 44.0535, lng: 1.6660 },
  { commune: 'Bruniquel', nom: 'Maison Poussou', categorie: 'Musée/Galerie', adresse: '10, rue de la Boyssière, 82800 Bruniquel', url: 'https://www.petitfute.com/v25760-bruniquel-82800/c1173-visites-points-d-interet/c999-galerie-d-art-lieu-d-exposition-fondation-centre-culturel/810500-maison-poussou.html', lat: 44.0530, lng: 1.6655 },
  { commune: 'Castelsarrasin', nom: 'Église Saint-Sauveur', categorie: 'Église', adresse: '19 rue de la Révolution, 82100 Castelsarrasin', url: 'https://www.tourisme-tarnetgaronne.fr/offres/eglise-saint-sauveur-castelsarrasin-fr-2352376/', lat: 44.0385, lng: 1.1070 },
  { commune: 'Castelsarrasin', nom: 'Église Saint-Jean', categorie: 'Église', adresse: '19 Rue de la Révolution, 82100 Castelsarrasin', url: 'https://www.google.com/search?q=https://www.diocese-montauban.fr/castelsarrasin/paroisses/castelsarrasin-gandalou-n-d-dalem-saint-martin/saint-jean/', lat: 44.0385, lng: 1.1075 },
  { commune: 'Caussade', nom: 'L\'Épopée Chapelière', categorie: 'Musée spécialisé', adresse: 'Carré des Chapeliers - Les Récollets, 82300 Caussade', url: 'https://www.tourisme-quercy-caussadais.fr/fr/fiche/patrimoine-culturel/l-epopee-chapeliere-caussade_TFO5821214/', lat: 44.1500, lng: 1.5300 },
  { commune: 'Cazes-Mondenard', nom: 'Musée du Corbillard et de l\'Attelage', categorie: 'Musée spécialisé', adresse: 'Lieu dit Minguet, 82110 Cazes-Mondenard', url: 'https://officiel-galeries-musees.fr/lieu/musee-du-corbillard/', lat: 44.1800, lng: 1.2500 },
  { commune: 'Cordes-Tolosannes', nom: 'Abbaye de Belleperche - Musée des Arts de la Table', categorie: 'Abbaye/Musée', adresse: '121 route de Belleperche, 82700 Cordes-Tolosannes', url: 'https://belleperche.fr/', lat: 43.9900, lng: 1.0500 },
  { commune: 'Donzac', nom: 'Conservatoire des Métiers d\'Autrefois', categorie: 'Musée spécialisé', adresse: '1679, avenue du Brulhois, 82340 Donzac', url: 'http://www.conservatoiredesmetiersdautrefois.fr/', lat: 44.0900, lng: 0.8800 },
  { commune: 'Espinas', nom: 'Château de Cas', categorie: 'Château', adresse: 'Hameau de Cas, 82160 Espinas', url: 'https://www.chateau-de-cas.fr/', lat: 44.1800, lng: 1.7400 },
  { commune: 'Finhan', nom: 'MAGMA (Musée des Arts Graphiques et Musiques Actuelles)', categorie: 'Musée spécialisé', adresse: '54, route nationale, 82700 Finhan', url: 'http://www.musicophages.org/', lat: 43.9200, lng: 1.2000 },
  { commune: 'Ginals', nom: 'Abbaye de Beaulieu-en-Rouergue', categorie: 'Abbaye/Monument', adresse: '1086 route de l\'abbaye, 82330 Ginals', url: 'https://www.beaulieu-en-rouergue.fr/', lat: 44.1900, lng: 1.8300 },
  { commune: 'Goudourville', nom: 'Église Saint-Julien de Goudourville', categorie: 'Église', adresse: '423 Route de Saint-Vincent, 82400 Goudourville', url: 'http://catholique-montauban.cef.fr/', lat: 44.0700, lng: 0.9900 },
  { commune: 'Gramont', nom: 'Le Musée du Miel « Au rucher de Lamoure »', categorie: 'Musée spécialisé', adresse: 'Ld Moure, 82120 Gramont', url: 'https://www.lemuseedumiel.fr/', lat: 43.8600, lng: 0.8500 },
  { commune: 'Gramont', nom: 'Château de Gramont', categorie: 'Château/Monument', adresse: '5, place du Château, 82120 Gramont', url: 'https://www.chateau-gramont.fr/', lat: 43.8610, lng: 0.8510 },
  { commune: 'Gramont', nom: 'Musée de la Vigne et du Vin', categorie: 'Musée spécialisé', adresse: 'Village, 82120 Gramont', url: 'https://www.guide-tarn-aveyron.com/fr/tourisme/decouvrir/sites-touristiques/musees/gramont-394/musee-de-la-vigne-et-du-vin-388.html', lat: 43.8615, lng: 0.8515 },
];

export async function GET() {
  const sortedMusees = museesTarnGaronne.sort((a, b) => a.commune.localeCompare(b.commune));
  return NextResponse.json(sortedMusees);
}

export type Musee = MuseeTarnGaronne;
