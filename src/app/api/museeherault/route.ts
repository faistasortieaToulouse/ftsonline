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
  { commune: 'AGDE', nom: 'MUSÉE AGATHOIS JULES BAUDOU', categorie: 'Archéologie / Arts & Traditions', adresse: '5, rue de la Fraternité, 34300 Agde', url: 'https://www.capdagde.com/musee-agathois', lat: 43.3134, lng: 3.4735 },
  { commune: 'AGDE', nom: 'CHÂTEAU LAURENS', categorie: 'Patrimoine / Art Déco', adresse: '65, Chemin de Notre-Dame-de-Grau, 34300 Agde', url: 'https://www.chateaulaurens.fr', lat: 43.3082, lng: 3.4709 },
  { commune: 'AGDE', nom: 'GALERIE DU PATRIMOINE', categorie: 'Galerie d\'exposition', adresse: 'Hôtel de Ville, Place du Jeu de Ballon, 34300 Agde', url: 'https://www.capdagde.com/galerie-du-patrimoine', lat: 43.3138, lng: 3.4731 },
  { commune: 'BASSAN', nom: 'LES CONTES DES MEUBLES MODESTES', categorie: 'Arts Décoratifs / Mobilier', adresse: '26, Grand\' Rue, 34290 Bassan', url: 'https://www.herault-tourisme.com/fiche/les-contes-des-meubles-modestes-bassan/', lat: 43.4079, lng: 3.2505 },
  { commune: 'BEDARIEUX', nom: 'MUSÉE DU TRAIN ET DE LA PHOTOGRAPHIE', categorie: 'Musée thématique (Train / Photo)', adresse: 'Place aux Herbes, 34600 Bédarieux', url: 'https://www.herault-tourisme.com/fiche/musee-du-train-et-de-la-photographie-bedarieux/', lat: 43.6062, lng: 3.1517 },
  { commune: 'BERLOU', nom: 'LA MAISON DU CAMBRIEN - MUSEE PALEONTOLOGIQUE', categorie: 'Paléontologie / Sciences', adresse: 'Hameau de Berlou, 34360 Berlou', url: 'https://www.maisonducambrien.fr', lat: 43.4912, lng: 3.0189 },
  { commune: 'BEZIERS', nom: 'MUSÉE TAURIN', categorie: 'Musée thématique (Tauromachie)', adresse: 'Ancienne église des Dominicains, Rue Massol, 34500 Béziers', url: 'https://www.beziers.fr/equipement/musee-taurin', lat: 43.3444, lng: 3.2185 },
  { commune: 'BEZIERS', nom: 'MUSÉE DES BEAUX-ARTS - HÔTEL FAYET', categorie: 'Beaux-Arts', adresse: '8, rue du Général Faidherbe, 34500 Béziers', url: 'https://www.beziers.fr/equipement/musee-des-beaux-arts', lat: 43.3435, lng: 3.2195 },
  { commune: 'BEZIERS', nom: 'MUSÉE JUIF DE BÉZIERS', categorie: 'Histoire / Culture Juive', adresse: '3, rue du 4 Septembre, 34500 Béziers', url: 'https://museejuifbeziers.com', lat: 43.3446, lng: 3.2190 },
  { commune: 'BEZIERS', nom: 'ESPACE JEAN MOULIN - MAM', categorie: 'Mémoire / Exposition d\'Art Moderne', adresse: 'Place Jean Moulin, 34500 Béziers', url: 'https://www.beziers.fr/equipement/espace-jean-moulin-mam', lat: 43.3423, lng: 3.2199 },
  { commune: 'BEZIERS', nom: 'LES OSTALS', categorie: 'Patrimoine / Centre d\'Interprétation', adresse: '2, Place des Albigeois, 34500 Béziers', url: 'https://www.beziers.fr/equipement/les-ostals', lat: 43.3411, lng: 3.2193 },
  { commune: 'BOUJAN-SUR-LIBRON', nom: 'MUSÉE CHAPY', categorie: 'Art Moderne / Peinture (Paul Chapy)', adresse: '14, rue Ferdinand Fabre, 34760 Boujan-sur-Libron', url: 'https://www.boujansurlibron.com/culture-patrimoine/musee-chapy/', lat: 43.3768, lng: 3.2087 },
  { commune: 'CABRIERES', nom: 'CAVEAU MUSEOGRAPHIQUE DES VIGNERONS', categorie: 'Musée thématique (Vigne et Vin)', adresse: '15 Avenue du 8 Mai 1945, 34800 Cabrières', url: 'https://www.languedoc-coeur-herault.fr/caveau-museographique-des-vignerons', lat: 43.6067, lng: 3.4259 },
  { commune: 'CAPESTANG', nom: 'CHÂTEAU DES ARCHEVÊQUES DE CAPESTANG', categorie: 'Patrimoine / Histoire', adresse: 'Place Jean Jaurès, 34310 Capestang', url: 'https://capestang-tourisme.fr/fiche/chateau-des-archeveques-de-capestang-capestang/', lat: 43.3323, lng: 3.0905 },
  { commune: 'CAUX', nom: 'ESPACE PATRIMOINE', categorie: 'Patrimoine Local / Histoire', adresse: '38, Avenue de Pézenas, 34720 Caux', url: 'https://www.herault-tourisme.com/fiche/espace-patrimoine-caux/', lat: 43.4795, lng: 3.4222 },
  { commune: 'COLOMBIERES-SUR-ORB', nom: 'STATUE DE LA LIBERTÉ DE LUGNÉ', categorie: 'Patrimoine / Lieu Historique', adresse: 'Lieu-dit Lugné, 34390 Colombières-sur-Orb', url: 'https://www.herault-tourisme.com/fiche/statue-de-la-liberte-de-lugne-colombieres-sur-orb/', lat: 43.5658, lng: 3.0118 },
  { commune: 'COLOMBIERS', nom: 'CAVE DU CHATEAU DE COLOMBIERS', categorie: 'Musée thématique (Vigne et Vin) / Patrimoine', adresse: '1, Avenue de Béziers, 34440 Colombiers', url: 'https://www.chateaudecolombiers.fr', lat: 43.3275, lng: 3.1495 },
  { commune: 'COURNIOU', nom: 'MUSEE DE LA SPELEOLOGIE DE LA GROTTE LA FILEUSE DE VERRE', categorie: 'Spéléologie / Nature', adresse: 'La Fileuse de Verre, 34220 Courniou', url: 'https://www.fileusedeverre.fr', lat: 43.4357, lng: 2.8055 },
  { commune: 'CRUZY', nom: 'MUSÉE DE CRUZY', categorie: 'Archéologie / Paléontologie', adresse: 'Rue du Pont de l\'Abbé, 34310 Cruzy', url: 'https://www.cruzy.fr/patrimoine/musee-de-cruzy/', lat: 43.3448, lng: 2.9535 },
  { commune: 'HEREPIAN', nom: 'MUSEE DE LA CLOCHE ET DE LA SONNAILLE', categorie: 'Musée thématique (Artisanat)', adresse: '4, Rue des Jardins, 34600 Hérépian', url: 'https://www.herault-tourisme.com/fiche/musee-de-la-cloche-et-de-la-sonnaille-herepian/', lat: 43.5828, lng: 3.1090 },
  { commune: 'LA TAMARISSIERE', nom: 'BUNKERS 638 ET 610', categorie: 'Lieu Historique (WWII)', adresse: 'Plage de la Tamarissière, 34300 Agde', url: 'https://www.capdagde.com/fiche/bunkers-la-tamarissiere/', lat: 43.2925, lng: 3.4770 },
  { commune: 'MINERVE', nom: 'MUSEE D\'ARCHEOLOGIE ET DE PALEONTOLOGIE DE MINERVE', categorie: 'Archéologie / Paléontologie', adresse: 'Rue des remparts, 34210 Minerve', url: 'https://www.minerve-tourisme.com/musee-darcheologie-et-de-paleontologie/', lat: 43.3496, lng: 2.7479 },
  { commune: 'MONTOULIERS', nom: 'L\'ATELIER - CATHÉDRALE DE DENTELLE DE BOIS', categorie: 'Artisanat / Sculpture sur Bois', adresse: 'Place du Temple, 34310 Montouliers', url: 'https://www.ot-minervois.com/fiche/latelier-cathedrale-de-dentelle-de-bois-montouliers/', lat: 43.3101, lng: 2.9123 },
  { commune: 'OLARGUES', nom: 'MUSEE D\'ARTS ET TRADITIONS POPULAIRES D\'OLARGUES', categorie: 'Arts & Traditions Populaires', adresse: 'Pont du Diable, 34390 Olargues', url: 'https://www.parc-haut-languedoc.fr/equipement/musee-darts-et-traditions-populaires-dolargues/', lat: 43.6060, lng: 2.9304 },
  { commune: 'OLARGUES', nom: 'CENTRE CEBENNA', categorie: 'Centre d\'Interprétation (Cévennes)', adresse: 'Rue de la Vierge, 34390 Olargues', url: 'https://www.parc-haut-languedoc.fr/equipement/centre-cebenna/', lat: 43.6062, lng: 2.9300 },
  { commune: 'OLONZAC', nom: 'CENTRE DE RECHERCHE ET DE DOCUMENTATION DU MINERVOIS', categorie: 'Recherche / Documentation (Minervois)', adresse: '31, Avenue d\'Homps, 34210 Olonzac', url: 'https://www.olonzac.fr/crpm/', lat: 43.2750, lng: 2.7592 },
  { commune: 'PEZENAS', nom: 'MUSÉE DE LA PORTE ET DE LA FERRONNERIE', categorie: 'Musée thématique (Artisanat)', adresse: '10, Rue Montmorency, 34120 Pézenas', url: 'https://www.ville-pezenas.fr/decouvrir/musee-de-la-porte-et-de-la-ferronnerie/', lat: 43.4619, lng: 3.4245 },
  { commune: 'PEZENAS', nom: 'MUSÉE DE VULLIOD-SAINT-GERMAIN', categorie: 'Art / Histoire Locale', adresse: '3, rue Albert Paul Alliès, 34120 Pézenas', url: 'https://www.ville-pezenas.fr/decouvrir/musee-de-vulliod-saint-germain/', lat: 43.4608, lng: 3.4240 },
  { commune: 'PEZENAS', nom: 'MUSÉE INTERNATIONAL DU JOUET', categorie: 'Musée thématique (Jouets)', adresse: '13, Rue de la Foire, 34120 Pézenas', url: 'https://www.museeinternationaldujouet.fr', lat: 43.4615, lng: 3.4248 },
  { commune: 'PEZENAS', nom: 'L\'A-MUSÉE BOBY LAPOINTE', categorie: 'Musée Mémoriel (Artiste)', adresse: 'Place Gambetta, 34120 Pézenas', url: 'https://bobylapointe.fr/l\'a-musée', lat: 43.4612, lng: 3.4235 },
  { commune: 'PORTIRAGNES', nom: 'MUSEE ARCHÉOLOGIQUE JEAN SALUSTE', categorie: 'Archéologie', adresse: 'Espace Culturel, 34420 Portiragnes', url: 'https://www.portiragnes.fr/culture-patrimoine/musee-archeologique-jean-saluste/', lat: 43.3101, lng: 3.3283 },
  { commune: 'PUISSERGUIER', nom: 'ECOMUSÉE DE LA VIE D\'AUTREFOIS', categorie: 'Écomusée / Vie Rurale', adresse: 'Avenue de la Résistance, 34620 Puisserguier', url: 'https://www.herault-tourisme.com/fiche/ecomusee-de-la-vie-dautrefois-puisserguier/', lat: 43.3105, lng: 3.0188 },
  { commune: 'QUARANTE', nom: 'MUSÉE ARCHÉOLOGIQUE DE QUARANTE', categorie: 'Archéologie', adresse: 'Place de la Mairie, 34310 Quarante', url: 'https://www.quarante.fr/site/associations/musee-archeologique-de-quarante', lat: 43.3444, lng: 2.9930 },
  { commune: 'SAINT-GERVAIS-SUR-MARE', nom: 'MAISON CÉVENOLE DES ARTS ET TRADITIONS POPULAIRES', categorie: 'Arts & Traditions Populaires', adresse: '11, Avenue de la Gare, 34610 Saint-Gervais-sur-Mare', url: 'https://www.herault-tourisme.com/fiche/maison-cevenole-des-arts-et-traditions-populaires-saint-gervais-sur-mare/', lat: 43.6496, lng: 3.0305 },
  { commune: 'SAINT-PONS-DE-THOMIERES', nom: 'MUSEE DE PREHISTOIRE REGIONALE', categorie: 'Préhistoire / Archéologie', adresse: 'Place du Foirail, 34220 Saint-Pons-de-Thomières', url: 'https://www.museeprehistoire.com', lat: 43.4938, lng: 2.7601 },
  { commune: 'SERIGNAN', nom: 'MUSÉE RÉGIONAL D\'ART CONTEMPORAIN OCCITANIE / PYRÉNÉES-MÉDITERRANÉE', categorie: 'Art Contemporain (MRAC)', adresse: '146, Avenue de la Plage, 34410 Sérignan', url: 'https://mrac.laregion.fr', lat: 43.2842, lng: 3.3195 },
  { commune: 'SERVIAN', nom: 'MUSÉE DE LA DISTILLERIE ET DE L\'ECURIE', categorie: 'Musée thématique (Distillerie / Vie rurale)', adresse: 'Ancienne Distillerie, 34290 Servian', url: 'https://www.herault-tourisme.com/fiche/musee-de-la-distillerie-et-de-lecurie-servian/', lat: 43.4111, lng: 3.2985 },
  { commune: 'VALRAS-PLAGE', nom: 'LE PALAIS DE LA MAQUETTE - MUSÉE DU JOUET', categorie: 'Musée thématique (Maquettes / Jouets)', adresse: 'Avenue de l\'Épargne, 34350 Valras-Plage', url: 'http://www.palaisdelamaquette.fr', lat: 43.2505, lng: 3.2858 },
  { commune: 'VIAS', nom: 'MAISON DU PATRIMOINE', categorie: 'Patrimoine Local', adresse: 'Rue de la Promenade, 34450 Vias', url: 'https://www.vias-mediterranee.fr/maison-du-patrimoine/', lat: 43.3240, lng: 3.4168 },
  { commune: 'VILLEMAGNE-L\'ARGENTIERE', nom: 'MUSÉE SAINT-GRÉGOIRE', categorie: 'Art Sacré / Histoire Locale', adresse: 'Rue du Prieuré, 34600 Villemagne-l\'Argentière', url: 'https://www.herault-tourisme.com/fiche/musee-saint-gregoire-villemagne-largentiere/', lat: 43.5960, lng: 3.1250 },
];

export async function GET() {
  return NextResponse.json(museesHerault);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseeHerault;
