// src/app/api/museelot/route.ts
import { NextResponse } from 'next/server';

export interface MuseeLot {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; 
  lng: number; 
}

const museesLot: MuseeLot[] = [
  // Sites précédents (triés par commune A-Z)
  { commune: 'Arcambal', nom: 'Petit Musée Personnel de Christian Verdun', adresse: '46090 Arcambal', categorie: 'Art', url: 'https://www.tourisme-occitanie.com/petit-musee-personnel-christian-verdun/arcambal/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43e0/detail.aspx', lat: 44.4750, lng: 1.5170 },
  { commune: 'Assier', nom: 'Château d\'Assier', adresse: '46320 Assier', categorie: 'Patrimoine', url: 'https://www.chateau-assier.fr/', lat: 44.7000, lng: 1.9070 },
  { commune: 'Bagnac-sur-Célé', nom: 'Moulin des Conturies', adresse: '46270 Bagnac-sur-Célé', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/moulin-des-conturies/bagnac-sur-cele/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145396/detail.aspx', lat: 44.6200, lng: 2.2700 },
  { commune: 'Bouziès', nom: 'Chemin de Halage', adresse: 'D13 (le long du Lot), 46330 Bouziès', categorie: 'Patrimoine/Nature', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/incontournables/le-chemin-de-halage-a-bouzies', lat: 44.4800, lng: 1.6350 },
  { commune: 'Cabrerets', nom: 'Grotte de Pech-Merle', adresse: '46330 Cabrerets', categorie: 'Patrimoine/Préhistoire', url: 'https://www.pechmerle.com/', lat: 44.5000, lng: 1.6300 },
  { commune: 'Cabrerets', nom: 'Musée de Préhistoire Amédée Lemozi (Pech-Merle)', adresse: '46330 Cabrerets', categorie: 'Patrimoine/Préhistoire', url: 'https://www.pechmerle.com/le-musee-de-prehistoire-amede-lemozi/', lat: 44.5000, lng: 1.6300 },
  { commune: 'Cahors', nom: 'Cathédrale Saint-Etienne et son cloître', adresse: 'Place Aristide Briand, 46000 Cahors', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-cahors.com/decouvrir-cahors/patrimoine-et-visites/cathedrale-saint-etienne-de-cahors/', lat: 44.4440, lng: 1.4420 },
  { commune: 'Cahors', nom: 'Musée de Cahors Henri-Martin', adresse: '792 rue Anatole France, 46000 Cahors', categorie: 'Art/Histoire', url: 'https://www.museehenrimartin.fr/', lat: 44.4400, lng: 1.4430 },
  { commune: 'Cahors', nom: 'Pont Valentré', adresse: 'Rue du Pont Valentré, 46000 Cahors', categorie: 'Patrimoine', url: 'https://www.tourisme-cahors.com/decouvrir-cahors/patrimoine-et-visites/pont-valentre-de-cahors/', lat: 44.4430, lng: 1.4380 },
  { commune: 'Cahors', nom: 'Musée de la Résistance de la Déportation et de la Libération du Lot', adresse: '164 Rue Hautes-Coteaux, 46000 Cahors', categorie: 'Histoire', url: 'https://www.tourisme-cahors.com/visiter/musee-de-la-resistance-de-la-deportation-et-de-la-liberation-du-lot/', lat: 44.4450, lng: 1.4500 },
  { commune: 'Cahors', nom: 'Maison de l\'eau (Ancienne station de pompage de Cabazat)', adresse: '175 quai Albert-Cappus, 46000 Cahors', categorie: 'Patrimoine/Nature', url: 'https://www.cahorsvalleedulot.com/patrimoine/maison-de-leau-ancienne-station-de-pompage-de-cabazat-4/', lat: 44.4455, lng: 1.4390 },
  { commune: 'Cahors', nom: 'Musée du Vin - La Chantrerie', adresse: '35 Rue de la Chantrerie, 46000 Cahors', categorie: 'Industrie/Patrimoine', url: 'https://www.cahorsvalleedulot.com/boutiques/le-musee-du-vin/', lat: 44.4460, lng: 1.4440 },
  { commune: 'Cahors', nom: 'Musée d\'Art religieux', adresse: 'Rue de la Chantrerie, 46000 Cahors', categorie: 'Art/Religion', url: 'https://cahors.obteniruncontact.com/museum/musee-dart-religieux/', lat: 44.4465, lng: 1.4445 },
  { commune: 'Cajarc', nom: 'Gare De Cajarc', adresse: '46160 Cajarc', categorie: 'Patrimoine/Transport', url: 'https://fr.wikipedia.org/wiki/Gare_de_Cajarc', lat: 44.5000, lng: 1.8400 },
  { commune: 'Cajarc', nom: 'Musée ferroviaire de Cajarc', adresse: '46160 Cajarc', categorie: 'Transport', url: 'https://www.tourisme-occitanie.com/musee-ferroviaire/cajarc/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43e9/detail.aspx', lat: 44.5010, lng: 1.8410 },
  { commune: 'Calès', nom: 'Moulin à eau de Cougnaguet', adresse: '46350 Calès', categorie: 'Patrimoine/Industrie', url: 'http://www.moulincougnaguet.com/', lat: 44.7950, lng: 1.5850 },
  { commune: 'Capdenac-le-Haut', nom: 'Musée de Capdenac le Haut', adresse: '46100 Capdenac-le-Haut', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-figeac.com/offres/musee-de-capdenac-le-haut-capdenac-fr-3956748/', lat: 44.5750, lng: 2.0850 },
  { commune: 'Capdenac-le-Haut', nom: 'Donjon de Capdenac-le-Haut', adresse: '46100 Capdenac-le-Haut', categorie: 'Patrimoine', url: 'https://www.tourisme-occitanie.com/donjon-de-capdenac-le-haut/capdenac-le-haut/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8108c4/detail.aspx', lat: 44.5755, lng: 2.0860 },
  { commune: 'Cardaillac', nom: 'Musée éclaté de Cardaillac', adresse: '46100 Cardaillac', categorie: 'Patrimoine', url: 'https://www.tourisme-figeac.com/a-voir-a-faire/patrimoine/villages-et-bastides/cardaillac-musee-eclate', lat: 44.6200, lng: 1.9500 },
  { commune: 'Carennac', nom: 'Église Saint Pierre et son Cloître', adresse: '46110 Carennac', categorie: 'Patrimoine/Religion', url: 'https://www.carennac.fr/l-eglise-saint-pierre-et-son-cloitre', lat: 44.9210, lng: 1.7670 },
  { commune: 'Castelnau-Montratier-Sainte Alauzie', nom: 'Moulin de Boisse', adresse: '46170 Castelnau-Montratier', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/moulin-de-boisse/castelnau-montratier-sainte-alauzie/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43b8/detail.aspx', lat: 44.2500, lng: 1.4000 },
  { commune: 'Cazals', nom: 'Atelier-Musée des Vieilles Mécaniques', adresse: '46250 Cazals', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/atelier-musee-des-vieilles-mecaniques/cazals/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145455/detail.aspx', lat: 44.6400, lng: 1.2500 },
  { commune: 'Cazals', nom: 'Musée de Mecanic Art à Cazals', adresse: '46250 Cazals', categorie: 'Art/Industrie', url: 'https://www.tourisme-occitanie.com/musee-de-mecanic-art-a-cazals/cazals/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43ef/detail.aspx', lat: 44.6410, lng: 1.2510 },
  { commune: 'Cœur-de-Causse', nom: 'Musée Murat', adresse: '46240 Cœur-de-Causse (Labastide-Murat)', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/sites-historiques/musee-murat-a-labastide-murat', lat: 44.6250, lng: 1.5400 },
  { commune: 'Couzou', nom: 'Château de la Pannonie', adresse: '46500 Couzou', categorie: 'Patrimoine', url: 'https://www.chateaudelapannonie.com/', lat: 44.7100, lng: 1.6300 },
  { commune: 'Crégols', nom: 'Espace d\'Art Roger Gobron', adresse: '46330 Crégols', categorie: 'Art', url: 'https://www.tourisme-occitanie.com/espace-dart-roger-gobron/cregols/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b810931/detail.aspx', lat: 44.4700, lng: 1.6700 },
  { commune: 'Dégagnac', nom: 'Château de Lantis', adresse: 'Château de Lantis, 46340 Dégagnac', categorie: 'Patrimoine', url: 'https://www.tourisme-lot.com/offres/chateau-de-lantis-degagnac-fr-657693/', lat: 44.6450, lng: 1.3400 },
  { commune: 'Espagnac-Sainte-Eulalie', nom: 'Prieuré d\'Espagnac-Sainte-Eulalie', adresse: '46320 Espagnac-Sainte-Eulalie', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-cahors.com/visiter/prieure-d-espagnac-sainte-eulalie/', lat: 44.6000, lng: 1.8300 },
  { commune: 'Figeac', nom: 'Musée Champollion - Les Écritures du Monde', adresse: 'Place des Écritures, 46100 Figeac', categorie: 'Musée/Histoire', url: 'https://www.musee-champollion.fr/', lat: 44.6050, lng: 2.0300 },
  { commune: 'Figeac', nom: 'Musée d’Histoire de Figeac', adresse: '46100 Figeac', categorie: 'Musée/Histoire', url: 'https://www.tourisme-figeac.com/a-voir-a-faire/patrimoine/musees-et-lieux-dexposition/musee-champollion', lat: 44.6055, lng: 2.0310 },
  { commune: 'Figeac', nom: 'Commanderie des Templiers', adresse: '46100 Figeac', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-occitanie.com/commanderie-des-templiers-de-figeac/figeac/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa4343/detail.aspx', lat: 44.6060, lng: 2.0320 },
  { commune: 'Figeac', nom: 'Espace Patrimoine de Figeac', adresse: '46100 Figeac', categorie: 'Patrimoine', url: 'https://www.tourisme-figeac.com/a-voir-a-faire/patrimoine/lieux-dinformation-du-patrimoine/espace-patrimoine', lat: 44.6065, lng: 2.0330 },
  { commune: 'Figeac', nom: 'Musée Paulin Ratier', adresse: '16 Rue Caviale, 46100 Figeac', categorie: 'Patrimoine/Histoire', url: 'https://ville-figeac.fr/musees-associatifs', lat: 44.6070, lng: 2.0340 },
  { commune: 'Figeac', nom: 'Hôtel de Laporte', adresse: 'Rue Malleville, 46100 Figeac', categorie: 'Patrimoine', url: 'https://museedupatrimoine.fr/hotel-de-laporte-a-figeac-lot/26976.html', lat: 44.6075, lng: 2.0350 },
  { commune: 'Gramat', nom: 'Parc animalier de Gramat', adresse: '46500 Gramat', categorie: 'Loisirs/Nature', url: 'https://www.gramat-parcanimalier.com/', lat: 44.7600, lng: 1.7400 },
  { commune: 'Lacave', nom: 'Grottes de Lacave', adresse: '46200 Lacave', categorie: 'Nature/Spéléologie', url: 'http://www.grottes-de-lacave.com/', lat: 44.8200, lng: 1.5100 },
  { commune: 'Lacave', nom: 'Jardins du Château de la Treyne', adresse: '46200 Lacave', categorie: 'Patrimoine/Nature', url: 'https://www.chateaudelatreyne.com/', lat: 44.8300, lng: 1.5150 },
  { commune: 'Lacapelle-Marival', nom: 'Château de Lacapelle-Marival', adresse: '46120 Lacapelle-Marival', categorie: 'Patrimoine', url: 'http://www.chateaux-france.com/lacapellemarival/', lat: 44.7500, lng: 1.9500 },
  { commune: 'Larnagol', nom: 'Château de Larnagol', adresse: '65 Rue du Château, 46160 Larnagol', categorie: 'Patrimoine', url: 'https://chateaudelarnagol.fr/', lat: 44.4850, lng: 1.6900 },
  { commune: 'Larroque-Toirac', nom: 'Château de Larroque-Toirac', adresse: '46160 Larroque-Toirac', categorie: 'Patrimoine', url: 'http://www.chateaudelarroquetoirac.fr/', lat: 44.5200, lng: 1.8200 },
  { commune: 'Lavergne', nom: 'Labyrinthe "Le Minotaure"', adresse: '46400 Lavergne', categorie: 'Loisirs', url: 'https://www.labyrintheduminotaure.fr/', lat: 44.8200, lng: 1.7400 },
  { commune: 'Le Vigan', nom: 'Musée Henri Giron', adresse: '46300 Le Vigan', categorie: 'Art', url: 'https://www.tourisme-occitanie.com/musee-henri-giron/le-vigan/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d6/detail.aspx', lat: 44.7800, lng: 1.6200 },
  { commune: 'Les Arques', nom: 'Musée Zadkine', adresse: '46250 Les Arques', categorie: 'Art', url: 'https://www.musees.lot.fr/musee-zadkine', lat: 44.6000, lng: 1.2800 },
  { commune: 'Limogne-en-Quercy', nom: 'Musée d\'Art et Traditions Populaires', adresse: '46260 Limogne-en-Quercy', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/sites-historiques/musee-d-art-et-traditions-populaires-de-limogne-en-quercy', lat: 44.4700, lng: 1.7600 },
  { commune: 'Luzech', nom: 'Musée archéologique Armand Viré', adresse: '46140 Luzech', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-occitanie.com/musee-archeologique-armand-vire/luzech/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109e8/detail.aspx', lat: 44.4780, lng: 1.2800 },
  { commune: 'Luzech', nom: 'Ichnospace, empreintes et traces de dinosaures', adresse: '46140 Luzech', categorie: 'Nature/Science', url: 'https://www.tourisme-occitanie.com/ichnospace-empreintes-et-traces-de-dinosaures/luzech/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43e4/detail.aspx', lat: 44.4785, lng: 1.2810 },
  { commune: 'Luzech', nom: 'Collection d\'Art Premier du Prince Consort de Danemark', adresse: 'Château de Cayx, 46140 Luzech', categorie: 'Art/Patrimoine', url: 'https://www.tourisme-lot.com/offres/collection-dart-premier-du-prince-consort-de-danemark-luzech-fr-894591/', lat: 44.4800, lng: 1.2820 },
  { commune: 'Luzech', nom: 'Musée La Planète des Moulins', adresse: '46140 Luzech', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/la-planete-des-moulins/luzech/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43e5/detail.aspx', lat: 44.4790, lng: 1.2815 },
  { commune: 'Marcilhac-sur-Célé', nom: 'Abbaye de Marcilhac-sur-Célé', adresse: '46260 Marcilhac-sur-Célé', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/sites-historiques/abbaye-de-marcilhac-sur-cele', lat: 44.5700, lng: 1.7000 },
  { commune: 'Martel', nom: 'Musée gallo-romain d\'Uxellodunum', adresse: '46600 Martel', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/sites-historiques/musee-gallo-romain-d-uxellodunum', lat: 44.9300, lng: 1.6000 },
  { commune: 'Martel', nom: 'Reptiland', adresse: '46600 Martel', categorie: 'Loisirs/Nature', url: 'https://www.reptiland.fr/', lat: 44.9310, lng: 1.6010 },
  { commune: 'Martel', nom: 'Chemin de fer du Haut-Quercy Le Truffadou', adresse: '46600 Martel', categorie: 'Transport', url: 'http://www.train-martel.com/', lat: 44.9320, lng: 1.6020 },
  { commune: 'Martel', nom: 'Moulin à huile de noix', adresse: '46600 Martel', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/incontournables/martel-et-le-moulin-a-huile-de-noix-rouillac', lat: 44.9330, lng: 1.6030 },
  { commune: 'Montcabrier', nom: 'Musée du Livre et de la Lettre de Montcabrier', adresse: '46700 Montcabrier', categorie: 'Patrimoine/Art', url: 'https://www.tourisme-occitanie.com/musee-du-livre-et-de-la-lettre/montcabrier/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43f7/detail.aspx', lat: 44.5200, lng: 0.9300 },
  { commune: 'Orniac', nom: 'Musée de l\'insolite', adresse: '46330 Orniac', categorie: 'Loisirs', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/sites-historiques/musee-de-l-insolite-a-orniac', lat: 44.5300, lng: 1.6000 },
  { commune: 'Padirac', nom: 'Gouffre de Padirac', adresse: '46500 Padirac', categorie: 'Nature/Spéléologie', url: 'https://www.gouffre-de-padirac.com/', lat: 44.8580, lng: 1.7770 },
  { commune: 'Padirac', nom: 'Insectopia', adresse: '46500 Padirac', categorie: 'Nature/Musée', url: 'https://www.insectopia.fr/', lat: 44.8585, lng: 1.7780 },
  { commune: 'Payrignac', nom: 'Grotte préhistorique de Gougnac', adresse: '46350 Payrignac', categorie: 'Préhistoire', url: 'https://www.grottes46.com/fr/grotte-de-gougnac', lat: 44.7550, lng: 1.3400 },
  { commune: 'Prudhomat', nom: 'Château de Castelnau-Bretenoux', adresse: '46130 Prudhomat', categorie: 'Patrimoine', url: 'https://www.chateau-castelnau-bretenoux.fr/', lat: 44.8880, lng: 1.8380 },
  { commune: 'Puy-L\'Évêque', nom: 'Manufacture de porcelaine Virebent', adresse: '46700 Puy-L\'Évêque', categorie: 'Industrie/Artisanat', url: 'https://www.virebent.com/', lat: 44.5000, lng: 1.1300 },
  { commune: 'Rocamadour', nom: 'Musée d\'Art Sacré de Rocamadour', adresse: '46500 Rocamadour', categorie: 'Art/Religion', url: 'https://www.tourisme-lot.com/offres/visite-du-musee-dart-sacree-rocamadour-fr-4381423/', lat: 44.8050, lng: 1.6150 },
  { commune: 'Rocamadour', nom: 'Sanctuaire de Rocamadour', adresse: '46500 Rocamadour', categorie: 'Religion', url: 'https://www.sanctuaire-notredamedurocamadour.com/', lat: 44.8055, lng: 1.6155 },
  { commune: 'Rocamadour', nom: 'Maison des abeilles de Rocamadour', adresse: '46500 Rocamadour', categorie: 'Nature/Industrie', url: 'https://www.maison-des-abeilles.com/', lat: 44.8060, lng: 1.6160 },
  { commune: 'Rocamadour', nom: 'La Grotte des Merveilles', adresse: '46500 Rocamadour', categorie: 'Nature/Spéléologie', url: 'https://www.grottesdesmerveilles.com/', lat: 44.8065, lng: 1.6165 },
  { commune: 'Saint-Cirq-Lapopie', nom: 'Musée départemental Rignault', adresse: '46330 Saint-Cirq-Lapopie', categorie: 'Art/Patrimoine', url: 'https://www.musees.lot.fr/musee-rignault', lat: 44.4630, lng: 1.6660 },
  { commune: 'Saint-Cirq-Lapopie', nom: 'Maison Daura', adresse: '46330 Saint-Cirq-Lapopie', categorie: 'Art/Patrimoine', url: 'https://www.maison-daura.fr/', lat: 44.4635, lng: 1.6665 },
  { commune: 'Saint-Front-sur-Lémance', nom: 'Château de Bonaguil (47, proche du Lot)', adresse: '47500 Saint-Front-sur-Lémance', categorie: 'Patrimoine', url: 'https://www.chateau-bonaguil.com/', lat: 44.5700, lng: 0.9300 },
  { commune: 'Saint-Géry', nom: 'Musée ferroviaire de Saint-Géry', adresse: '46330 Saint-Géry', categorie: 'Transport', url: 'https://www.tourisme-occitanie.com/musee-ferroviaire-de-saint-gery/saint-gery/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43g4/detail.aspx', lat: 44.4900, lng: 1.5800 },
  { commune: 'Saint-Laurent-les-Tours', nom: 'Atelier - Musée Jean Lurçat', adresse: '46400 Saint-Laurent-les-Tours', categorie: 'Art', url: 'https://musees.lot.fr/atelier-musee-jean-lurcat', lat: 44.8850, lng: 1.8380 },
  { commune: 'Saint-Médard de Presque', nom: 'Grottes de Saint-Médard de Presque', adresse: '46500 Saint-Médard de Presque', categorie: 'Nature/Spéléologie', url: 'https://www.grottes-saint-medard.com/', lat: 44.8450, lng: 1.8200 },
  { commune: 'Salviac', nom: 'Musée agricole de l\'automobile', adresse: '46340 Salviac', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/musee-agricole-de-lautomobile-de-salviac/salviac/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d9/detail.aspx', lat: 44.6600, lng: 1.2550 },
  { commune: 'Salviac', nom: 'Musée Les Vieilles Horloges', adresse: '46340 Salviac', categorie: 'Patrimoine', url: '(Pas de site web dédié trouvé)', lat: 44.6605, lng: 1.2560 },
  { commune: 'Sauliac-sur-Célé', nom: 'Écomusée de Cuzals', adresse: '46330 Sauliac-sur-Célé', categorie: 'Patrimoine/Écomusée', url: 'https://www.tourisme-lot.com/decouvrir/ecomusee-de-cuzals/', lat: 44.5100, lng: 1.6900 },
  { commune: 'Souillac', nom: 'Musée de l\'Automate', adresse: '46200 Souillac', categorie: 'Art/Loisirs', url: 'https://www.tourisme-souillac.com/musee-de-l-automate/', lat: 44.9040, lng: 1.4600 },
  { commune: 'Souillac', nom: 'Musée de la Vieille Prune - Distillerie Louis Roque', adresse: '46200 Souillac', categorie: 'Industrie/Patrimoine', url: 'https://www.vieilleprune.com/', lat: 44.9045, lng: 1.4610 },
  { commune: 'Vayrac', nom: 'Musée d\'Uxellodunum', adresse: '46110 Vayrac', categorie: 'Archéologie', url: 'https://www.tourisme-occitanie.com/musee-duxellodunum/vayrac/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43h5/detail.aspx', lat: 44.9350, lng: 1.7000 },
];

export async function GET() {
  return NextResponse.json(museesLot);
}

export type Musee = MuseeLot;
