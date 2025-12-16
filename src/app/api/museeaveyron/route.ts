// src/app/api/museeaveyron/route.ts
import { NextResponse } from 'next/server';

// Définition de type mise à jour avec lat/lng
export interface MuseeAveyron {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; 
  lng: number; 
}

const museesAveyron: MuseeAveyron[] = [
  // --- Liste Initiale ---
  { commune: "Agen-d'Aveyron", nom: "Musée Au fil du Rail", adresse: "Le Monastère, 12630 Agen-d'Aveyron", categorie: "Transport", url: "https://www.tourisme-aveyron.com/fiche/musee-fil-du-rail-le-monastere-le-monastere-fr-2342898/", lat: 44.3315, lng: 2.6517 },
  { commune: "Argences-en-Aubrac", nom: "Micro Musée du Clairon Rolland", adresse: "12210 Argences en Aubrac", categorie: "Patrimoine/Histoire", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/micro-musee-du-clairon-rolland-argences-en-aubrac_TFO184093492995", lat: 44.7570, lng: 2.9240 },
  { commune: "Aubin", nom: "Musée de la mine Lucien Mazars", adresse: "12110 Aubin", categorie: "Industrie", url: "https://museedelamineaubin.fr/", lat: 44.5200, lng: 2.2380 },
  { commune: "Aubin", nom: "Église Notre Dame d'Aubin", adresse: "12110 Aubin", categorie: "Patrimoine/Religion", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/eglise-notre-dame-d-aubin-aubin_TFO089111842736", lat: 44.5215, lng: 2.2355 },
  { commune: "Ayssènes", nom: "Maison de la Châtaigne/Musée des Arts Religieux", adresse: "12430 Ayssènes", categorie: "Patrimoine", url: "https://www.aveyron.com/patrimoine/maison-de-la-chataigne", lat: 44.0260, lng: 2.7660 },
  { commune: "Belcastel", nom: "Château de Belcastel", adresse: "12390 Belcastel", categorie: "Patrimoine", url: "https://www.chateaubelcastel.com/", lat: 44.3800, lng: 2.3080 },
  { commune: "Belcastel", nom: "Musée de la forge et des anciens métiers", adresse: "60, Rue du Riu 12390 Belcastel", categorie: "Industrie/Patrimoine", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/musee-de-la-forge-et-des-anciens-metiers-de-belcastel-belcastel_TFO026579485330", lat: 44.3810, lng: 2.3090 },
  { commune: "Bozouls", nom: "Terra Memoria", adresse: "12340 Bozouls", categorie: "Patrimoine Naturel", url: "http://www.terramemoria.fr/", lat: 44.4750, lng: 2.7230 },
  { commune: "Brommat", nom: "Musée Le Moulin de Burée", adresse: "12600 Brommat", categorie: "Patrimoine/Industrie", url: "https://www.tourisme-aveyron.com/fiche/moulin-de-buree-brommat-fr-2343806/", lat: 44.8070, lng: 2.6500 },
  { commune: "Cabanès", nom: "Musée de la Résistance à la chapelle de Villelongue", adresse: "12800 Cabanès", categorie: "Histoire", url: "https://www.tourisme-aveyron.com/fiche/musee-de-la-resistance-cabanes-fr-2342894/", lat: 44.0890, lng: 2.3030 },
  { commune: "Campouriez", nom: "Musée et Espace Charles de Louvrié", adresse: "Bes Bédène de Campouriez, 12140 Campouriez", categorie: "Patrimoine", url: "https://www.tourisme-aveyron.com/fiche/musee-espace-charles-de-louvrie-campouriez-fr-2343048/", lat: 44.6620, lng: 2.6820 },
  { commune: "Cantoin", nom: "Maison de la cabrette et des traditions de l'Aubrac", adresse: "12420 Cantoin", categorie: "Patrimoine", url: "https://www.aubrac-tourisme.fr/page/musee-de-la-cabrette/", lat: 44.7570, lng: 3.0180 },
  { commune: "Comprégnac", nom: "La Maison de la Truffe", adresse: "12100 Comprégnac", categorie: "Patrimoine/Industrie", url: "http://www.maison-truffe-aveyron.com/", lat: 44.0850, lng: 3.0300 },
  { commune: "Condom-d'Aubrac", nom: "Mille Ans de Traces en Aubrac", adresse: "12470 Condom-d'Aubrac", categorie: "Patrimoine/Nature", url: "https://www.tourisme-aveyron.com/fiche/mille-ans-de-traces-en-aubrac-condom-daubrac-fr-2342823/", lat: 44.6190, lng: 2.9280 },
  { commune: "Conques-en-Rouergue", nom: "Les Chambres de Lumière", adresse: "Place de l'église, 12320 Conques-en-Rouergue", categorie: "Art/Patrimoine", url: "https://www.abbaye-conques.com/", lat: 44.5990, lng: 2.3980 },
  { commune: "Conques-en-Rouergue", nom: "Musée Joseph-Fau", adresse: "12320 Conques-en-Rouergue", categorie: "Patrimoine/Art", url: "https://www.abbaye-conques.com/musee-fau/", lat: 44.5985, lng: 2.3985 },
  { commune: "Conques-en-Rouergue", nom: "Trésor d'orfèvrerie médiévale", adresse: "12320 Conques-en-Rouergue", categorie: "Patrimoine/Religion", url: "https://www.abbaye-conques.com/tresor/", lat: 44.5980, lng: 2.3990 },
  { commune: "Conques-en-Rouergue", nom: "Abbatiale Sainte-Foy", adresse: "12320 Conques-en-Rouergue", categorie: "Patrimoine/Religion", url: "https://www.abbaye-conques.com/abbatiale-sainte-foy/", lat: 44.5988, lng: 2.3992 },
  { commune: "Cornus", nom: "Maison du Guilhaumard", adresse: "12230 Cornus", categorie: "Patrimoine/Nature", url: "https://www.tourisme-aveyron.com/fiche/maison-du-guilhaumard-cornus-fr-2342844/", lat: 43.8960, lng: 3.1250 },
  { commune: "Coupiac", nom: "Château de Coupiac", adresse: "12550 Coupiac", categorie: "Patrimoine", url: "http://www.chateaudecoupiac.com/", lat: 43.9160, lng: 2.4570 },
  { commune: "Coupiac", nom: "Musée rural du bois", adresse: "Av. Raymond Bel, 12550 Coupiac", categorie: "Industrie/Patrimoine", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/chateau-de-coupiac-et-musee-rural-du-bois-coupiac_TFO18719193492", lat: 43.9165, lng: 2.4580 },
  { commune: "Cransac", nom: "Musée Les Mémoires de Cransac", adresse: "L'Envol, All. Jean Jaurès, 12110 Cransac", categorie: "Industrie/Histoire", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/musee-les-memoires-de-cransac-cransac-les-thermes_TFO18794739655", lat: 44.5360, lng: 2.2530 },
  { commune: "Crespin", nom: "Maison de l'écrivain Jean Boudou", adresse: "56 Esp. Robert Marty, 12800 Crespin", categorie: "Patrimoine/Littérature", url: "https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/maison-de-l-ecrivain-jean-boudou-ostal-joan-bodon-crespin_TFO406463820247", lat: 44.2750, lng: 2.1150 },
  { commune: "Decazeville", nom: "Musée de Géologie Pierre Vetter", adresse: "12300 Decazeville", categorie: "Industrie/Nature", url: "https://www.aveyron.com/patrimoine/musee-geologique-decazeville", lat: 44.5710, lng: 2.2600 },
  { commune: "Decazeville", nom: "Association de Sauvegarde du Patrimoine Industriel du Bassin", adresse: "12300 Decazeville", categorie: "Industrie", url: "https://www.tourisme-aveyron.com/fiche/association-de-sauvegarde-du-patrimoine-industriel-du-bassin-de-decazeville-decazeville-fr-2342795/", lat: 44.5720, lng: 2.2610 },
  { commune: 'Durenque', nom: 'Moulins de Roupeyrac', adresse: '12170 Durenque', categorie: 'Industrie/Patrimoine', url: 'https://moulinsderoupeyrac.com/', lat: 44.0200, lng: 2.6500 },
  { commune: 'Espalion', nom: 'Musée des mœurs et coutumes du Rouergue', adresse: 'Rue Vaylet, 12500 Espalion', categorie: 'Patrimoine/Histoire', url: 'https://www.aveyron.com/patrimoine/musee-moeurs-et-coutumes', lat: 44.5200, lng: 2.7630 },
  { commune: 'Espalion', nom: 'Musée Joseph Vaylet', adresse: '12500 Espalion', categorie: 'Patrimoine/Art', url: 'https://www.tourisme-aveyron.com/fiche/musee-joseph-vaylet-espalion-fr-2343209/', lat: 44.5210, lng: 2.7635 },
  { commune: 'Espalion', nom: 'Musée du scaphandre', adresse: 'Place de la Résistance, 12500 Espalion', categorie: 'Industrie/Patrimoine', url: 'https://www.musee-scaphandre.com/', lat: 44.5215, lng: 2.7650 },
  { commune: 'Firmi', nom: 'Collections Archéologiques de Girmou', adresse: 'Place Irénée Quintard Centre Culturel La Serpentine, 12300 Firmi', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/collections-archeologiques-de-girmou-firmi_TFO19474945346', lat: 44.5700, lng: 2.3020 },
  { commune: 'Goutrens', nom: 'Espace Georges Rouquier', adresse: '12390 Goutrens', categorie: 'Patrimoine/Art', url: 'https://www.espace-georges-rouquier.com/', lat: 44.4020, lng: 2.3050 },
  { commune: 'Goutrens', nom: 'Musée "nos campagnes autrefois"', adresse: '40 chemin nos campagne autrefois, La Palairie, 12390 Goutrens', categorie: 'Patrimoine', url: 'https://www.nos-campagnes-autrefois.fr/', lat: 44.4050, lng: 2.3070 },
  { commune: "L'Hospitalet-du-Larzac", nom: 'Centre Archéologique Frédéric Hermet', adresse: '12100 L\'Hospitalet-du-Larzac', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-aveyron.com/fiche/centre-archeologique-frederic-hermet-lhospitalet-du-larzac-fr-2342799/', lat: 44.0200, lng: 3.1900 },
  { commune: 'Lacroix-Barrez', nom: 'Musée du Cardinal Verdier', adresse: '12600 Lacroix-Barrez', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-aveyron.com/fiche/musee-du-cardinal-verdier-lacroix-barrez-fr-2342895/', lat: 44.8020, lng: 2.6550 },
  { commune: 'Laguiole', nom: 'Musée du Couteau de Laguiole', adresse: '12210 Laguiole', categorie: 'Industrie/Patrimoine', url: 'https://www.museecouteau.fr/', lat: 44.6900, lng: 2.8450 },
  { commune: 'Lanuéjouls', nom: 'Musée du modélisme ferroviaire', adresse: '14 Rue des Coquelicots, 12350 Lanuéjouls', categorie: 'Transport', url: 'https://www.tourisme-aveyron.com/fr/diffusio/patrimoine-culturel-visites/musee-du-modelisme-ferroviaire-lanuejouls_TFO182351627978', lat: 44.4750, lng: 2.1650 },
  { commune: 'Laval-Roquecezière', nom: 'Musée Damien Bec', adresse: '12370 Laval-Roquecezière', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-aveyron.com/fiche/musee-damien-bec-laval-roqueceziere-fr-2342891/', lat: 43.8300, lng: 2.8700 },
  { commune: 'Le Cayrol', nom: 'Musées des ardoisières', adresse: '12500 Le Cayrol', categorie: 'Industrie/Patrimoine', url: 'http://www.ardoise-musee.com/', lat: 44.4250, lng: 2.7600 },
  { commune: 'Le Fel', nom: 'Poterie - Galerie du Don', adresse: '12140 Le Fel', categorie: 'Art/Industrie', url: 'https://www.galeriedudon.com/', lat: 44.6000, lng: 2.4500 },
  { commune: 'Les Costes-Gozon', nom: 'Musée de la Dragonnière', adresse: '12400 Saint-Affrique', categorie: 'Patrimoine/Nature', url: 'https://www.tourisme-aveyron.com/fiche/dragonniere-les-costes-gozon-fr-2342845/', lat: 43.9100, lng: 2.8350 },
  { commune: 'Lescure-Jaoul', nom: 'Musée de la forge et de l\'ancienne vie rurale', adresse: '12240 Lescure-Jaoul', categorie: 'Industrie/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/musee-de-la-forge-et-de-lancienne-vie-rurale-lescure-jaoul-fr-2343208/', lat: 44.2000, lng: 1.9500 },
  { commune: 'Le Truel', nom: 'Espace hydro Raspes et Lévézou', adresse: '12430 Le Truel', categorie: 'Industrie/Nature', url: 'https://www.tourisme-aveyron.com/fiche/espace-hydro-raspes-et-levezou-le-truel-fr-2342851/', lat: 43.9500, lng: 2.7300 },
  { commune: 'Marcillac-Vallon', nom: 'Galerie de la Chapelle Saint Louis', adresse: '12330 Marcillac-Vallon', categorie: 'Art/Religion', url: 'https://www.tourisme-aveyron.com/fiche/galerie-de-la-chapelle-saint-louis-marcillac-vallon-fr-2342892/', lat: 44.4600, lng: 2.4700 },
  { commune: 'Martiel', nom: 'Abbaye de Loc Dieu', adresse: '12200 Martiel', categorie: 'Patrimoine/Religion', url: 'http://www.abbayedelocdieu.com/', lat: 44.3800, lng: 1.9600 },
  { commune: 'Millau', nom: 'Musée de Millau et des Grands Causses', adresse: 'Place Foch, 12100 Millau', categorie: 'Patrimoine/Histoire', url: 'https://www.millau.fr/pages/decouvrir-millau/musee.html', lat: 44.0980, lng: 3.0760 },
  { commune: 'Millau', nom: 'Site Archéologique de la Graufesenque', adresse: '12100 Millau', categorie: 'Patrimoine/Archéologie', url: 'https://www.millau.fr/pages/decouvrir-millau/site-archeologique-la-graufesenque.html', lat: 44.0950, lng: 3.0780 },
  { commune: 'Millau', nom: 'Viaduc Expo - Visite Libre', adresse: 'Aire du Viaduc de Millau (A75), 12100 Millau', categorie: 'Transport', url: 'https://www.leviaducdemillau.com/viaduc-expo', lat: 44.0820, lng: 3.0330 },
  { commune: 'Montbazens', nom: 'Musee Cavaignac-Gladin', adresse: '12220 Montbazens', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-aveyron.com/fiche/musee-cavaignac-gladin-montbazens-fr-2342880/', lat: 44.4500, lng: 2.1850 },
  { commune: 'Montpeyroux', nom: 'Centre Albert Calmels', adresse: '12220 Montpeyroux', categorie: 'Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/centre-albert-calmels-montpeyroux-fr-2342797/', lat: 44.4250, lng: 2.2150 },
  { commune: 'Montsalès', nom: 'La Tour de Montsalès', adresse: '12220 Montsalès', categorie: 'Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/tour-de-montsales-montsales-fr-2342907/', lat: 44.4750, lng: 2.1950 },
  { commune: 'Montrozier', nom: 'Espace archéologique départemental de Montrozier', adresse: '12630 Montrozier', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-aveyron.com/fiche/espace-archeologique-departemental-montrozier-fr-2342801/', lat: 44.3750, lng: 2.7600 },
  { commune: 'Murols', nom: 'Musée de la Forge', adresse: '12600 Murols', categorie: 'Industrie/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/musee-de-la-forge-murols-fr-2342881/', lat: 44.8250, lng: 2.6500 },
  { commune: 'Paulhe', nom: 'La Maison de la Cerise', adresse: '12520 Paulhe', categorie: 'Industrie/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/maison-de-la-cerise-paulhe-fr-2342890/', lat: 44.1100, lng: 3.0300 },
  { commune: 'Pomayrols', nom: 'Mini-Musée de Pomayrols', adresse: '12340 Pomayrols', categorie: 'Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/mini-musee-pomayrols-fr-2342899/', lat: 44.4300, lng: 2.9700 },
  { commune: 'Pradinas', nom: 'Musée des Traditions agricoles du Ségala', adresse: '12800 Pradinas', categorie: 'Patrimoine/Industrie', url: 'https://www.aveyron.com/patrimoine/musee-traditions-agricoles', lat: 44.1600, lng: 2.2700 },
  { commune: 'Requista', nom: 'Musée De Lincou', adresse: '12170 Requista', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-aveyron.com/fiche/musee-de-lincou-requista-fr-2343202/', lat: 43.9100, lng: 2.5000 },
  { commune: 'Rignac', nom: 'Un œil sur le passé', adresse: '12390 Rignac', categorie: 'Patrimoine/Histoire', url: 'https://www.rignac.fr/culture-loisirs/les-musees/un-oeil-sur-le-passe/', lat: 44.3800, lng: 2.3800 },
  { commune: 'Rieupeyroux', nom: 'La fontaine du Griffoul - Parcours Oreilles en Balade', adresse: 'Place du Griffoul, 12240 Rieupeyroux', categorie: 'Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/parcours-oreilles-en-balade-fontaine-du-griffoul-rieupeyroux-fr-2342878/', lat: 44.2400, lng: 2.2000 },
  { commune: 'Rodez', nom: 'Musée Denys-Puech', adresse: 'Place Georges-Clemenceau, 12000 Rodez', categorie: 'Art', url: 'http://www.musee-denys-puech.rodezagglo.fr/', lat: 44.3540, lng: 2.5740 },
  { commune: 'Rodez', nom: 'Musée Fenaille', adresse: '14 Place Eugène Viala, 12000 Rodez', categorie: 'Patrimoine/Archéologie', url: 'https://musee-fenaille.rodezagglo.fr/', lat: 44.3545, lng: 2.5760 },
  { commune: 'Rodez', nom: 'Musée Soulages', adresse: 'Avenue Victor Hugo, 12000 Rodez', categorie: 'Art', url: 'https://musee-soulages.rodezagglo.fr/', lat: 44.3500, lng: 2.5700 },
  { commune: 'Roquefort-sur-Soulzon', nom: 'Musée Municipal d\'archéologie de Roquefort', adresse: '12250 Roquefort-sur-Soulzon', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-aveyron.com/fiche/musee-municipal-darcheologie-roquefort-sur-soulzon-fr-2342805/', lat: 43.9800, lng: 2.9900 },
  { commune: 'Saint-Affrique', nom: 'La Maison de la Mémoire', adresse: 'Rue du Puits de la Pomme, 12400 Saint-Affrique', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-aveyron.com/fiche/maison-de-la-memoire-saint-affrique-fr-2343169/', lat: 43.9550, lng: 2.8900 },
  { commune: 'Saint-Affrique', nom: 'Espace Marionnette de Saint-Affrique', adresse: '12400 Saint-Affrique', categorie: 'Art/Loisirs', url: '', lat: 43.9560, lng: 2.8910 },
  { commune: 'Saint-Amans-des-Cots', nom: 'Miner\'Aubrac', adresse: '12420 Saint-Amans-des-Cots', categorie: 'Patrimoine/Nature', url: 'https://www.tourisme-aveyron.com/fiche/miner-aubrac-saint-amans-des-cots-fr-2342849/', lat: 44.6900, lng: 2.6500 },
  { commune: 'Saint-Amans-des-Cots', nom: 'Musée d\'art Sacré', adresse: '12420 Saint-Amans-des-Cots', categorie: 'Patrimoine/Religion', url: '', lat: 44.6910, lng: 2.6510 },
  { commune: 'Saint-Beauzély', nom: 'Musée de la vie rurale et de la pierre', adresse: 'Place du Fort, 12620 Saint-Beauzély', categorie: 'Patrimoine', url: 'http://www.museesaintbeauzely.com/', lat: 44.1500, lng: 2.9500 },
  { commune: 'Saint-Hippolyte', nom: 'Espace EDF Truyère de Couesques', adresse: '12140 Saint-Hippolyte', categorie: 'Industrie', url: 'https://www.edf.fr/groupe-edf/producteur-industriel/une-centrale-pres-de-chez-vous/hydraulique/l-espace-de-decouverte-des-lacs-du-truyere', lat: 44.6500, lng: 2.6700 },
  { commune: 'Saint-Izaire', nom: 'Château de Saint-Izaire et Musée de l\'Archerie', adresse: '12480 Saint-Izaire', categorie: 'Patrimoine/Sport', url: 'http://www.chateau-saint-izaire.com/', lat: 43.9100, lng: 2.6500 },
  { commune: 'Saint-Jean-d\'Alcas-et-St-Paul-des-Fonts', nom: 'L\'Espace botanique Hippolyte Coste', adresse: '12250 Saint-Jean-d\'Alcas-et-St-Paul-des-Fonts', categorie: 'Nature/Jardin', url: 'https://www.tourisme-aveyron.com/fiche/espace-botanique-hippolyte-coste-saint-paul-des-fonts-fr-2342838/', lat: 43.9300, lng: 3.0300 },
  { commune: 'Saint-Jean-du-Bruel', nom: 'NORIA Maison de l\'Eau', adresse: '12250 Saint-Jean-du-Bruel', categorie: 'Patrimoine/Nature', url: 'http://www.noria-aveyron.fr/', lat: 43.9700, lng: 3.1200 },
  { commune: 'Saint-Laurent-d\'Olt', nom: 'Musée Jean Boudou', adresse: '12560 Saint-Laurent-d\'Olt', categorie: 'Patrimoine/Littérature', url: 'https://www.tourisme-aveyron.com/fiche/musee-jean-boudou-saint-laurent-dolt-fr-2342893/', lat: 44.4300, lng: 3.0900 },
  { commune: 'Saint-Léons', nom: 'Micropolis, la cité des insectes', adresse: '12780 Saint-Léons', categorie: 'Nature/Loisirs', url: 'https://www.micropolis.biz/', lat: 44.1300, lng: 2.9800 },
  { commune: 'Saint-Parthem', nom: 'Terra OLT', adresse: '12300 Saint-Parthem', categorie: 'Industrie/Patrimoine', url: 'https://www.terra-olt.com/', lat: 44.5900, lng: 2.2900 },
  { commune: 'Saint-Rémy', nom: 'Moulin des Arts, espace d\'art contemporain', adresse: '12200 Saint-Rémy', categorie: 'Art', url: 'https://www.moulindesarts.com/', lat: 44.3300, lng: 2.0500 },
  { commune: 'Saint-Sever-du-Moustier', nom: 'Musée des Arts Buissonniers', adresse: '12370 Saint-Sever-du-Moustier', categorie: 'Art/Patrimoine', url: 'https://www.musee-arts-buissonniers.fr/', lat: 43.8300, lng: 2.7000 },
  { commune: 'Saint-Sever-du-Moustier', nom: 'Constructions insolites', adresse: '12370 Saint-Sever-du-Moustier', categorie: 'Art/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/les-constructions-insolites-saint-sever-du-moustier-fr-2343799/', lat: 43.8310, lng: 2.7010 },
  { commune: 'Saint-Victor-et-Melvieu', nom: 'Centre d\'Art Mural', adresse: '12400 Saint-Victor-et-Melvieu', categorie: 'Art', url: 'https://www.tourisme-aveyron.com/fiche/centre-dart-mural-saint-victor-et-melvieu-fr-2342888/', lat: 43.9800, lng: 2.8300 },
  { commune: 'Sainte-Eulalie-d\'Olt', nom: 'Galerie - Musée Marcel Boudu', adresse: '12130 Sainte-Eulalie-d\'Olt', categorie: 'Art/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/musee-marcel-boudu-sainte-eulalie-dolt-fr-2342897/', lat: 44.4750, lng: 2.9400 },
  { commune: 'Sainte-Eulalie-d\'Olt', nom: 'Eulalie d\'Art', adresse: '12130 Sainte-Eulalie-d\'Olt', categorie: 'Art', url: 'https://www.tourisme-aveyron.com/fiche/eulalie-dart-sainte-eulalie-dolt-fr-2342886/', lat: 44.4755, lng: 2.9405 },
  { commune: 'Salles-Curan', nom: 'Maison natale de Eugène Viala', adresse: '12410 Salles-Curan', categorie: 'Patrimoine/Art', url: 'https://www.tourisme-aveyron.com/fiche/maison-natale-eugene-viala-salles-curan-fr-2342887/', lat: 44.1150, lng: 2.7750 },
  { commune: 'Salles-la-Source', nom: 'Musée des arts et métiers traditionnels', adresse: '12330 Salles-la-Source', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-aveyron.com/fiche/musee-des-arts-et-metiers-traditionnels-salles-la-source-fr-2342896/', lat: 44.3850, lng: 2.4750 },
  { commune: 'Salles-la-Source', nom: 'Galerie des Ondes', adresse: '12330 Salles-la-Source', categorie: 'Art/Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/galerie-des-ondes-salles-la-source-fr-2342867/', lat: 44.3855, lng: 2.4755 },
  { commune: 'Salmiech', nom: 'Musée du Charroi Rural et de l\'Artisanat Traditionnel', adresse: '111 Pl. du Placet, 12120 Salmiech', categorie: 'Patrimoine/Industrie', url: 'https://www.aveyron.com/patrimoine/musee-du-charroi-rural', lat: 44.1500, lng: 2.5000 },
  { commune: 'Sauclières', nom: 'Musée des Traditions du Sud-Aveyron', adresse: '12230 Sauclières', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-aveyron.com/fiche/musee-des-traditions-du-sud-aveyron-sauclieres-fr-2343171/', lat: 43.8300, lng: 3.1600 },
  { commune: 'Sévérac-d\'Aveyron', nom: 'La maison des consuls', adresse: 'Place de la Fontaine, 12150 Sévérac-d\'Aveyron', categorie: 'Patrimoine/Histoire', url: 'https://www.severacdaveyron.fr/culture-loisirs/musee-des-consuls/', lat: 44.3100, lng: 3.0700 },
  { commune: 'Soulages-Bonneval', nom: 'Le grenier de Capou', adresse: '12210 Soulages-Bonneval', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-aveyron.com/fiche/grenier-de-capou-soulages-bonneval-fr-2343201/', lat: 44.6000, lng: 2.8500 },
  { commune: 'Sylvanès', nom: 'Musée Auguste Zamoyski', adresse: '12360 Sylvanès', categorie: 'Art/Patrimoine', url: 'http://www.abbaye-sylvanes.com/', lat: 43.8350, lng: 2.9200 },
  { commune: 'Taussac', nom: 'Jardin Des Cinq Sens', adresse: '12600 Taussac', categorie: 'Nature/Jardin', url: 'https://www.tourisme-aveyron.com/fiche/jardin-des-cinq-sens-taussac-fr-2342840/', lat: 44.7500, lng: 2.7500 },
  { commune: 'Thérondels', nom: 'Le Musée d\'Antoine', adresse: '12600 Thérondels', categorie: 'Patrimoine', url: 'https://www.tourisme-aveyron.com/fiche/musee-dantoine-therondels-fr-2343206/', lat: 44.8800, lng: 2.7600 },
  { commune: 'Viala-du-Tarn', nom: 'Jardin des enclos', adresse: '12490 Viala-du-Tarn', categorie: 'Nature/Jardin', url: 'https://www.tourisme-aveyron.com/fiche/jardin-des-enclos-viala-du-tarn-fr-2342839/', lat: 44.1000, lng: 2.9300 },
  { commune: 'Villecomtal', nom: 'Espace des Enfarinés - Collection de minéraux et de fossiles', adresse: '12580 Villecomtal', categorie: 'Patrimoine/Nature', url: 'https://www.tourisme-aveyron.com/fiche/collection-de-mineraux-et-de-fossiles-villecomtal-fr-2342850/', lat: 44.5100, lng: 2.4500 },
  { commune: 'Villefranche-de-Rouergue', nom: 'Musée Municipal Urbain Cabrol', adresse: '12200 Villefranche-de-Rouergue', categorie: 'Art/Histoire', url: 'https://www.villefranchederouergue.fr/culture/musee-urbain-cabrol/', lat: 44.3540, lng: 2.0300 },
  { commune: 'Villefranche-de-Rouergue', nom: 'Musée de la Ferme et du Foie Gras', adresse: '12200 Villefranche-de-Rouergue', categorie: 'Patrimoine/Industrie', url: 'https://www.musee-foie-gras-villefranche.com/', lat: 44.3545, lng: 2.0310 },
  { commune: 'Villeneuve d\'Aveyron', nom: 'Maison de la Photo Jean-Marie Périer', adresse: '12260 Villeneuve d\'Aveyron', categorie: 'Art/Patrimoine', url: 'http://maisonphoto.fr/', lat: 44.4400, lng: 1.9500 },
];

export async function GET() {
  return NextResponse.json(museesAveyron);
}

export type Musee = MuseeAveyron;
