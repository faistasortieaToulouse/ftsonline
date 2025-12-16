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
  // Coordonnées géographiques (lat/lng) sont des estimations
  { commune: 'Arcambal', nom: 'Petit Musée Personnel de Christian Verdun', adresse: '46090 Arcambal', categorie: 'Art', url: 'https://www.tourisme-occitanie.com/petit-musee-personnel-christian-verdun/arcambal/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa43e0/detail.aspx', lat: 44.4750, lng: 1.5170 },
  { commune: 'Assier', nom: 'Château d\'Assier', adresse: '46320 Assier', categorie: 'Patrimoine', url: 'https://www.chateau-assier.fr/', lat: 44.7000, lng: 1.9070 },
  { commune: 'Bagnac-sur-Célé', nom: 'Moulin des Conturies', adresse: '46270 Bagnac-sur-Célé', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/moulin-des-conturies/bagnac-sur-cele/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145396/detail.aspx', lat: 44.6200, lng: 2.2700 },
  { commune: 'Bouziès', nom: 'Chemin de Halage', adresse: 'D13 (le long du Lot), 46330 Bouziès', categorie: 'Patrimoine/Nature', url: 'https://www.tourisme-lot.com/experiences/patrimoine-et-histoire/incontournables/le-chemin-de-halage-a-bouzies', lat: 44.4800, lng: 1.6350 },
  { commune: 'Cabrerets', nom: 'Grotte de Pech-Merle', adresse: '46330 Cabrerets', categorie: 'Patrimoine/Préhistoire', url: 'https://www.pechmerle.com/', lat: 44.5000, lng: 1.6300 },
  { commune: 'Cabrerets', nom: 'Musée de Préhistoire Amédée Lemozi (Pech-Merle)', adresse: '46330 Cabrerets', categorie: 'Patrimoine/Préhistoire', url: 'https://www.pechmerle.com/le-musee-de-prehistoire-amede-lemozi/', lat: 44.5000, lng: 1.6300 },
  { commune: 'Cajarc', nom: 'Gare De Cajarc', adresse: '46160 Cajarc', categorie: 'Patrimoine/Transport', url: 'https://fr.wikipedia.org/wiki/Gare_de_Cajarc', lat: 44.5000, lng: 1.8400 },
  { commune: 'Calès', nom: 'Moulin à eau de Cougnaguet', adresse: '46350 Calès', categorie: 'Patrimoine/Industrie', url: 'http://www.moulincougnaguet.com/', lat: 44.7950, lng: 1.5850 },
  { commune: 'Carennac', nom: 'Église Saint Pierre et son Cloître', adresse: '46110 Carennac', categorie: 'Patrimoine/Religion', url: 'https://www.carennac.fr/l-eglise-saint-pierre-et-son-cloitre', lat: 44.9210, lng: 1.7670 },
  { commune: 'Cazals', nom: 'Atelier-Musée des Vieilles Mécaniques', adresse: '46250 Cazals', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/atelier-musee-des-vieilles-mecaniques/cazals/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab666145455/detail.aspx', lat: 44.6400, lng: 1.2500 },
  { commune: 'Cahors', nom: 'Cathédrale Saint-Etienne et son cloître', adresse: 'Place Aristide Briand, 46000 Cahors', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-cahors.com/decouvrir-cahors/patrimoine-et-visites/cathedrale-saint-etienne-de-cahors/', lat: 44.4440, lng: 1.4420 },
  { commune: 'Cahors', nom: 'Musée de Cahors Henri-Martin', adresse: '792 rue Anatole France, 46000 Cahors', categorie: 'Art/Histoire', url: 'https://www.museehenrimartin.fr/', lat: 44.4400, lng: 1.4430 },
  { commune: 'Cahors', nom: 'Pont Valentré', adresse: 'Rue du Pont Valentré, 46000 Cahors', categorie: 'Patrimoine', url: 'https://www.tourisme-cahors.com/decouvrir-cahors/patrimoine-et-visites/pont-valentre-de-cahors/', lat: 44.4430, lng: 1.4380 },
  { commune: 'Cahors', nom: 'Musée de la Résistance de la Déportation et de la Libération du Lot', adresse: '164 Rue Hautes-Coteaux, 46000 Cahors', categorie: 'Histoire', url: 'https://www.tourisme-cahors.com/visiter/musee-de-la-resistance-de-la-deportation-et-de-la-liberation-du-lot/', lat: 44.4450, lng: 1.4500 },
  { commune: 'Cahors', nom: 'Maison de l\'eau (Ancienne station de pompage de Cabazat)', adresse: '175 quai Albert-Cappus, 46000 Cahors', categorie: 'Patrimoine/Nature', url: 'https://www.cahorsvalleedulot.com/patrimoine/maison-de-leau-ancienne-station-de-pompage-de-cabazat-4/', lat: 44.4455, lng: 1.4390 },
  { commune: 'Cahors', nom: 'Musée du Vin - La Chantrerie', adresse: '35 Rue de la Chantrerie, 46000 Cahors', categorie: 'Industrie/Patrimoine', url: 'https://www.cahorsvalleedulot.com/boutiques/le-musee-du-vin/', lat: 44.4460, lng: 1.4440 },
  { commune: 'Cahors', nom: 'Musée d\'Art religieux', adresse: 'Rue de la Chantrerie, 46000 Cahors', categorie: 'Art/Religion', url: 'https://cahors.obteniruncontact.com/museum/musee-dart-religieux/', lat: 44.4465, lng: 1.4445 },
  { commune: 'Capdenac-le-Haut', nom: 'Musée de Capdenac le Haut', adresse: '46100 Capdenac-le-Haut', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-figeac.com/offres/musee-de-capdenac-le-haut-capdenac-fr-3956748/', lat: 44.5750, lng: 2.0850 },
  { commune: 'Capdenac-le-Haut', nom: 'Donjon de Capdenac-le-Haut', adresse: '46100 Capdenac-le-Haut', categorie: 'Patrimoine', url: 'https://www.tourisme-occitanie.com/donjon-de-capdenac-le-haut/capdenac-le-haut/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8108c4/detail.aspx', lat: 44.5755, lng: 2.0860 },
];

export async function GET() {
  return NextResponse.json(museesLot);
}

export type Musee = MuseeLot;
