// src/app/api/museepo/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseePO {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données complètes des musées avec des coordonnées géographiques APPROXIMATIVES (à vérifier)
const museesPO: MuseePO[] = [
  { commune: 'Amélie-les-Bains', nom: 'Musée des Arts et Traditions Populaires', categorie: 'Arts & Traditions Populaires', adresse: 'Place du 8 Mai 1945, 66110 Amélie-les-Bains', url: 'https://www.amelie-les-bains.com/musee-arts-et-traditions-populaires', lat: 42.4746, lng: 2.6713 },
  { commune: 'Amélie-les-Bains', nom: 'Musée de la Poste', categorie: 'Musée thématique (Histoire de la Poste)', adresse: '2, avenue du Vallespir, 66110 Amélie-les-Bains', url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-de-la-poste-amelie-les-bains-palalda_1850785', lat: 42.4754, lng: 2.6719 },
  { commune: 'Amélie-les-Bains-Palalda', nom: 'MUSÉE AL CASAL DE PALALDA (CIAP)', categorie: "Centre d'Interprétation (Patrimoine)", adresse: 'Ancienne Mairie, 66110 Palalda', url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-al-casal-de-palalda-ciap_1850783', lat: 42.4839, lng: 2.6644 },
  { commune: 'Argelès-sur-Mer', nom: "Maison du Patrimoine Casa de l'Albera", categorie: 'Patrimoine Local', adresse: 'Rue du 14 Juillet, 66700 Argelès-sur-Mer', url: 'https://www.argeles-sur-mer.com/fr/maison-du-patrimoine-casa-de-lalbera', lat: 42.5482, lng: 3.0101 },
  { commune: 'Arles-sur-Tech', nom: 'Musée du Fer', categorie: 'Musée thématique (Métallurgie / Fer)', adresse: 'Foyer Rural, 66150 Arles-sur-Tech', url: 'https://www.pyrenees-ceret-suddefrance.com/musee-du-fer', lat: 42.4633, lng: 2.6288 },
  { commune: 'Banyuls-dels-Aspres', nom: 'Musée Vin, Vigne et Traditions au Château Montana', categorie: 'Musée thématique (Viniculture)', adresse: 'Château Montana, 66300 Banyuls-dels-Aspres', url: 'https://www.chateaux-montana.com/musee', lat: 42.5694, lng: 2.8797 },
  { commune: 'Banyuls-sur-Mer', nom: 'Musée Maillol de Banyuls-sur-Mer', categorie: 'Musée d’Art (sur Aristide Maillol)', adresse: 'Ferme de la Métairie, 66650 Banyuls-sur-Mer', url: 'https://www.museemaillol.com/banyuls-sur-mer', lat: 42.4578, lng: 3.1042 },
  { commune: 'Bélesta', nom: 'Château-musée de Préhistoire de Bélesta', categorie: 'Musée Archéologique / Préhistoire', adresse: 'D612, 66720 Bélesta', url: 'http://www.chateau-belesta.com', lat: 42.7483, lng: 2.6027 },
  { commune: 'Cases-de-Pène', nom: "Jau / Espace d'Art Contemporain", categorie: 'Art Contemporain', adresse: 'Château de Jau, Route de Cases de Pène, 66600 Cases-de-Pène', url: 'https://www.chateaudejau.com/espace-art-contemporain', lat: 42.7667, lng: 2.8020 },
  { commune: 'Le Boulou', nom: "MAISON DE L'EAU ET DE LA MÉDITERRANÉE", categorie: "Centre d'Interprétation (Eau et Nature)", adresse: '1, Avenue de la Mède, 66160 Le Boulou', url: 'https://www.tourisme-leboulou.fr/maison-de-leau-et-de-la-mediterranee-le-boulou', lat: 42.5458, lng: 2.8396 },
  { commune: 'Céret', nom: 'Musée d’Art moderne de Céret', categorie: 'Art Moderne (Label Musée de France)', adresse: '8, Boulevard Maréchal Joffre, 66400 Céret', url: 'https://www.musee-ceret.fr', lat: 42.4862, lng: 2.7483 },
  { commune: 'Céret', nom: 'Musée des Instruments de Céret', categorie: 'Instruments de Musique', adresse: '1, Carrer Sant Ferréol, 66400 Céret', url: 'https://www.ceret-tourisme.fr/musee-des-instruments-ceret', lat: 42.4866, lng: 2.7480 },
  { commune: 'Céret', nom: 'Maison du patrimoine Françoise-Claustre', categorie: 'Musée Archéologique / Patrimoine', adresse: '10, Carrer Saint-Ferréol, 66400 Céret', url: 'https://www.ceret-tourisme.fr/maison-du-patrimoine', lat: 42.4866, lng: 2.7479 },
  { commune: 'Collioure', nom: 'Musée d’Art moderne de Collioure', categorie: 'Art Moderne / Régional', adresse: 'Rue de la Démocratie, 66190 Collioure', url: 'https://www.collioure.com/musee-dart-moderne', lat: 42.5255, lng: 3.0827 },
  { commune: 'Dorres', nom: 'Musée du granit à Dorres', categorie: 'Musée thématique (Granit / Tailleurs de pierre)', adresse: "1, Place de l'Église, 66760 Dorres", url: 'https://www.pyrenees-catalanes.net/musee-du-granit-dorres', lat: 42.4645, lng: 1.9442 },
  { commune: 'Elne', nom: 'Musée Étienne-Terrus', categorie: "Musée d'Art (sur Étienne Terrus)", adresse: 'Rue du Musée, 66200 Elne', url: 'https://www.ville-elne.fr/le-musee-etienne-terrus', lat: 42.6019, lng: 3.0039 },
  { commune: 'Escaro', nom: 'Musée de la mine d’Escaro-Aytua', categorie: 'Musée thématique (Mine)', adresse: '66500 Escaro', url: 'https://www.pyrenees-orientales.fr/fiche/musee-de-la-mine-descaro-aytua', lat: 42.5694, lng: 2.3789 },
  { commune: 'Ille-sur-Têt', nom: 'Hospici d’Illa', categorie: 'Art Roman et Sacré (Ancien Hospice)', adresse: "3, Rue de l'Hospice, 66130 Ille-sur-Têt", url: 'https://www.pyrenees-orientales.fr/fiche/hospici-d-illa-ille-sur-tet', lat: 42.6710, lng: 2.6277 },
  { commune: 'Ille-sur-Têt', nom: 'Musée du Sapeur-pompier', categorie: 'Musée thématique (Sapeurs-pompiers)', adresse: '2, Carrer de la Mare de Déu del Remei, 66130 Ille-sur-Têt', url: 'https://www.illesurfet.com/musee-sapeur-pompier', lat: 42.6705, lng: 2.6270 },
  { commune: 'Maureillas-Las-Illas', nom: 'Musée du Liège et du Bouchon', categorie: 'Musée thématique (Liège / Bouchon)', adresse: "2, Carrer de l'Église, 66480 Maureillas-Las-Illas", url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-du-liege-et-du-bouchon_1850787', lat: 42.5029, lng: 2.8099 },
  { commune: 'Mont-Louis', nom: 'FOUR SOLAIRE DE MONT-LOUIS', categorie: "Centre d'Interprétation (Énergie Solaire)", adresse: 'Cité Vauban, 66210 Mont-Louis', url: 'http://www.four-solaire-mont-louis.com', lat: 42.7937, lng: 2.1243 },
  { commune: 'Montferrer', nom: 'Musée des Trabucayres', categorie: 'Musée thématique (Brigandage)', adresse: 'Place de la Mairie, 66150 Montferrer', url: 'https://www.vallespir-tourisme.fr/fr/fiche/musee-des-trabucayres-montferrer_1850789', lat: 42.4549, lng: 2.6517 },
  { commune: 'Nyer', nom: 'MAISON DE LA RESERVE DE NYER', categorie: "Centre d'Interprétation (Réserve Naturelle)", adresse: '66360 Nyer', url: 'https://www.catalanes.fr/maison-de-la-reserve-de-nyer', lat: 42.5517, lng: 2.2789 },
  { commune: 'Passa', nom: 'Musée-théâtre l’Odyssée du Vigneron', categorie: 'Musée-Théâtre (Vigne et Vin)', adresse: 'Château-Musée, 66300 Passa', url: 'https://www.sudcanigo-tourisme.fr/fr/fiche/musee-theatre-lodyssee-du-vigneron_TFOPCULAR066FS0004Y', lat: 42.6180, lng: 2.8020 },
  { commune: 'Perpignan', nom: 'Centre d’art contemporain Walter-Benjamin', categorie: 'Art Contemporain (Actuellement Fermé)', adresse: 'Ancien Couvent des Minimes, Rue Rabelais, 66000 Perpignan', url: 'N/A - Actuellement fermé', lat: 42.6994, lng: 2.9006 },
  { commune: 'Perpignan', nom: 'Musée catalan des arts et traditions populaires au Castillet (Casa Pairal)', categorie: 'Arts & Traditions Populaires (Label Musée de France)', adresse: 'Place de la Victoire, 66000 Perpignan', url: 'https://www.mairie-perpignan.fr/equipements/casa-pairal-musee-catalan-arts-traditions-populaires-castillet', lat: 42.7014, lng: 2.8947 },
  { commune: 'Perpignan', nom: 'Muséum d’histoire naturelle de Perpignan', categorie: 'Histoire Naturelle (Label Musée de France)', adresse: '12, rue Fontaine Neuve, 66000 Perpignan', url: 'https://www.mairie-perpignan.fr/equipements/museum-histoire-naturelle', lat: 42.6972, lng: 2.8997 },
  { commune: 'Perpignan', nom: 'Musée Hyacinthe-Rigaud', categorie: 'Beaux-Arts (Label Musée de France)', adresse: "16, rue de l'Ange, 66000 Perpignan", url: 'https://www.musee-rigaud.fr', lat: 42.7005, lng: 2.8944 },
  { commune: 'Perpignan', nom: 'Musée des monnaies et médailles Joseph-Puig', categorie: 'Numismatique (Label Musée de France)', adresse: 'Hôtel Pams, Rue Émile Zola, 66000 Perpignan', url: 'https://www.mairie-perpignan.fr/equipements/musee-monnaies-medailles-joseph-puig', lat: 42.6983, lng: 2.8995 },
  { commune: 'Perpignan', nom: 'Musée des Poupées Bella', categorie: 'Musée thématique (Jouets)', adresse: '11, Avenue Julien Panchot, 66000 Perpignan', url: 'https://www.perpignantourisme.com/musee-des-poupees-bella', lat: 42.7061, lng: 2.9056 },
  { commune: 'Perpignan', nom: 'MAISON DE LA CATALANITE', categorie: "Centre d'Interprétation (Culture Catalane)", adresse: '14, Rue des Amours, 66000 Perpignan', url: 'https://www.maison-de-la-catalanite.org', lat: 42.7011, lng: 2.8950 },
  { commune: 'Perpignan', nom: 'LE COUVENT SAINTE-CLAIRE', categorie: "Lieu d'Exposition / Patrimoine", adresse: '1 Rue du Général Derroja, 66000 Perpignan', url: 'N/A', lat: 42.7001, lng: 2.8958 },
  { commune: 'Port-Vendres', nom: "MAISON DU SITE DE L'ANSE DE PAULILLES", categorie: "Centre d'Interprétation (Patrimoine Naturel et Industriel)", adresse: 'Anse de Paulilles, 66660 Port-Vendres', url: 'https://www.ledepartement66.fr/dossier/anse-de-paulilles', lat: 42.5036, lng: 3.1167 },
  { commune: 'Prades', nom: 'Espace Pablo Casals', categorie: 'Espace Mémoriel / Culturel', adresse: 'Place de la République, 66500 Prades', url: 'https://www.prades.com/culture/espace-pablo-casals', lat: 42.6145, lng: 2.4208 },
  { commune: 'Prades', nom: 'ESPACE MARTIN VIVES', categorie: "Espace d'Art / Mémoriel", adresse: '66500 Prades', url: 'https://www.prades.com/culture/espace-martin-vives', lat: 42.6145, lng: 2.4208 },
  { commune: 'Prats-de-Mollo-la-Preste', nom: 'LA VERNEDA CENTRE D\'INTERPRÉTATION DU PATRIMOINE (CIAP)', categorie: "Centre d'Interprétation (Patrimoine)", adresse: 'Ancienne Mairie, 66230 Prats-de-Mollo', url: 'https://www.pyrenees-ceret-suddefrance.com/la-verneda-ciap', lat: 42.4087, lng: 2.4746 },
  { commune: 'Prats-de-Mollo-la-Preste', nom: "PAYS D'ART ET D'HISTOIRE TRANSFRONTALIER LES VALLEES CATALANES DU TECH ET DU TER", categorie: "Centre d'Interprétation", adresse: '66230 Prats-de-Mollo', url: 'N/A', lat: 42.4087, lng: 2.4746 },
  { commune: 'Perpignan', nom: 'Musée Hyacinthe-Rigaud', categorie: 'Beaux-Arts (Label Musée de France)', adresse: "16, rue de l'Ange, 66000 Perpignan", url: 'https://www.musee-rigaud.fr', lat: 42.7005, lng: 2.8944 },
  { commune: 'Perpignan', nom: 'Musée des Monnaies et Médailles Joseph-Puig', categorie: 'Numismatique (Label Musée de France)', adresse: 'Hôtel Pams, Rue Émile Zola, 66000 Perpignan', url: 'https://www.mairie-perpignan.fr/equipements/musee-monnaies-medailles-joseph-puig', lat: 42.6983, lng: 2.8995 },
  { commune: 'Rivesaltes', nom: 'Mémorial du Camp de Rivesaltes', categorie: 'Mémorial / Histoire', adresse: 'Avenue Christian Bourquin, 66600 Salses-le-Château', url: 'https://www.memorialcamprivesaltes.eu', lat: 42.8090, lng: 2.9190 },
  { commune: 'Rivesaltes', nom: 'Maison natale du Maréchal Joffre', categorie: 'Musée Mémoriel (Label Maison des Illustres)', adresse: '15, rue du Maréchal Joffre, 66600 Rivesaltes', url: 'https://www.rivages-salses.com/fiche/maison-natale-du-marechal-joffre', lat: 42.7601, lng: 2.8710 },
  { commune: 'Saint-André', nom: 'Maison de l’Art roman', categorie: 'Art Roman / Patrimoine', adresse: 'Ancienne abbaye bénédictine, 66690 Saint-André', url: 'https://www.saint-andre66.fr/maison-de-lart-roman', lat: 42.5706, lng: 3.0336 },
  { commune: 'Saint-Cyprien', nom: 'Collection François-Desnoyer', categorie: 'Art (Legs du peintre)', adresse: 'Espace Grand Large, 66750 Saint-Cyprien', url: 'https://www.st-cyprien.com/collection-desnoyer', lat: 42.6074, lng: 3.0248 },
  { commune: 'Sainte-Léocadie', nom: 'Musée de Cerdagne (Cal Mateu)', categorie: 'Ethnologie et Histoire (Label Musée de France)', adresse: '66800 Sainte-Léocadie', url: 'https://www.musee-cerdagne.com', lat: 42.4497, lng: 1.9961 },
  { commune: 'Saint-Laurent-de-Cerdans', nom: 'Maison du patrimoine et de la mémoire André-Abet', categorie: 'Patrimoine et Mémoire Locale', adresse: '66260 Saint-Laurent-de-Cerdans', url: 'https://www.vallespir-tourisme.fr/fr/fiche/maison-du-patrimoine-et-de-la-memoire-andre-abet_1850786', lat: 42.3687, lng: 2.6517 },
  { commune: 'Saint-Paul-de-Fenouillet', nom: 'Église du chapitre de Saint-Paul-de-Fenouillet (Musée du Chapitre)', categorie: 'Musée multidisciplinaire', adresse: 'Rue du Chapitre, 66220 Saint-Paul-de-Fenouillet', url: 'https://www.pyrenees-orientales.fr/fiche/musee-du-chapitre', lat: 42.8091, lng: 2.5115 },
  { commune: 'Targassonne', nom: 'THEMIS SOLAIRE INNOVATION', categorie: "Centre d'Interprétation (Énergie Solaire)", adresse: 'Héliodrôme, 66120 Targassonne', url: 'https://www.pyrenees-catalanes.net/themis-solaire-innovation', lat: 42.4764, lng: 2.0306 },
  { commune: 'Tautavel', nom: 'Écomusée du miel et de l’Abeille', categorie: 'Écomusée (Thématique)', adresse: "3, rue de l'Hospice, 66720 Tautavel", url: 'https://www.tautavel.com/musee-du-miel-et-de-labeille', lat: 42.8465, lng: 2.7600 },
  { commune: 'Tautavel', nom: 'Musée de Tautavel – Centre européen de préhistoire', categorie: 'Préhistoire (Label Musée de France)', adresse: 'Avenue Léon-Jean Grégory, 66720 Tautavel', url: 'http://www.tautavel.com', lat: 42.8450, lng: 2.7562 },
  { commune: 'Thuir', nom: 'Musée des arts et traditions populaires', categorie: 'Arts & Traditions Populaires', adresse: '4, Rue du Collège, 66300 Thuir', url: 'https://www.thuir.fr/musee-des-arts-et-traditions-populaires', lat: 42.6300, lng: 2.7483 },
  { commune: 'Thuir', nom: 'CAVES BYRRH', categorie: 'Lieu historique / Musée thématique (Vins et Vermouth)', adresse: 'Boulevard Violet, 66300 Thuir', url: 'https://www.caves-byrrh.fr', lat: 42.6288, lng: 2.7475 },
  { commune: 'Vernet-les-Bains', nom: 'Musée de géologie et de paléontologie', categorie: 'Géologie et Paléontologie', adresse: 'Maison de la Nature, 66820 Vernet-les-Bains', url: 'https://www.tourisme-canigou.com/musee-geologie-paleontologie', lat: 42.5638, lng: 2.3878 },
];

export async function GET() {
  return NextResponse.json(museesPO);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseePO;
