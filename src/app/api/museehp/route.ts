// src/app/api/museehp/route.ts
import { NextResponse } from 'next/server';

export interface MuseeHP {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; 
  lng: number; 
}

const museesHP: MuseeHP[] = [
  // Sites précédents (mis à jour si adresses précises fournies)
  { commune: 'Argelès-Gazost', nom: 'Musée montagnard du Lavedan', adresse: '65400 Argelès-Gazost', categorie: 'Patrimoine/Histoire', url: 'https://www.argeles-gazost.com/musee-montagnard-du-lavedan-visiter-argeles-gazost/', lat: 43.0030, lng: -0.1010 },
  { commune: 'Arras-en-Lavedan', nom: 'L\'Abbadiale d\'Arras-en-Lavedan', adresse: '1 Rue du Gabizos, 65400 Arras-en-Lavedan', categorie: 'Patrimoine/Religion', url: 'https://www.abbadiale.fr/', lat: 43.0080, lng: -0.0900 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Musée des Beaux-Arts Salies', adresse: 'Place des Thermes, 65200 Bagnères-de-Bigorre', categorie: 'Art', url: 'http://museesalies.fr/', lat: 43.0640, lng: 0.1450 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Muséum et Musée du marbre', adresse: 'Rue du Musée, 65200 Bagnères-de-Bigorre', categorie: 'Nature/Patrimoine', url: 'https://www.musees-midi-pyrenees.fr/musees/musee-du-marbre-et-du-museum/', lat: 43.0650, lng: 0.1460 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Musée Bigourdan du Vieux Moulin', adresse: 'Rue Hount-Blanque, 65200 Bagnères-de-Bigorre', categorie: 'Patrimoine/Histoire', url: 'http://www.museedefrance.fr/musee-bigourdan-du-vieux-moulin/', lat: 43.0660, lng: 0.1470 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Muséum d\'Histoire Naturelle de Bagnères de Bigorre', adresse: 'Rue du Musée, 65200 Bagnères-de-Bigorre', categorie: 'Nature', url: 'http://www.museum-bagneres.com/', lat: 43.0650, lng: 0.1460 },
  { commune: 'Campan', nom: 'Carrière de marbre', adresse: '65710 Campan', categorie: 'Industrie/Patrimoine', url: 'https://www.campan.fr/musee/', lat: 43.0000, lng: 0.2000 },
  { commune: 'Cauterets', nom: 'Musée 1900', adresse: 'Place Georges Clemenceau, 65110 Cauterets', categorie: 'Patrimoine/Histoire', url: 'https://www.musee1900-cauterets.com/', lat: 42.8880, lng: -0.1130 },
  { commune: 'Gèdre', nom: 'Musée Millaris', adresse: '65120 Gèdre', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-occitanie.com/musee-millaris/gedre/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d9/detail.aspx', lat: 42.7560, lng: 0.0050 },
  { commune: 'La Mongie', nom: 'Musée Salies des collections et beaux arts (Voir Bagnères)', adresse: '65200 La Mongie', categorie: 'Art/Patrimoine', url: 'http://museesalies.fr/', lat: 42.9240, lng: 0.2130 },
  { commune: 'Beaudéan', nom: 'Epicerie d\'autrefois Chez Gabrielle', adresse: '349 Place de L\'église, 65710 Beaudéan', categorie: 'Patrimoine', url: 'https://www.tourisme-hautes-pyrenees.com/offre/fiche/epicerie-d-autrefois-chez-gabrielle/PCUMID065FS0002Q', lat: 43.0030, lng: 0.1760 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Museum d\'histoire naturelle (Voir Bagnères)', adresse: '65200 Bagnères-de-Bigorre', categorie: 'Nature', url: 'http://www.museum-bagneres.com/', lat: 43.0650, lng: 0.1460 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Musée de la vie quotidienne dans les Pyrénées', adresse: '7 boulevard Rolland Castells, 65200 Bagnères-de-Bigorre', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-hautes-pyrenees.com/offre/fiche/musee-de-la-vie-quotidienne-dans-les-pyrenees/PCUMIP065V500SO2', lat: 43.0600, lng: 0.1400 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Musée Larrey', adresse: '65200 Bagnères-de-Bigorre', categorie: 'Histoire', url: 'http://musee-larrey.fr/', lat: 43.0590, lng: 0.1410 },
  { commune: 'La Mongie', nom: 'Espace des expériences du Pic du Midi de Bigorre', adresse: '65200 La Mongie (sommet du Pic)', categorie: 'Science', url: 'https://www.picdumidi.com/', lat: 42.9360, lng: 0.1450 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Carrefour des patrimoines', adresse: '65200 Bagnères-de-Bigorre', categorie: 'Patrimoine', url: 'https://carrefourdespatrimoines.fr/', lat: 43.0605, lng: 0.1415 },
  { commune: 'Aste', nom: 'Maison des Ferrère et baroque pyrénéen', adresse: '16, rue de l\'église, 65200 Aste', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-hautes-pyrenees.com/offre/fiche/maison-des-ferrere-et-du-baroque-pyreneen/PCUMID065FS0003B', lat: 43.0010, lng: 0.1340 },
  { commune: 'Les Côteaux', nom: 'Musée du feu des sapeurs-pompiers', adresse: '65360 Les Côteaux', categorie: 'Industrie/Histoire', url: 'http://www.amicale-pompiers-ossun.com/musee.html', lat: 43.3440, lng: 0.0570 },
  { commune: 'Monléon-Magnoac', nom: 'Notre Dame de Garaison', adresse: '65160 Monléon-Magnoac (Garaison)', categorie: 'Patrimoine/Religion', url: 'https://www.garaison.com/', lat: 43.3280, lng: 0.5400 },
  { commune: 'Labatut-Rivière', nom: 'Mémoire des deux guerres en Sud-Ouest', adresse: '65700 Labatut-Rivière', categorie: 'Histoire', url: 'https://www.tourisme-occitanie.com/memoire-des-deux-guerres-en-sud-ouest/labatut-riviere/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa430b/detail.aspx', lat: 43.5350, lng: 0.0550 },
  { commune: 'Maubourguet', nom: 'Musée archéologique du Val d\'Adour (Musée archéologique de Maubourguet)', adresse: '140 Allées Larbanès, 65700 Maubourguet', categorie: 'Patrimoine/Archéologie', url: 'https://www.coeursudouest-tourisme.com/mes-envies/remonter-le-temps/musee-archeologique-de-maubourguet/', lat: 43.5650, lng: -0.0200 }, // MAJ adresse/URL/coordonnées
  { commune: 'Lourdes', nom: 'Musée Pyrénéen de Lourdes (Château Fort)', adresse: 'Château Fort de Lourdes, 65100 Lourdes', categorie: 'Patrimoine/Histoire', url: 'http://www.lourdes-chateaufort.com/', lat: 43.1000, lng: -0.0460 },
  { commune: 'Lourdes', nom: 'Maison paternelle de Sainte-Bernadette Moulin Lacade', adresse: '16 Rue Bernadette Soubirous, 65100 Lourdes', categorie: 'Patrimoine/Religion', url: 'https://www.lourdes-infotourisme.com/moulin-lacade-maison-natale-de-sainte-bernadette/', lat: 43.0970, lng: -0.0520 },
  { commune: 'Lourdes', nom: 'Musée du vélo', adresse: '65100 Lourdes', categorie: 'Sport/Patrimoine', url: 'https://www.museeduvello.com/', lat: 43.0980, lng: -0.0500 },
  { commune: 'Lourdes', nom: 'Le Petit Lourdes', adresse: '65100 Lourdes', categorie: 'Patrimoine/Loisirs', url: 'https://www.lepetitlourdes.com/', lat: 43.1020, lng: -0.0480 },
  { commune: 'Adé', nom: 'La féerie des eaux', adresse: '70 Rue de Lassalle, 65100 Adé', categorie: 'Loisirs', url: 'https://www.guide-toulouse-pyrenees.com/fr/tourisme/decouvrir/sites-touristiques/jardins-parcs/ade-923/la-feerie-des-eaux-1499.html', lat: 43.1500, lng: -0.0500 },
  { commune: 'Lourdes', nom: 'Musée Christhi', adresse: '24, Rue de la Grotte, 65100 Lourdes', categorie: 'Histoire/Religion', url: 'https://www.tourism-lourdes.com/fr/sites-touristiques-lourdes/musees/le-musee-christi.html', lat: 43.0995, lng: -0.0470 },
  { commune: 'Lourdes', nom: 'Le Cachot', adresse: 'Rue des Petits Fossés, 65100 Lourdes', categorie: 'Religion', url: 'https://www.lourdes-infotourisme.com/le-cachot-maison-natale-de-sainte-bernadette/', lat: 43.0985, lng: -0.0485 },
  { commune: 'Lourdes', nom: 'Hospice Sainte-Bernadette', adresse: '2 Av. Alexandre Marqui, 65100 Lourdes', categorie: 'Religion', url: 'https://www.lourdes-infotourisme.com/offres/hospice-sainte-bernadette-lourdes-fr-3152360/', lat: 43.0990, lng: -0.0480 },
  { commune: 'Lourdes', nom: 'Musée de cire', adresse: '8 Avenue du Paradis, 65100 Lourdes', categorie: 'Art/Loisirs', url: 'http://www.musee-cire-lourdes.com/', lat: 43.0980, lng: -0.0475 },
  { commune: 'Lourdes', nom: 'Musée Sainte-Bernadette', adresse: '93 Bd Rémi Sempé, 65100 Lourdes', categorie: 'Religion', url: 'https://www.lourdes-infotourisme.com/offres/musee-sainte-bernadette-lourdes-fr-3152355/', lat: 43.0992, lng: -0.0478 },
  { commune: 'Lourdes', nom: 'Château-fort et musée pyrénéen de Lourdes', adresse: '65100 Lourdes', categorie: 'Patrimoine/Histoire', url: 'http://www.lourdes-chateaufort.com/', lat: 43.1000, lng: -0.0460 },
  { commune: 'Lourdes', nom: 'Basilique de l\'Immaculée-Conception', adresse: '65100 Lourdes (Sanctuaire)', categorie: 'Religion', url: 'https://www.lourdes-france.org/', lat: 43.0980, lng: -0.0550 },
  { commune: 'Lourdes', nom: 'Basilique souterraine Saint-Pie X', adresse: '65100 Lourdes (Sanctuaire)', categorie: 'Religion', url: 'https://www.lourdes-france.org/', lat: 43.0975, lng: -0.0555 },
  { commune: 'Lourdes', nom: 'Crypte du sanctuaire de Lourdes', adresse: '65100 Lourdes (Sanctuaire)', categorie: 'Religion', url: 'https://www.lourdes-france.org/', lat: 43.0970, lng: -0.0550 },
  { commune: 'Lourdes', nom: 'Eglise du Sacré-Coeur de Lourdes', adresse: '65100 Lourdes', categorie: 'Religion', url: '', lat: 43.0965, lng: -0.0490 },
  { commune: 'Lourdes', nom: 'Basilique Notre-Dame du Rosaire de Lourdes', adresse: '65100 Lourdes (Sanctuaire)', categorie: 'Religion', url: 'https://www.lourdes-france.org/', lat: 43.0960, lng: -0.0560 },
  { commune: 'Lourdes', nom: 'Église Sainte-Bernadette de Lourdes', adresse: '65100 Lourdes (Sanctuaire)', categorie: 'Religion', url: 'https://www.lourdes-france.org/', lat: 43.0955, lng: -0.0565 },
  { commune: 'Lourdes', nom: 'Musée de la Nativité de Lourdes', adresse: '21 Quai Saint-Jean, 65100 Lourdes', categorie: 'Art/Religion', url: 'https://www.tourism-lourdes.com/fr/sites-touristiques-lourdes/musees/le-musee-de-la-nativite.html', lat: 43.0950, lng: -0.0450 },
  { commune: 'Luz-Saint-Sauveur', nom: 'Musée du Trésor de Luz-Saint-Sauveur', adresse: 'Église Saint-Martin, place de la Comporte, 65120 Luz-Saint-Sauveur', categorie: 'Art/Religion', url: 'http://www.luz.org/', lat: 42.8710, lng: 0.0005 },
  { commune: 'Luz-Saint-Sauveur', nom: 'Espace muséographique de Luz-Saint-Sauveur (Maison de la Vallée)', adresse: '24, Place Saint Clément, 65120 LUZ-SAINT-SAUVEUR', categorie: 'Écomusée/Culture', url: 'http://www.maisondelavallee.org', lat: 42.8705, lng: 0.0010 },
  { commune: 'Esterre', nom: 'Château Sainte-Marie de Luz-Saint-Sauveur', adresse: 'À Esterre, 65120 Luz-Saint-Sauveur', categorie: 'Patrimoine/Château', url: 'https://www.valleesdegavarnie.com/visites-patrimoine/chateau-sainte-marie/', lat: 42.8800, lng: -0.0020 },
  { commune: 'Mauléon-Barousse', nom: 'Maison des Sources à Mauléon-Barousse', adresse: 'Lieu-dit La Gourdiole, 65370 Mauléon-Barousse', categorie: 'Écomusée/Nature', url: 'https://www.maisondessources.net/', lat: 43.0450, lng: 0.6000 },
  { commune: 'Mauvezin', nom: 'Château de Mauvezin', adresse: '20 Rue du Château, 65130 MAUVEZIN', categorie: 'Patrimoine/Château', url: 'https://www.chateaudemauvezin.com', lat: 43.1600, lng: 0.2830 },
  { commune: 'Neste-Baronnies', nom: 'Ecomusée aux fils du Moyen-Age', adresse: '65130 Neste-Baronnies', categorie: 'Musée/Culture', url: '', lat: 43.1500, lng: 0.3000 }, // Information non trouvée, localisation générale
  { commune: 'Capvern', nom: 'La Maison des Cailloux - Marbrerie des Pyrénées', adresse: '4820 Route de Tarbes, 65130 CAPVERN', categorie: 'Industrie/Artisanat', url: 'https://www.lamaisondescailloux.com/fr/', lat: 43.1000, lng: 0.3000 },
  { commune: 'Bonnemazon', nom: 'Abbaye de L\'Escaladieu', adresse: 'Route de Bagnères de Bigorre, 65130 BONNEMAZON', categorie: 'Patrimoine/Abbaye', url: 'http://www.abbaye-escaladieu.com/', lat: 43.1550, lng: 0.3050 },
  { commune: 'Saint-Lary-Soulan', nom: 'Maison du patrimoine de Saint-Lary-Soulan', adresse: '41 rue Vincent Mir, Place de l\'Office de Tourisme, 65170 Saint-Lary-Soulan', categorie: 'Patrimoine/Culture', url: 'https://www.saintlary.com/hiver/a-faire-sur-place/bouger/visites-et-patrimoine/la-maison-du-patrimoine/', lat: 42.8220, lng: 0.3300 },
  { commune: 'Saint-Sever-de-Rustan', nom: 'Abbaye de Saint-Sever-de-Rustan', adresse: 'Place d\'Espagne, 65140 Saint-Sever-de-Rustan', categorie: 'Patrimoine/Abbaye', url: 'https://www.groupe-sos.org/structure/abbaye-de-saint-sever-de-rustan/', lat: 43.3300, lng: 0.1700 },
  { commune: 'Bagnères-de-Bigorre', nom: 'Musée du marbre de Salut (Vallon de Salut)', adresse: '4 Rue Jean Rösch, Vallon de Salut, 65200 Bagnères-de-Bigorre', categorie: 'Musée/Histoire', url: 'https://www.ville-bagneresdebigorre.fr/musees', lat: 43.0600, lng: 0.1350 },
  { commune: 'Tarbes', nom: 'Musée Massey des Hussards à Tarbes', adresse: '1 rue Achille Jubinal, 65000 Tarbes', categorie: 'Musée', url: 'https://musee-massey.com/', lat: 43.2370, lng: 0.0810 },
  { commune: 'Tarbes', nom: 'Musée de la déportation et de la résistance', adresse: '63 rue Georges-Lassalle, 65000 Tarbes', categorie: 'Musée/Histoire', url: 'https://www.cheminsdememoire.gouv.fr/fr/musee-de-la-deportation-et-de-la-resistance-de-tarbes-et-des-hautes-pyrenees-0', lat: 43.2380, lng: 0.0820 },
  { commune: 'Tarbes', nom: 'Musée Jean-Marie Daureu des pompiers', adresse: '4 rue Charles Bequignon, Site de l\'Arsenal, 65000 TARBES', categorie: 'Musée', url: 'http://museedespompiersdetarbes.com/', lat: 43.2390, lng: 0.0830 },
  { commune: 'Tarbes', nom: 'Haras de Tarbes', adresse: '68 rue du Régiment de Bigorre, 65000 TARBES', categorie: 'Patrimoine/Équestre', url: 'https://www.tarbes.fr/mon-quotidien/ville-verte/parcs-et-jardins/haras-de-tarbes-2/', lat: 43.2300, lng: 0.0750 },
  { commune: 'Vielle-Adour', nom: 'La Brèche aux loups', adresse: '13 rue du Moulin, 65360 Vielle-Adour', categorie: 'Musée/Nature', url: 'https://www.gralon.net/tourisme/a-visiter/info-la-breche-aux-loups-vielle-adour-7361.htm', lat: 43.1900, lng: 0.1200 },
  { commune: 'Tarbes', nom: 'Maison natale du Maréchal Foch', adresse: '2 rue de la Victoire, 65000 TARBES', categorie: 'Musée/Histoire', url: 'https://www.tarbes.fr/mes-loisirs/tarbes-culture/maison-natale-du-marechal-foch/', lat: 43.2360, lng: 0.0790 },
  { commune: 'Tarbes', nom: 'Le Carmel', adresse: '14 rue Théophile Gautier, 65000 Tarbes', categorie: 'Culture/Art', url: 'https://www.musees-tarbes.fr/les-musees/le-carmel/', lat: 43.2350, lng: 0.0780 },
  { commune: 'Ibos', nom: 'Collégiale d\'Ibos', adresse: 'Place de verdun, 65420 IBOS', categorie: 'Patrimoine/Religion', url: 'http://www.collegiale-ibos.fr', lat: 43.2200, lng: 0.0250 },
  { commune: 'Arreau', nom: 'Musée des Cagots', adresse: 'Château des Nestes, 1 rue Saint-Exupère, 65240 ARREAU', categorie: 'Musée/Histoire', url: 'https://www.tourisme-hautes-pyrenees.com/offre/fiche/musee-des-cagots/PCUMIP065V5007CO', lat: 42.9000, lng: 0.3600 },
  { commune: 'Ancizan', nom: 'Musée de la Cidrerie', adresse: 'Rue de l\'Arbizon, 65440 ANCIZAN', categorie: 'Musée/Gastronomie', url: 'https://www.guide-toulouse-pyrenees.com/fr/tourisme/decouvrir/sites-touristiques/musees/ancizan-927/musee-de-la-cidrerie-1359.html', lat: 42.9200, lng: 0.3650 },
  { commune: 'Azet', nom: 'Maison pyrénéenne du pastoralisme', adresse: 'Mairie, 65170 AZET', categorie: 'Écomusée/Culture', url: 'http://www.pastoralisme.fr/', lat: 42.8250, lng: 0.3450 },
  { commune: 'Saint-Lary-Soulan', nom: 'Maison de l\'Ours', adresse: 'Rue Corps Franc Pommiès, 65170 Saint-Lary-Soulan', categorie: 'Musée/Nature', url: 'https://www.travelski.com/station-de-ski/saint-lary-soulan/visites/93-la-maison-de-l-ours', lat: 42.8210, lng: 0.3290 },
  { commune: 'Saint-Lary-Soulan', nom: 'Maison du Parc National des Pyrénées', adresse: 'Tour d\'Agut Place de la Mairie, 65170 Saint-Lary-Soulan', categorie: 'Musée/Nature', url: 'http://www.pyrenees-parcnational.fr/fr', lat: 42.8230, lng: 0.3310 },
  { commune: 'Sarrancolin', nom: 'Filature de la Vallée d\'Aure', adresse: '9 rue sainte quitterie, 65410 SARRANCOLIN', categorie: 'Artisanat/Histoire', url: 'https://www.pyrenees2vallees.com/commerces-et-services/boutiques-produits-locaux/la-filature', lat: 42.9500, lng: 0.3800 },
  { commune: 'Arreau', nom: 'Château de Nestes', adresse: '1, rue Saint-Exupère, 65240 ARREAU', categorie: 'Patrimoine/Château', url: 'https://www.tourisme-hautes-pyrenees.com/offre/fiche/chateau-des-nestes/PCUMIP065V5001LL', lat: 42.9000, lng: 0.3600 },
  { commune: 'Loudenvielle', nom: 'Espace muséographique Arixo', adresse: 'Chemin de Cazalis, 65510 LOUDENVIELLE', categorie: 'Musée/Culture', url: 'https://www.vallee-du-louron.com/fr/patrimoine-culturel/espace-museographique-arixo', lat: 42.8500, lng: 0.4400 },
  { commune: 'Loudenvielle', nom: 'Moulin de Saoussas', adresse: 'Chemin de Saoussas, 65510 Loudenvielle', categorie: 'Patrimoine/Technique', url: 'http://www.moulindesaoussas.com', lat: 42.8510, lng: 0.4410 },
];

export async function GET() {
  return NextResponse.json(museesHP);
}

export type Musee = MuseeHP;
