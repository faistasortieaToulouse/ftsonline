// src/app/api/museeherault/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseeHerault {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données des musées de l'Hérault avec des coordonnées géographiques APPROXIMATIVES (à vérifier)
const museesHerault: MuseeHerault[] = [
  { commune: 'Agde', nom: 'Musée agathois jules baudou', categorie: 'Archéologie / Arts & Traditions', adresse: '5, rue de la Fraternité, 34300 Agde', url: 'https://www.capdagde.com/musee-agathois', lat: 43.3134, lng: 3.4735 },
  { commune: 'Agde', nom: 'Château laurens', categorie: 'Patrimoine / Art Déco', adresse: '65, Chemin de Notre-Dame-de-Grau, 34300 Agde', url: 'https://www.chateaulaurens.fr', lat: 43.3082, lng: 3.4709 },
  { commune: 'Agde', nom: 'Galerie du patrimoine', categorie: 'Galerie d\'exposition', adresse: 'Hôtel de Ville, Place du Jeu de Ballon, 34300 Agde', url: 'https://www.capdagde.com/galerie-du-patrimoine', lat: 43.3138, lng: 3.4731 },
  { commune: 'Aumes', nom: 'Musée d\'Aumes', categorie: 'Musée Archéologique', adresse: 'Place de l\'Eglise, 34530 Aumes', url: 'https://www.visit-occitanie.com/en/fiche/patrimoine-culturel/musee-archeologique-aumes_TFOPCULAR0340000053/', lat: 43.4355, lng: 3.4880 },
  { commune: 'Bassan', nom: 'Musée des Meubles Modestes (Les Contes des Meubles Modestes)', categorie: 'Musée thématique', adresse: '2 rue des Remparts, 34290 Bassan', url: 'https://www.herault-tourisme.com/fiche/les-contes-des-meubles-modestes-bassan/', lat: 43.4079, lng: 3.2505 },
  { commune: 'Bédarieux', nom: 'Musée du train et de la photographie', categorie: 'Musée thématique (Train / Photo)', adresse: 'Place aux Herbes, 34600 Bédarieux', url: 'https://www.herault-tourisme.com/fiche/musee-du-train-et-de-la-photographie-bedarieux/', lat: 43.6062, lng: 3.1517 },
  { commune: 'Berlou', nom: 'La maison du cambrien - musee paleontologique', categorie: 'Paléontologie / Sciences', adresse: 'Hameau de Berlou, 34360 Berlou', url: 'https://www.maisonducambrien.fr', lat: 43.4912, lng: 3.0189 },
  { commune: 'Béziers', nom: 'Musée taurin', categorie: 'Musée thématique (Tauromachie)', adresse: 'Ancienne église des Dominicains, 7 Rue Massol, 34500 Béziers', url: 'https://www.beziers.fr/equipement/musee-taurin', lat: 43.3444, lng: 3.2185 },
  { commune: 'Béziers', nom: 'Musée de la Faïence et des Arts de la Table', categorie: 'Musée thématique (Arts décoratifs)', adresse: 'Château de Raissac, 34500 Béziers', url: 'https://www.beziers-mediterranee.com/fiche/musee-de-la-faience-et-des-arts-de-la-table/', lat: 43.3243, lng: 3.2435 },
  { commune: 'Béziers', nom: 'Musée des Beaux-Arts - Hôtel Fayet', categorie: 'Musée des Beaux-Arts', adresse: '9 rue du Capus, 34500 Béziers', url: 'https://www.beziers.fr/equipement/musee-des-beaux-arts', lat: 43.3435, lng: 3.2195 },
  { commune: 'Béziers', nom: 'Musée juif de béziers', categorie: 'Histoire / Culture Juive', adresse: '3, rue du 4 Septembre, 34500 Béziers', url: 'https://museejuifbeziers.com', lat: 43.3446, lng: 3.2190 },
  { commune: 'Béziers', nom: 'Espace jean moulin - MAM', categorie: 'Mémoire / Exposition d\'Art Moderne', adresse: 'Place Jean Moulin, 34500 Béziers', url: 'https://www.beziers.fr/equipement/espace-jean-moulin-mam', lat: 43.3423, lng: 3.2199 },
  { commune: 'Béziers', nom: 'Les ostals', categorie: 'Patrimoine / Centre d\'Interprétation', adresse: '2, Place des Albigeois, 34500 Béziers', url: 'https://www.beziers.fr/equipement/les-ostals', lat: 43.3411, lng: 3.2193 },
  { commune: 'Boujan-sur-Libron', nom: 'Musée Chapy Père et Fils (Musée Chapy)', categorie: 'Musée thématique (Moto / Cycle)', adresse: '14 rue du Muscat, 34760 Boujan-sur-Libron', url: 'https://www.herault-tourisme.com/fiche/musee-chapy-boujan-sur-libron/', lat: 43.3768, lng: 3.2087 },
  { commune: 'Bouzigues', nom: 'Musée de l\'Étang de Thau', categorie: 'Musée thématique (Conchyliculture)', adresse: '7 Quai du Port de Pêche, 34140 Bouzigues', url: 'https://patrimoine.agglopole.fr/musee-de-letang-de-thau/', lat: 43.4475, lng: 3.6558 },
  { commune: 'Cabrières', nom: 'Caveau museographique des vignerons', categorie: 'Musée thématique (Vigne et Vin)', adresse: '15 Avenue du 8 Mai 1945, 34800 Cabrières', url: 'https://www.languedoc-coeur-herault.fr/caveau-museographique-des-vignerons', lat: 43.6067, lng: 3.4259 },
  { commune: 'Capestang', nom: 'Château des archevêques de capestang', categorie: 'Patrimoine / Histoire', adresse: 'Place Jean Jaurès, 34310 Capestang', url: 'https://capestang-tourisme.fr/fiche/chateau-des-archeveques-de-capestang-capestang/', lat: 43.3323, lng: 3.0905 },
  { commune: 'Caux', nom: 'Espace patrimoine', categorie: 'Patrimoine Local / Histoire', adresse: '38, Avenue de Pézenas, 34720 Caux', url: 'https://www.herault-tourisme.com/fiche/espace-patrimoine-caux/', lat: 43.4795, lng: 3.4222 },
  { commune: 'Cazedarnes', nom: 'Musée de l\'Abbaye de Fontcaude - Fonderie de Cloches', categorie: 'Musée (sur site historique)', adresse: 'Hameau de Fontcaude, 34460 Cazedarnes', url: 'https://www.abbaye-de-fontcaude.com', lat: 43.4093, lng: 3.0315 },
  { commune: 'Colombières-sur-orb', nom: 'Statue de la liberté de lugné', categorie: 'Patrimoine / Lieu Historique', adresse: 'Lieu-dit Lugné, 34390 Colombières-sur-Orb', url: 'https://www.herault-tourisme.com/fiche/statue-de-la-liberte-de-lugne-colombieres-sur-orb/', lat: 43.5658, lng: 3.0118 },
  { commune: 'Colombiers', nom: 'Cave du chateau de colombiers', categorie: 'Musée thématique (Vigne et Vin) / Patrimoine', adresse: '1, Avenue de Béziers, 34440 Colombiers', url: 'https://www.chateaudecolombiers.fr', lat: 43.3275, lng: 3.1495 },
  { commune: 'Courniou', nom: 'Musée de la speleologie de la grotte la fileuse de verre', categorie: 'Spéléologie / Nature', adresse: 'La Fileuse de Verre, 34220 Courniou', url: 'https://www.fileusedeverre.fr', lat: 43.4357, lng: 2.8055 },
  { commune: 'Cruzy', nom: 'Musée de cruzy', categorie: 'Archéologie / Paléontologie', adresse: 'Rue du Pont de l\'Abbé, 34310 Cruzy', url: 'https://www.cruzy.fr/patrimoine/musee-de-cruzy/', lat: 43.3448, lng: 2.9535 },
  { commune: 'Frontignan-la-Peyrade', nom: 'Musée de Frontignan-la-Peyrade (Musée municipal)', categorie: 'Musée Archéologie / Ethnologie', adresse: '4 rue Lucien Salette, 34110 Frontignan', url: 'https://www.frontignan.fr/mes-loisirs/culture-patrimoine-festivites/equipements-culturels/musee-municipal/', lat: 43.4350, lng: 3.7663 },
  { commune: 'Hérépian', nom: 'Musée de la cloche et de la sonnaille', categorie: 'Musée thématique (Artisanat)', adresse: '4, Rue des Jardins, 34600 Hérépian', url: 'https://www.herault-tourisme.com/fiche/musee-de-la-cloche-et-de-la-sonnaille-herepian/', lat: 43.5828, lng: 3.1090 },
  { commune: 'La tamarissière', nom: 'Bunkers 638 et 610', categorie: 'Lieu Historique (WWII)', adresse: 'Plage de la Tamarissière, 34300 Agde', url: 'https://www.capdagde.com/fiche/bunkers-la-tamarissiere/', lat: 43.2925, lng: 3.4770 },
  { commune: 'Lattes', nom: 'Site Archéologique Lattara - Musée Henri Prades', categorie: 'Musée Archéologique', adresse: '390, route de Pérols, 34970 Lattes', url: 'https://museearcheo.montpellier3m.fr', lat: 43.5701, lng: 3.9056 },
  { commune: 'Minerve', nom: 'Musée d\'archeologie et de paleontologie de minerve', categorie: 'Archéologie / Paléontologie', adresse: 'Rue des remparts, 34210 Minerve', url: 'https://www.minerve-tourisme.com/musee-darcheologie-et-de-paleontologie/', lat: 43.3496, lng: 2.7479 },
  { commune: 'Montouliers', nom: 'L\'atelier - cathédrale de dentelle de bois', categorie: 'Artisanat / Sculpture sur Bois', adresse: 'Place du Temple, 34310 Montouliers', url: 'https://www.ot-minervois.com/fiche/latelier-cathedrale-de-dentelle-de-bois-montouliers/', lat: 43.3101, lng: 2.9123 },
  { commune: 'Olargues', nom: 'Musée d\'arts et traditions populaires d\'olargues', categorie: 'Arts & Traditions Populaires', adresse: 'Pont du Diable, 34390 Olargues', url: 'https://www.parc-haut-languedoc.fr/equipement/musee-darts-et-traditions-populaires-dolargues/', lat: 43.6060, lng: 2.9304 },
  { commune: 'Olargues', nom: 'Centre cébenna', categorie: 'Centre d\'Interprétation (Cévennes)', adresse: 'Rue de la Vierge, 34390 Olargues', url: 'https://www.parc-haut-languedoc.fr/equipement/centre-cebenna/', lat: 43.6062, lng: 2.9300 },
  { commune: 'Olonzac', nom: 'Centre de recherche et de documentation du minervois', categorie: 'Recherche / Documentation (Minervois)', adresse: '31, Avenue d\'Homps, 34210 Olonzac', url: 'https://www.olonzac.fr/crpm/', lat: 43.2750, lng: 2.7592 },
  { commune: 'Pézenas', nom: 'Musée de la porte et de la ferronnerie', categorie: 'Musée thématique (Artisanat)', adresse: '10, Rue Montmorency, 34120 Pézenas', url: 'https://www.ville-pezenas.fr/decouvrir/musee-de-la-porte-et-de-la-ferronnerie/', lat: 43.4619, lng: 3.4245 },
  { commune: 'Pézenas', nom: 'Musée de vulliod-saint-germain', categorie: 'Art / Histoire Locale', adresse: '3, rue Albert Paul Alliès, 34120 Pézenas', url: 'https://www.ville-pezenas.fr/decouvrir/musee-de-vulliod-saint-germain/', lat: 43.4608, lng: 3.4240 },
  { commune: 'Pézenas', nom: 'Musée international du jouet', categorie: 'Musée thématique (Jouets)', adresse: '13, Rue de la Foire, 34120 Pézenas', url: 'https://www.museeinternationaldujouet.fr', lat: 43.4615, lng: 3.4248 },
  { commune: 'Pézenas', nom: 'L\'a-musée boby lapointe', categorie: 'Musée Mémoriel (Artiste)', adresse: '1 Place Gambetta, 34120 Pézenas', url: 'https://bobylapointe.fr/l\'a-musée', lat: 43.4612, lng: 3.4235 },
  { commune: 'Portiragnes', nom: 'Musée archéologique jean saluste', categorie: 'Archéologie', adresse: 'Espace Culturel, 34420 Portiragnes', url: 'https://www.portiragnes.fr/culture-patrimoine/musee-archeologique-jean-saluste/', lat: 43.3101, lng: 3.3283 },
  { commune: 'Puisserguier', nom: 'Écomusée de la vie d\'autrefois', categorie: 'Écomusée / Vie Rurale', adresse: 'Avenue de la Résistance, 34620 Puisserguier', url: 'https://www.herault-tourisme.com/fiche/ecomusee-de-la-vie-dautrefois-puisserguier/', lat: 43.3105, lng: 3.0188 },
  { commune: 'Quarante', nom: 'Musée Archéologique de Quarante', categorie: 'Musée Archéologique', adresse: 'Rue du Porche, 34310 Quarante', url: 'https://www.herault-tourisme.com/fiche/patrimoine-culturel/musee-archeologique-de-quarante-quarante_TFOPCULAR0340000137/', lat: 43.3444, lng: 2.9930 },
  { commune: 'Saint-gervais-sur-mare', nom: 'Maison cévenole des arts et traditions populaires', categorie: 'Arts & Traditions Populaires', adresse: '11, Avenue de la Gare, 34610 Saint-Gervais-sur-Mare', url: 'https://www.herault-tourisme.com/fiche/maison-cevenole-des-arts-et-traditions-populaires-saint-gervais-sur-mare/', lat: 43.6496, lng: 3.0305 },
  { commune: 'Saint-pons-de-thomières', nom: 'Musée de prehistoire régionale', categorie: 'Préhistoire / Archéologie', adresse: 'Place du Foirail, 34220 Saint-Pons-de-Thomières', url: 'https://www.museeprehistoire.com', lat: 43.4938, lng: 2.7601 },
  { commune: 'Sérignan', nom: 'Musée régional d\'art contemporain occitanie / pyrenees-mediterranee', categorie: 'Art Contemporain (MRAC)', adresse: '146, Avenue de la Plage, 34410 Sérignan', url: 'https://mrac.laregion.fr', lat: 43.2842, lng: 3.3195 },
  { commune: 'Servian', nom: 'Musée de la distillerie et de l\'écurie', categorie: 'Musée thématique (Distillerie / Vie rurale)', adresse: 'Ancienne Distillerie, 34290 Servian', url: 'https://www.herault-tourisme.com/fiche/musee-de-la-distillerie-et-de-lecurie-servian/', lat: 43.4111, lng: 3.2985 },
  { commune: 'Valras-plage', nom: 'Le palais de la maquette - musée du jouet', categorie: 'Musée thématique (Maquettes / Jouets)', adresse: 'Avenue de l\'Épargne, 34350 Valras-Plage', url: 'http://www.palaisdelamaquette.fr', lat: 43.2505, lng: 3.2858 },
  { commune: 'Vias', nom: 'Maison du patrimoine', categorie: 'Patrimoine Local', adresse: 'Rue de la Promenade, 34450 Vias', url: 'https://www.vias-mediterranee.fr/maison-du-patrimoine/', lat: 43.3240, lng: 3.4168 },
  { commune: 'Villemagne-l\'argentière', nom: 'Musée saint-grégoire', categorie: 'Art Sacré / Histoire Locale', adresse: 'Rue du Prieuré, 34600 Villemagne-l\'Argentière', url: 'https://www.herault-tourisme.com/fiche/musee-saint-gregoire-villemagne-largentiere/', lat: 43.5960, lng: 3.1250 },
  { commune: 'Villetelle', nom: 'Musée d\'Ambrussum', categorie: 'Musée Archéologique', adresse: 'Chemin d\'Ambrussum, 34400 Villetelle', url: 'https://www.ambrussum.fr', lat: 43.7314, lng: 4.1924 },
];

export async function GET() {
  return NextResponse.json(museesHerault);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseeHerault;
