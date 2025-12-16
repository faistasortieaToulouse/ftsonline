// src/app/api/museegers/route.ts
import { NextResponse } from 'next/server';

export interface MuseeGers {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; 
  lng: number; 
}

const museesGers: MuseeGers[] = [
  // Coordonnées géographiques (lat/lng) sont des estimations basées sur la commune ou l'adresse fournie
  { commune: 'Aignan', nom: 'Espace Paul Fontan', adresse: 'Place du Village, 32370 Aignan', categorie: 'Patrimoine/Art', url: 'https://www.tourisme-occitanie.com/espace-paul-fontan/aignan/tabid/37151/offreid/742b71fc-7b83-4a00-911e-7b71f92e2e88/detail.aspx', lat: 43.7380, lng: 0.1170 },
  { commune: 'Auch', nom: 'Musée des Jacobins d\'Auch', adresse: '4 Rue Loze, 32000 Auch', categorie: 'Patrimoine/Histoire', url: 'https://www.grand-site-occitanie.fr/musee-des-jacobins/', lat: 43.6450, lng: 0.5850 },
  { commune: 'Auch', nom: 'Musée de la résistance et de la décoration', adresse: '16 Rue Castellane, 32000 Auch', categorie: 'Histoire', url: '', lat: 43.6455, lng: 0.5845 },
  { commune: 'Auch', nom: 'Maison d\'Henri IV', adresse: 'Rue de la Garonne, 32000 Auch', categorie: 'Patrimoine', url: '', lat: 43.6440, lng: 0.5870 },
  { commune: 'Auch', nom: 'Maison Fedel', adresse: 'Rue de la Garonne, 32000 Auch', categorie: 'Patrimoine', url: '', lat: 43.6442, lng: 0.5872 },
  { commune: 'Auch', nom: 'Musée des Amériques d\'Auch', adresse: '4 Rue Loze, 32000 Auch', categorie: 'Patrimoine/Art', url: 'https://www.grand-site-occitanie.fr/musee-des-jacobins/', lat: 43.6450, lng: 0.5850 },
  { commune: 'Auch', nom: 'Trésor de la Cathédrale d\'Auch', adresse: 'Place de la République, 32000 Auch', categorie: 'Patrimoine/Religion', url: 'https://www.grand-site-occitanie.fr/tresor-de-la-cathedrale/', lat: 43.6465, lng: 0.5855 },
  { commune: 'Auch', nom: 'Memento (centre d\'art contemporain)', adresse: 'Chemin du Baron, 32000 Auch', categorie: 'Art', url: 'http://www.memento.gers.fr/', lat: 43.6480, lng: 0.5950 },
  { commune: 'Bretagne-d\'Armagnac', nom: 'Lavoir de la Bretagne d\'Armagnac', adresse: '32440 Bretagne-d\'Armagnac', categorie: 'Patrimoine', url: '', lat: 43.9050, lng: 0.0880 },
  { commune: 'Boulaur', nom: 'Abbaye de Boulaur', adresse: '32450 Boulaur', categorie: 'Patrimoine/Religion', url: 'https://www.abbaye-boulaur.fr/', lat: 43.5150, lng: 0.8100 },
  { commune: 'Brugnens', nom: 'Musée des anciens combattants pour la Liberté', adresse: '32500 Brugnens', categorie: 'Histoire', url: '', lat: 43.8300, lng: 0.7700 },
  { commune: 'Cazaux-Savès', nom: 'Château de Caumont', adresse: '32500 Cazaux-Savès', categorie: 'Patrimoine', url: 'http://www.chateaudecaumont.com/', lat: 43.4900, lng: 0.9950 },
  { commune: 'Cologne', nom: 'Centre d\'interprétation des bastides de Cologne', adresse: 'Place de la Mairie, 32430 Cologne', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-occitanie.com/centre-dinterpretation-des-bastides/cologne/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b72a/detail.aspx', lat: 43.7650, lng: 0.9900 },
  { commune: 'Condom', nom: 'Musée de l\'Armagnac', adresse: '2 Rue Gaston Ducos, 32100 Condom', categorie: 'Industrie/Patrimoine', url: 'https://www.tourisme-condom.com/musee-de-larmagnac-et-du-condomois/', lat: 43.9550, lng: 0.3710 },
  { commune: 'Condom', nom: 'Église-musée d\'art sacré du Pradau', adresse: '32100 Condom', categorie: 'Patrimoine/Religion', url: 'https://www.tourisme-occitanie.com/eglise-musee-dart-sacre-du-pradau/condom/tabid/37151/offreid/7298c4b1-876e-44e2-9382-36c567a5b1d5/detail.aspx', lat: 43.9500, lng: 0.3750 },
  { commune: 'Condom', nom: 'Musée du Condom', adresse: '32100 Condom', categorie: 'Industrie/Patrimoine', url: 'https://www.tourisme-condom.com/musee-de-larmagnac-et-du-condomois/', lat: 43.9560, lng: 0.3720 },
  { commune: 'Campagnac-d\'Armagnac', nom: 'Lavoir de Campagnac d\'Armagnac', adresse: '32190 Campagnac-d\'Armagnac', categorie: 'Patrimoine', url: '', lat: 43.8900, lng: 0.1700 },
  { commune: 'Castelnau-d\'Auzan', nom: 'Lavoir de Castelnau d\'Auzan', adresse: '32440 Castelnau-d\'Auzan', categorie: 'Patrimoine', url: '', lat: 43.9300, lng: 0.1200 },
  { commune: 'Cazaubon', nom: 'Lavoir de Cazaubon', adresse: '32150 Cazaubon', categorie: 'Patrimoine', url: '', lat: 43.9350, lng: 0.0500 },
  { commune: 'Demu', nom: 'Lavoir de Demu', adresse: '32190 Demu', categorie: 'Patrimoine', url: '', lat: 43.8050, lng: 0.1050 },
  { commune: 'Eauze', nom: 'Musée archéologique / Le trésor', adresse: 'Place de la République, 32800 Eauze', categorie: 'Patrimoine/Archéologie', url: 'https://www.musee-eauze.fr/', lat: 43.8640, lng: 0.0570 },
  { commune: 'Eauze', nom: 'La domus Cieutat et son centre d\'interprétation', adresse: '32800 Eauze', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-occitanie.com/la-domus-de-cieutat-et-son-centre-dinterpretation/eauze/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b918/detail.aspx', lat: 43.8680, lng: 0.0590 },
  { commune: 'Eauze', nom: 'Lavoir de Carbonas d\'Eauze', adresse: '32800 Eauze', categorie: 'Patrimoine', url: '', lat: 43.8650, lng: 0.0550 },
  { commune: 'Espas', nom: 'Château d\'Espas', adresse: '32370 Espas', categorie: 'Patrimoine', url: '', lat: 43.7650, lng: 0.0850 },
  { commune: 'Estang', nom: 'Lavoir d\'Estang', adresse: '32240 Estang', categorie: 'Patrimoine', url: '', lat: 43.8800, lng: 0.0500 },
  { commune: 'Flamarens', nom: 'Château de Flamarens', adresse: '32340 Flamarens', categorie: 'Patrimoine', url: 'https://www.chateaudeflamarens.fr/', lat: 43.9800, lng: 0.8150 },
  { commune: 'Gimont', nom: 'Conservatoire de la vie agricole et rurale d\'autrefois', adresse: '32200 Gimont', categorie: 'Patrimoine/Industrie', url: 'https://www.tourisme-occitanie.com/musee-cantonal-et-conservatoire-de-la-vie-agricole-et-rurale-dautrefois/gimont/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8108a7/detail.aspx', lat: 43.6260, lng: 0.8750 },
  { commune: 'Gimont', nom: 'Musée cantonal de Gimont', adresse: '32200 Gimont', categorie: 'Patrimoine', url: 'https://www.tourisme-occitanie.com/musee-cantonal-et-conservatoire-de-la-vie-agricole-et-rurale-dautrefois/gimont/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8108a7/detail.aspx', lat: 43.6265, lng: 0.8755 },
  { commune: 'Gondrin', nom: 'Lavoir de Caubet', adresse: '32330 Gondrin', categorie: 'Patrimoine', url: '', lat: 43.8850, lng: 0.2250 },
  { commune: 'La Romieu', nom: 'Abbaye de La Romieu', adresse: '32480 La Romieu', categorie: 'Patrimoine/Religion', url: 'http://www.la-romieu.com/abbaye-et-cloitre/', lat: 44.0200, lng: 0.5200 },
  { commune: 'La Romieu', nom: 'Lavoir et fontaine gothique de La Romieu', adresse: '32480 La Romieu', categorie: 'Patrimoine', url: 'https://www.tourisme-occitanie.com/lavoir-et-fontaine-gothique-de-la-romieu/la-romieu/tabid/37151/offreid/729f2730-a35c-4f7f-8593-3ab6661454e9/detail.aspx', lat: 44.0210, lng: 0.5210 },
  { commune: 'L\'Isle-Jourdain', nom: 'Musée d\'Art Campanaire', adresse: 'Rue du Musée, 32600 L\'Isle-Jourdain', categorie: 'Art/Patrimoine', url: 'https://www.musee-art-campanaire.com/', lat: 43.6060, lng: 0.9130 },
  { commune: 'Lagardère', nom: 'Château de Lagardère', adresse: '32310 Lagardère', categorie: 'Patrimoine', url: '', lat: 43.8500, lng: 0.3500 },
  { commune: 'Lannepax', nom: 'Lavoir de Lannepax', adresse: '32190 Lannepax', categorie: 'Patrimoine', url: '', lat: 43.8400, lng: 0.1500 },
  { commune: 'Larressingle', nom: 'Camp de siège médiéval de Larressingle', adresse: '32100 Larressingle', categorie: 'Patrimoine/Histoire', url: 'https://www.tourisme-occitanie.com/camp-de-siege-medieval-de-larressingle/larressingle/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b7a2/detail.aspx', lat: 43.9500, lng: 0.3000 },
  { commune: 'Larressingle', nom: 'La Halte du Pèlerin de Larressingle', adresse: '32100 Larressingle', categorie: 'Patrimoine/Histoire', url: '', lat: 43.9505, lng: 0.3005 },
  { commune: 'Lavardens', nom: 'Château de Lavardens', adresse: '32360 Lavardens', categorie: 'Patrimoine', url: 'https://www.chateaudelavardens.fr/', lat: 43.7400, lng: 0.3700 },
  { commune: 'Lectoure', nom: 'Musée archéologique Eugène-Camoreyt', adresse: 'Rue de l\'Ancien Collège, 32700 Lectoure', categorie: 'Patrimoine/Archéologie', url: 'https://www.tourisme-occitanie.com/musee-archeologique-eugene-camoreyt/lectoure/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d4/detail.aspx', lat: 43.9350, lng: 0.6270 },
  { commune: 'Lectoure', nom: 'Monastère Saint-Geny de Lectoure', adresse: '32700 Lectoure', categorie: 'Patrimoine/Religion', url: '', lat: 43.9340, lng: 0.6280 },
  { commune: 'Lectoure', nom: 'Maison Lasseran', adresse: '32700 Lectoure', categorie: 'Patrimoine', url: '', lat: 43.9335, lng: 0.6290 },
  { commune: 'Lectoure', nom: 'Maison des Clarinettes de Lectoure', adresse: '32700 Lectoure', categorie: 'Patrimoine/Art', url: 'https://www.tourisme-occitanie.com/maison-des-clarinettes/lectoure/tabid/37151/offreid/72f44c21-f09c-4861-8406-03f7a4fa430e/detail.aspx', lat: 43.9330, lng: 0.6300 },
];

export async function GET() {
  return NextResponse.json(museesGers);
}

export type Musee = MuseeGers;
