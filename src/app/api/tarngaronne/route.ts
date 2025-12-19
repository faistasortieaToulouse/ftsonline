// src/app/api/tarngaronne/route.ts
import { NextResponse } from 'next/server';

interface SiteTG {
  id: number;
  commune: string;
  site: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const tgSites: SiteTG[] = [
  { id: 1, commune: 'Auvillar', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0781, lng: 1.3041 },
  { id: 2, commune: 'Bioule', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0635, lng: 1.5372 },
  { id: 3, commune: 'Bruniquel', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0637, lng: 1.7167 },
  { id: 4, commune: 'Castelsarrasin', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0672, lng: 1.0990 },
  { id: 5, commune: 'Caylus', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0505, lng: 1.8177 },
  { id: 6, commune: 'Dunes', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0182, lng: 1.3975 },
  { id: 7, commune: 'Lacapelle Livron', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0470, lng: 1.2186 },
  { id: 8, commune: 'Laguépie', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0623, lng: 1.7287 },
  { id: 9, commune: 'Lauzerte', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.1305, lng: 1.3638 },
  { id: 10, commune: 'Maubec', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0684, lng: 1.4352 },
  { id: 11, commune: 'Moissac', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0207, lng: 1.3522 },
  { id: 12, commune: 'Montaigu-de-Quercy', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.1274, lng: 1.3876 },
  { id: 13, commune: 'Montauban', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0174, lng: 1.3544 },
  { id: 14, commune: 'Montjoi', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.1360, lng: 1.7475 },
  { id: 15, commune: 'Montpezat-de-Quercy', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.1345, lng: 1.4278 },
  { id: 16, commune: 'Montricoux', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0653, lng: 1.7452 },
  { id: 17, commune: 'Saint-Antonin Noble-Val', site: 'Site emblématique', niveau: 1, categorie: 'incontournable', lat: 44.0931, lng: 1.6992 },
];

export async function GET() {
  return NextResponse.json(tgSites);
}
