import { NextResponse } from 'next/server';

interface SiteHautesPyrenees {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const hpSites: SiteHautesPyrenees[] = [
  { id: 1, commune: 'Tarbes', site: 'Jardin Massey et Haras National', niveau: 1, categorie: 'incontournable', lat: 43.233, lng: 0.072 },
  { id: 2, commune: 'Lourdes', site: 'Sanctuaire et Château Fort', niveau: 1, categorie: 'incontournable', lat: 43.097, lng: -0.046 },
  { id: 3, commune: 'Arreau', site: 'Maison des Lys et confluent des vallées', niveau: 1, categorie: 'incontournable', lat: 42.905, lng: 0.358 },
  { id: 4, commune: 'Trie-sur-Baïse', site: 'Place de la Mairie et Monastère des Carmes', niveau: 1, categorie: 'incontournable', lat: 43.321, lng: 0.341 },
  { id: 5, commune: 'Monléon-Magnoac', site: 'Collégiale et village perché', niveau: 2, categorie: 'remarquable', lat: 43.282, lng: 0.504 },
  { id: 6, commune: 'Mauléon-Barousse', site: 'Château de Bramevaque et patrimoine pastoral', niveau: 2, categorie: 'remarquable', lat: 42.959, lng: 0.561 },
  { id: 7, commune: 'Arrens-Marsous', site: 'Chapelle de Pouey-Laün et porte du Val d’Azun', niveau: 1, categorie: 'incontournable', lat: 42.955, lng: -0.213 },
  { id: 8, commune: 'Gavarnie', site: 'Cirque de Gavarnie (UNESCO)', niveau: 1, categorie: 'incontournable', lat: 42.736, lng: -0.010 },
  { id: 9, commune: 'Cauterets', site: 'Pont d’Espagne et Parc National', niveau: 1, categorie: 'incontournable', lat: 42.889, lng: -0.114 },
  { id: 10, commune: 'Bagnères-de-Bigorre', site: 'Thermes et Grand Tourmalet', niveau: 1, categorie: 'incontournable', lat: 43.065, lng: 0.150 },
  { id: 11, commune: 'Saint-Savin', site: 'Abbatiale romane et panorama', niveau: 1, categorie: 'incontournable', lat: 42.981, lng: -0.120 },
  { id: 12, commune: 'La Mongie', site: 'Pic du Midi de Bigorre', niveau: 1, categorie: 'incontournable', lat: 42.909, lng: 0.177 },
];

export async function GET() {
  return NextResponse.json(hpSites);
}
