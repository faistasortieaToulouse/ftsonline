// src/app/api/museetarn/route.ts
import { NextResponse } from 'next/server';

export interface MuseeTarn {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; 
  lng: number; 
}

const museesTarn: MuseeTarn[] = [
  { commune: 'Albi', nom: 'Musée Toulouse-Lautrec', categorie: 'Art', adresse: 'Palais de la Berbie, Place Sainte-Cécile, 81000 Albi', url: 'https://musee-toulouse-lautrec.fr/', lat: 43.9358, lng: 2.1408 },
  { commune: 'Albi', nom: 'Hôtel Reynès', categorie: 'Patrimoine', adresse: '16 Rue des Foissants, 81000 Albi', url: 'https://www.albi-tourisme.fr/hotel-reynes-albi-fr-2342502/', lat: 43.9350, lng: 2.1400 },
  { commune: 'Albi', nom: 'Cloître Saint-Salvi', categorie: 'Patrimoine/Religion', adresse: '81000 Albi', url: 'https://www.albi-tourisme.fr/collegiale-et-cloitre-saint-salvi-albi-fr-2342491/', lat: 43.9345, lng: 2.1450 },
  { commune: 'Albi', nom: 'Collégiale Saint-Salvi d\'Albi', categorie: 'Patrimoine/Religion', adresse: '81000 Albi', url: 'https://www.albi-tourisme.fr/collegiale-et-cloitre-saint-salvi-albi-fr-2342491/', lat: 43.9345, lng: 2.1450 },
  { commune: 'Albi', nom: 'Cathédrale Sainte-Cécile d\'Albi', categorie: 'Patrimoine/Religion', adresse: 'Place Sainte-Cécile, 81000 Albi', url: 'https://www.albi-tourisme.fr/cathedrale-sainte-cecile-albi-fr-2342484/', lat: 43.9355, lng: 2.1415 },
  { commune: 'Albi', nom: 'Musée Lapérouse', categorie: 'Patrimoine/Histoire', adresse: '41 Rue de la Fédération, 81000 Albi', url: 'https://musee-laperouse.tarn.fr/', lat: 43.9320, lng: 2.1480 },
  { commune: 'Albi', nom: 'Le L.A.I.T – centre d’art contemporain', categorie: 'Art', adresse: '28 Rue Rochegude, 81000 Albi', url: 'http://www.la-lait.com/', lat: 43.9310, lng: 2.1490 },
  { commune: 'Albi', nom: 'Musée de la Mode', categorie: 'Art/Patrimoine', adresse: '14 Rue de la Madeleine, 81000 Albi', url: 'https://musee-mode.com/', lat: 43.9330, lng: 2.1460 },
  { commune: 'Albi', nom: 'Musée pour Tous Raphaël Cordoba', categorie: 'Art/Histoire', adresse: '38 Rue de l\'Hôtel de Ville, 81000 Albi', url: 'https://www.albi-tourisme.fr/decouvrir-albi/musees/le-musee-pour-tous-raphael-cordoba/', lat: 43.9335, lng: 2.1465 },
  { commune: 'Albi', nom: 'Musée Académie des Miniatures', categorie: 'Art', adresse: '16 rue Rinaldi, 81000 ALBI', url: 'https://www.guide-tarn-aveyron.com/fr/tourisme/decouvrir/sites-touristiques/musees/albi-4/l-academie-des-miniatures-et-des-petits-gouters-859.html', lat: 43.9360, lng: 2.1380 },
  { commune: 'Ambialet', nom: 'Prieuré d’Ambialet', categorie: 'Patrimoine/Religion', adresse: '81430 Ambialet', url: 'https://www.tourisme-occitanie.com/prieure-dambialet/ambialet/tabid/37151/offreid/7298c4b1-876e-44e2-9382-36c567a5b06f/detail.aspx', lat: 43.9820, lng: 2.4500 },
  { commune: 'Andillac', nom: 'Château-musée du Cayla', categorie: 'Patrimoine/Art', adresse: '81140 Andillac', url: 'https://musee-cayla.tarn.fr/', lat: 43.9680, lng: 1.8650 },
  { commune: 'Boissezon', nom: 'Militarial Musée Mémorial pour la Paix', categorie: 'Histoire', adresse: '81490 Boissezon', url: 'https://www.tourisme-occitanie.com/militarial-musee-memorial-pour-la-paix/boissezon/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa4312/detail.aspx', lat: 43.6400, lng: 2.3000 },
  { commune: 'Brassac', nom: 'Galerie des paniers de Brassac', categorie: 'Artisanat', adresse: '81260 Brassac', url: 'https://www.tourisme-occitanie.com/galerie-des-paniers-de-brassac/brassac/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145452/detail.aspx', lat: 43.6405, lng: 2.4400 },
  { commune: 'Broze', nom: 'Musée Au Passé retrouvé', categorie: 'Patrimoine/Histoire', adresse: '85 Route de Tres Cantous, 81600 Broze', url: 'https://www.gaillac-graulhet.fr/equipements/musee-au-passe-retrouve/', lat: 43.9210, lng: 1.9350 },
  { commune: 'Broze', nom: 'Musée du Vin Invincible Vigneron', categorie: 'Industrie/Patrimoine', adresse: '81600 Broze', url: 'https://www.tourisme-occitanie.com/musee-du-vin-linvisible-vigneron/broze/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8108a4/detail.aspx', lat: 43.9215, lng: 1.9360 },
  { commune: 'Burlats', nom: 'Pavillon D’Adélaïde de Burlats', categorie: 'Patrimoine', adresse: '81100 Burlats', url: 'https://www.tourisme-occitanie.com/pavillon-dadelaide/burlats/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab66614539e/detail.aspx', lat: 43.6050, lng: 2.2900 },
  { commune: 'Burlats', nom: 'Collégiale Saint-Pierre de Burlats', categorie: 'Patrimoine/Religion', adresse: '1 Place du 8 Mai, 81100 Burlats', url: 'https://www.tourisme-tarn.com/patrimoine-culturel/la-collegiale-st-pierre/', lat: 43.6055, lng: 2.2905 },
  { commune: 'Cagnac-les-Mines', nom: 'Musée-mine départemental', categorie: 'Industrie/Histoire', adresse: '81150 Cagnac-les-Mines', url: 'https://musee-mine.tarn.fr/', lat: 44.0000, lng: 2.1400 },
  { commune: 'Carmaux', nom: 'Musée-centre d’art du verre', categorie: 'Art/Artisanat', adresse: '81400 Carmaux', url: 'https://musee-verre-carmaux.fr/', lat: 44.0480, lng: 2.1580 },
  { commune: 'Castelnau-de-Montmiral', nom: 'Château de Mayragues', categorie: 'Patrimoine', adresse: '81140 Castelnau-de-Montmiral', url: 'http://www.mayragues.fr/', lat: 43.9700, lng: 1.8300 },
  { commune: 'Castres', nom: 'Centre national et musée Jean Jaurès', categorie: 'Musée/Histoire', adresse: '2 Place Pélisson, 81100 Castres', url: 'https://www.musee-jaures.com/', lat: 43.6050, lng: 2.2400 },
  { commune: 'Castres', nom: 'Musée Goya - Musée d\'art hispanique', categorie: 'Art', adresse: '1 Rue de l\'Hôtel de ville, 81100 Castres', url: 'https://www.museegoya.fr/', lat: 43.6045, lng: 2.2410 },
  { commune: 'Castres', nom: 'Cerac Archeopole', categorie: 'Archéologie', adresse: '81100 Castres', url: 'https://www.tourisme-occitanie.com/cerac-archeopole/castres/tabid/37151/offreid/742b71fc-7b83-4a00-911e-7b71f92e2e8e/detail.aspx', lat: 43.6040, lng: 2.2420 },
  { commune: 'Castres', nom: 'Rail Miniature Castrais', categorie: 'Loisirs/Transport', adresse: '81100 Castres', url: 'http://www.rmcastrais.com/', lat: 43.6035, lng: 2.2430 },
  { commune: 'Cordes-sur-Ciel', nom: 'Musée d\'art et d\'histoire Charles-Portal', categorie: 'Patrimoine/Histoire', adresse: '81170 Cordes-sur-Ciel', url: 'https://www.tourisme-occitanie.com/musee-dart-et-dhistoire-charles-portal/cordes-sur-ciel/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b810935/detail.aspx', lat: 44.0620, lng: 1.9560 },
  { commune: 'Cordes-sur-Ciel', nom: 'Musée Saint Grégoire', categorie: 'Patrimoine/Histoire', adresse: '20 Prom. des Lices, 81170 Cordes-sur-Ciel', url: 'http://www.mamc.cordessurciel.fr/', lat: 44.0625, lng: 1.9565 },
  { commune: 'Cordes-sur-Ciel', nom: 'Musée Les Arts du Sucre et du Chocolat – Yves Thuriès', categorie: 'Artisanat/Industrie', adresse: '81170 Cordes-sur-Ciel', url: 'http://www.yvesthuries.com/musee-du-sucre-cordes-sur-ciel', lat: 44.0630, lng: 1.9570 },
  { commune: 'Cordes-sur-Ciel', nom: 'Musée d’Art Moderne et Contemporain', categorie: 'Art', adresse: '81170 Cordes-sur-Ciel', url: 'https://www.tourisme-occitanie.com/musee-dart-moderne-et-contemporain/cordes-sur-ciel/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b810934/detail.aspx', lat: 44.0635, lng: 1.9575 },
  { commune: 'Dourgne', nom: 'Abbaye Saint-Benoit d’en Calcat', categorie: 'Religion', adresse: '81110 Dourgne', url: 'https://www.encalcat.com/', lat: 43.4680, lng: 2.1400 },
  { commune: 'Dourgne', nom: 'Abbaye Sainte-Scholastique de Dourgne', categorie: 'Religion', adresse: '81110 Dourgne', url: 'https://www.tourisme-occitanie.com/abbaye-sainte-scholastique/dourgne/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b913/detail.aspx', lat: 43.4685, lng: 2.1405 },
  { commune: 'Durfort', nom: 'Musée du Cuivre', categorie: 'Industrie/Patrimoine', adresse: '81540 Durfort', url: 'https://www.tourisme-occitanie.com/musee-du-cuivre/durfort/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b72e/detail.aspx', lat: 43.4800, lng: 2.0500 },
  { commune: 'Fontrieu', nom: 'Musée du protestantisme, de la Réforme à la laïcité (Ferrières)', categorie: 'Histoire/Religion', adresse: '81260 Fontrieu (Ferrières)', url: 'https://www.musee-protestant.fr/', lat: 43.6800, lng: 2.4000 },
  { commune: 'Gaillac', nom: 'Musée de l\'Abbaye Saint-Michel de Gaillac', categorie: 'Patrimoine/Religion', adresse: '81600 Gaillac', url: 'https://www.abbaye-gaillac.com/', lat: 43.9000, lng: 1.8970 },
  { commune: 'Gaillac', nom: 'Musée des Beaux-Arts de Gaillac', categorie: 'Art', adresse: '81600 Gaillac', url: 'https://www.ville-gaillac.fr/culture/musees-et-patrimoine/musee-des-beaux-arts/', lat: 43.9005, lng: 1.8975 },
  { commune: 'Gaillac', nom: 'Muséum d’histoire naturelle Philadelphe Thomas', categorie: 'Nature', adresse: '81600 Gaillac', url: 'https://www.tourisme-occitanie.com/museum-dhistoire-naturelle-philadelphe-thomas/gaillac/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43b9/detail.aspx', lat: 43.9010, lng: 1.8980 },
  { commune: 'Gaillac', nom: 'Château de Foucaud', categorie: 'Patrimoine', adresse: '81600 Gaillac', url: 'https://www.ville-gaillac.fr/culture/musees-et-patrimoine/chateau-de-foucaud/', lat: 43.9015, lng: 1.8985 },
  { commune: 'Gaillac', nom: 'Hôtel Pierre De Brens', categorie: 'Patrimoine', adresse: 'Rue Peyriac, 81600 Gaillac', url: 'https://www.tourisme-tarn.com/patrimoine-culturel/hotel-pierre-de-brens/', lat: 43.9020, lng: 1.8990 },
  { commune: 'Giroussens', nom: 'Centre Céramique de Giroussens', categorie: 'Artisanat/Art', adresse: '81500 Giroussens', url: 'http://www.centre-ceramique.air-de-midi.fr/', lat: 43.7900, lng: 1.7600 },
  { commune: 'Graulhet', nom: 'Maison des Métiers du Cuir', categorie: 'Artisanat/Industrie', adresse: '81300 Graulhet', url: 'https://www.tourisme-occitanie.com/maison-des-metiers-du-cuir/graulhet/tabid/37151/offreid/742b71fc-7b83-4a00-911e-7b71f92e2e7b/detail.aspx', lat: 43.7650, lng: 1.9900 },
  { commune: 'Labastide-Rouairoux', nom: 'Musée départemental du Textile de Labastide-Rouairoux', categorie: 'Industrie/Histoire', adresse: '81270 Labastide-Rouairoux', url: 'https://musee-textile.tarn.fr/', lat: 43.4300, lng: 2.6000 },
  { commune: 'Labastide-Saint-Georges', nom: 'Monastère Bouddhiste « Nalanda »', categorie: 'Religion', adresse: '81500 Labastide-Saint-Georges', url: 'https://www.tourisme-occitanie.com/monastere-bouddhiste-nalanda/labastide-saint-georges/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145395/detail.aspx', lat: 43.7100, lng: 1.8300 },
  { commune: 'Labruguière', nom: 'Château Cardaillac', categorie: 'Patrimoine', adresse: '81290 Labruguière', url: 'https://www.tourisme-occitanie.com/chateau-cardaillac/labruguiere/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145464/detail.aspx', lat: 43.5500, lng: 2.2400 },
  { commune: 'Labruguière', nom: 'Espace photographique Arthur Batut', categorie: 'Art/Histoire', adresse: '81290 Labruguière', url: 'https://www.tourisme-occitanie.com/espace-photographique-arthur-batut/labruguiere/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b71d/detail.aspx', lat: 43.5505, lng: 2.2405 },
  { commune: 'Lacaune', nom: 'Musée de la fabrication du jambon de Lacaune', categorie: 'Industrie/Patrimoine', adresse: '81230 Lacaune', url: 'https://www.tourisme-lacaune.fr/', lat: 43.7000, lng: 2.7000 },
  { commune: 'Lacaune', nom: 'Miniatures de Lacaune', categorie: 'Art/Loisirs', adresse: '81230 Lacaune', url: 'https://www.tourisme-occitanie.com/miniatures-de-lacaune/lacaune/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa434e/detail.aspx', lat: 43.7005, lng: 2.7005 },
  { commune: 'Lacaune', nom: 'Filature Ramond', categorie: 'Industrie/Patrimoine', adresse: '81230 Lacaune', url: 'https://www.tourisme-occitanie.com/filature-ramond/lacaune/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa434d/detail.aspx', lat: 43.7010, lng: 2.7010 },
  { commune: 'Lacaune', nom: 'Musée du Vieux Lacaune', categorie: 'Patrimoine/Histoire', adresse: '81230 Lacaune', url: 'https://www.tourisme-lacaune.fr/', lat: 43.7015, lng: 2.7015 },
  { commune: 'Lacrouzette', nom: 'Musée Jean Cros – Minéraux et Fossiles', categorie: 'Nature/Science', adresse: '81210 Lacrouzette', url: 'https://www.tourisme-occitanie.com/musee-jean-cros-mineraux-et-fossiles/lacrouzette/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b810955/detail.aspx', lat: 43.6600, lng: 2.3700 },
  { commune: 'Lagrave', nom: 'Archéocrypte Sainte Sigolène', categorie: 'Archéologie/Religion', adresse: '81150 Lagrave', url: 'https://www.tourisme-occitanie.com/archeocrypte-sainte-sigolene/lagrave/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b72a/detail.aspx', lat: 43.8650, lng: 1.9500 },
  { commune: 'Lautrec', nom: 'Collégiale Saint-Rémy', categorie: 'Patrimoine/Religion', adresse: '81440 Lautrec', url: 'https://www.tourisme-occitanie.com/collegiale-saint-remy/lautrec/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b7a2/detail.aspx', lat: 43.6800, lng: 2.1800 },
  { commune: 'Lautrec', nom: 'Château de Malvignol', categorie: 'Patrimoine', adresse: '81440 Lautrec', url: 'https://www.tourisme-tarn.com/hebergement-locatif/le-chateau-de-malvignol/', lat: 43.6810, lng: 2.1810 },
  { commune: 'Lavaur', nom: 'Musée du Pays vaurais', categorie: 'Patrimoine/Histoire', adresse: '81500 Lavaur', url: 'https://www.tourisme-occitanie.com/musee-du-pays-vaurais/lavaur/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d9/detail.aspx', lat: 43.7000, lng: 1.8100 },
];

export async function GET() {
  // Tri par ordre alphabétique de la commune avant l'envoi
  const sortedMusees = museesTarn.sort((a, b) => a.commune.localeCompare(b.commune));
  return NextResponse.json(sortedMusees);
}

export type Musee = MuseeTarn;
