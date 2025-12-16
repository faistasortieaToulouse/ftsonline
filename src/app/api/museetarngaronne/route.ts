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
  // Sites précédents (A-G)
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
  { commune: 'Grisolles', nom: 'Musée Calbet d\'Arts et Traditions Populaires', categorie: 'Musée', adresse: '15, rue Jean de Comère, 82170 Grisolles', url: 'http://www.museecalbet.com', lat: 43.8300, lng: 1.3000 },
  { commune: 'Labarthe', nom: 'Moulin de Saint-Géraud à Labarthe', categorie: 'Moulin / Site Historique', adresse: 'Moulin de Saint-Géraud, 82220 Labarthe', url: 'https://www.lafrancaise-tourisme.fr/', lat: 44.1800, lng: 1.5500 },
  { commune: 'Lachapelle', nom: 'Eglise baroque de Lachapelle', categorie: 'Édifice Religieux', adresse: 'Village, 82120 Lachapelle', url: 'http://www.lachapelle82.fr/', lat: 43.9000, lng: 0.9000 },
  { commune: 'Lacour', nom: 'Musée de la Mémoire Rurale à Lacour de Visa', categorie: 'Écomusée', adresse: 'Mairie (ancien château), 82190 Lacour', url: 'https://www.tourisme-tarnetgaronne.fr/offres/musee-de-la-memoire-rurale-a-lacour-lacour-fr-2354038/', lat: 44.1700, lng: 1.1500 },
  { commune: 'Lafrançaise', nom: 'Chapelle de Lapeyrouse', categorie: 'Chapelle / Édifice Religieux', adresse: 'Rue N-D de Lapeyrouse, 82130 Lafrançaise', url: 'https://www.google.com/search?q=https://lafrancaise.fr/decouvrir/10937', lat: 44.1500, lng: 1.1800 },
  { commune: 'Larrazet', nom: 'Château Johan de Cardailhac', categorie: 'Château / Lieu de Réception', adresse: '6 Rue Cacel, 82500 Larrazet', url: 'http://www.chateaujohandecardailhac.com', lat: 43.8500, lng: 0.9000 },
  { commune: 'Maubec', nom: 'Evocation de la vie rurale en Lomagne', categorie: 'Écomusée / Exposition', adresse: 'Maubec, 82500 (Espace Culturel d\'en Naoua)', url: 'https://www.google.com/search?q=http://mml82.jimdofree.com/', lat: 43.8700, lng: 0.9500 },
  { commune: 'Moissac', nom: 'Musée des arts et traditions populaires de Moissac', categorie: 'Musée', adresse: '4 rue de l\'Abbaye, 82200 Moissac', url: 'https://www.google.com/search?q=https://www.moissac.fr/culture/musees/', lat: 44.1020, lng: 1.0820 },
  { commune: 'Moissac', nom: 'Abbaye de Moissac', categorie: 'Abbaye / Site UNESCO', adresse: '6 Pl. Durand de Bredon, 82200 Moissac', url: 'http://www.abbayemoissac.com', lat: 44.1025, lng: 1.0825 },
  { commune: 'Moissac', nom: 'Palais Abbatial (Musée Marguerite Vidal)', categorie: 'Monument / Musée', adresse: '1 rue de l\'Abbaye, 82200 Moissac', url: 'http://www.abbayemoissac.com', lat: 44.1030, lng: 1.0830 },
  { commune: 'Montauban', nom: 'Musée Ingres et Bourdelle', categorie: 'Musée Beaux-Arts et Sculptures', adresse: '19, rue de l\'Hôtel-de-Ville, 82000 Montauban', url: 'http://www.museeingresbourdelle.com', lat: 44.0150, lng: 1.3550 },
  { commune: 'Montauban', nom: 'Muséum Victor Brun', categorie: 'Muséum d\'Histoire Naturelle', adresse: '2 Place Antoine Bourdelle, 82000 Montauban', url: 'http://www.museum.montauban.com', lat: 44.0155, lng: 1.3555 },
  { commune: 'Montauban', nom: 'Musée de l’Union Compagnonnique', categorie: 'Musée du Compagnonnage', adresse: '13 rue de l\'Union Compagnonnique, 82000 Montauban', url: 'https://www.montauban-tourisme.com/decouvrir/musees-et-expositions/le-top-5-des-musees/musee-compagnonnique/', lat: 44.0160, lng: 1.3560 },
  { commune: 'Montauban', nom: 'Musée des jouets', categorie: 'Musée', adresse: '770 boulevard Blaise Doumerc, 82000 Montauban', url: 'http://www.lemuseedesjouets.fr', lat: 44.0165, lng: 1.3565 },
  { commune: 'Montauban', nom: 'Musée de la Résistance et du Combattant', categorie: 'Musée d\'Histoire / Résistance', adresse: '2 boulevard Edouard-Herriot, 82000 Montauban', url: 'http://www.musee-resistance.montauban.com', lat: 44.0170, lng: 1.3570 },
  { commune: 'Montauban', nom: 'Centre du patrimoine (CIAP)', categorie: 'Centre d\'Interprétation', adresse: '2, rue du Collège, 82000 Montauban', url: 'https://montauban.com/information-transversale/annuaire-des-equipements/centre-dinterpretation-de-larchitecture-et-du-patrimoine-ciap-315', lat: 44.0175, lng: 1.3575 },
  { commune: 'Montauban', nom: 'Archeodeco', categorie: 'Galerie d\'Art / Reproduction', adresse: '5 Place Nationale, 82000 Montauban', url: 'http://archeodeco.eu/', lat: 44.0180, lng: 1.3580 },
  { commune: 'Montauban', nom: 'Musée du Terroir', categorie: 'Musée d\'Ethnologie', adresse: '2 Place Antoine Bourdelle, 82000 Montauban', url: 'http://www.museum.montauban.com', lat: 44.0185, lng: 1.3585 },
  { commune: 'Montauban', nom: 'Mini Musée', categorie: 'Mini-Musée / Collection', adresse: '22 Rue de la Comédie, 82000 Montauban', url: 'https://minimusee.wordpress.com/', lat: 44.0190, lng: 1.3590 },
  { commune: 'Montpezat-de-Quercy', nom: 'Collégiale Saint-Martin', categorie: 'Collégiale / Édifice Religieux', adresse: 'Place des Martyrs / Rue du Collège, 82270 Montpezat-de-Quercy', url: 'https://www.google.com/search?q=https://www.montpezatdequercy.com/', lat: 44.2500, lng: 1.4500 },
  { commune: 'Montpezat-de-Quercy', nom: 'La Maison du Combattant', categorie: 'Musée Historique', adresse: '8 rue de la Violette, 82270 Montpezat-de-Quercy', url: 'https://www.visit-occitanie.com/en/fiche/patrimoine-culturel/la-maison-du-combattant-montpezat-de-quercy_TFOSITRA2_PCU_5821466/', lat: 44.2505, lng: 1.4505 },
  { commune: 'Montricoux', nom: 'Château - Musée Marcel Lenoir', categorie: 'Musée d\'Art / Château', adresse: '56 Grande Rue, 82800 Montricoux', url: 'https://marcel-lenoir.com/musee-chateau-neo-classique-18e/situation-du-musee/', lat: 44.0600, lng: 1.5700 },
  { commune: 'Montricoux', nom: 'Musée La Villa des Peintres Lara Diégo', categorie: 'Musée d\'Art', adresse: '3 rue de la Mission, 82800 Montricoux', url: 'https://www.tourisme-tarnetgaronne.fr/offres/musee-la-villa-des-peintres-montricoux-fr-2357795/', lat: 44.0605, lng: 1.5705 },
  { commune: 'Nègrepelisse', nom: 'Château - La cuisine, centre d\'art et de design', categorie: 'Centre d\'Art et de Design / Château', adresse: 'Esplanade du Château, 82800 Nègrepelisse', url: 'http://www.la-cuisine.fr/', lat: 44.1000, lng: 1.4800 },
  { commune: 'Piquecos', nom: 'Château de Piquecos', categorie: 'Château / Monument Historique', adresse: '82130 Piquecos', url: 'https://www.guide-tarn-aveyron.com/fr/tourisme/decouvrir/sites-touristiques/chateaux/piquecos-459/chateau-de-piquecos-46.html', lat: 44.1100, lng: 1.3000 },
  { commune: 'Saint-Antonin-Noble-Val', nom: 'Musée municipal de la Préhistoire', categorie: 'Musée de Préhistoire et Traditions', adresse: 'Place de la Halle, 82140 Saint-Antonin-Noble-Val', url: 'https://www.google.com/search?q=https://www.tourisme-saint-antonin-noble-val.fr/', lat: 44.1500, lng: 1.7600 },
  { commune: 'Saint-Antonin-Noble-Val', nom: 'Maison Romane', categorie: 'Monument Historique / Architecture', adresse: 'Place de la Halle, 82140 Saint-Antonin-Noble-Val', url: 'https://www.google.com/search?q=https://www.tourisme-saint-antonin-noble-val.fr/', lat: 44.1505, lng: 1.7605 },
  { commune: 'Saint-Nicolas-de-la-Grave', nom: 'Musée Lamothe-Cadillac', categorie: 'Musée Historique (Fondateur de Detroit)', adresse: '7 Rue Lamothe Cadillac, 82210 Saint-Nicolas-de-la-Grave', url: 'https://www.tourisme-tarnetgaronne.fr/offres/musee-lamothe-cadillac-saint-nicolas-de-la-grave-fr-2353314/', lat: 44.0700, lng: 0.9500 },
  { commune: 'Saint-Projet', nom: 'Château de la Reine Margot', categorie: 'Château', adresse: 'Le Bourg, 82160 Saint-Projet', url: 'https://www.google.com/search?q=https://www.chateaudesaintprojet.fr/', lat: 44.2000, lng: 1.8000 },
  { commune: 'Septfonds', nom: 'La Mounière - Maison des Mémoires', categorie: 'Lieu de Mémoire / Musée', adresse: '15 rue des déportés, 82240 Septfonds', url: 'https://septfonds-la-mouniere.com/', lat: 44.1300, lng: 1.4500 },
  { commune: 'Septfonds', nom: 'Mémorial du Camp de Judes', categorie: 'Lieu de Mémoire / Site Historique', adresse: 'Lalande, 82240 Septfonds (proximité du camp)', url: 'https://septfonds-la-mouniere.com/', lat: 44.1305, lng: 1.4505 },
  { commune: 'Vaïssac', nom: 'Le Petit Paris, Paris en miniature', categorie: 'Parc à Thèmes / Miniature', adresse: '3225 route des Teularios, 82800 Vaïssac', url: 'https://www.petitparisparc.com/', lat: 44.1000, lng: 1.5000 },
  { commune: 'Valence-d\'Agen', nom: 'Les lavoirs de Valence d\'Agen', categorie: 'Patrimoine / Architecture', adresse: 'Rue Saint-Bernard ; Allée des Fontaines, 82400 Valence-d\'Agen', url: 'https://www.pop.culture.gouv.fr/notice/merimee/PA00095896', lat: 44.1000, lng: 0.8800 },
  { commune: 'Verfeil', nom: 'Aux outils d\'antan', categorie: 'Collection / Musée d\'Outils Anciens', adresse: 'Verfeil-sur-Seye, 82370 Verfeil (proche écohameau)', url: 'https://verfeil-eco.over-blog.org/acces.html', lat: 44.2000, lng: 1.6000 },
];

export async function GET() {
  const sortedMusees = museesTarnGaronne.sort((a, b) => a.commune.localeCompare(b.commune));
  return NextResponse.json(sortedMusees);
}

export type Musee = MuseeTarnGaronne;
