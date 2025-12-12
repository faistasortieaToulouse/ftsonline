// src/app/api/aude/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données
interface SiteAude {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'Incontournable' | 'Remarquable' | 'Suggéré';
  lat: number;
  lng: number;
}

// Les données complètes des 63 sites de l'Aude, avec coordonnées géographiques
const audeSites: SiteAude[] = [
  { id: 1, commune: "Narbonne", description: "Cathédrale Saint-Just, Basilique Saint-Paul, Abbaye des Monges, Abbaye Sainte-Marie de Fontfroide, Clos de la Lombarde, Les Halles, Via Domitia, Maison de la Narbonnaise", niveau: 1, categorie: "Incontournable", lat: 43.1833, lng: 3.0000 },
  { id: 2, commune: "Carcassonne", description: "Cathédrale Saint-Michel, Basilique Saint-Nazaire, Église Saint-Vincent, La Friche Artistique, Péniche Europ’Odyssée, Centre d’Art Contemporain, Le Hangar Blanc", niveau: 1, categorie: "Incontournable", lat: 43.2133, lng: 2.3486 },
  { id: 3, commune: "Castelnaudary", description: "Collégiale Saint-Michel, Moulin de Cugarel", niveau: 2, categorie: "Remarquable", lat: 43.3172, lng: 1.9547 },
  { id: 4, commune: "Limoux", description: "Basilique Notre-Dame de Marceille", niveau: 1, categorie: "Incontournable", lat: 43.0560, lng: 2.2153 },
  { id: 5, commune: "Sigean", description: "L.A.C. Lieu d’Art Contemporain, Réserve Africaine de Sigean, Oppidum de Pech Maho", niveau: 1, categorie: "Incontournable", lat: 43.0270, lng: 2.9461 },
  { id: 6, commune: "Quillan", description: "Observatoire des Vautours", niveau: 2, categorie: "Remarquable", lat: 42.8718, lng: 2.1972 },
  { id: 7, commune: "Saissac", description: "château et remparts", niveau: 2, categorie: "Remarquable", lat: 43.3429, lng: 2.2227 },
  { id: 8, commune: "Pennautier", description: "Château de Pennautier", niveau: 2, categorie: "Remarquable", lat: 43.2505, lng: 2.3088 },
  { id: 9, commune: "Sallèles-d’Aude", description: "Pont-canal de Cesse, canal de jonction", niveau: 3, categorie: "Suggéré", lat: 43.2386, lng: 2.9247 },
  { id: 10, commune: "Montréal", description: "collégiale Saint-Vincent", niveau: 2, categorie: "Remarquable", lat: 43.1539, lng: 2.1972 },
  { id: 11, commune: "Caunes-Minervois", description: "Abbaye Saint-Pierre-Saint-Paul, Carrière de Marbre du Roy, Ecomusée Marbre et Terroir, Chapelle Notre-Dame du Cros", niveau: 1, categorie: "Incontournable", lat: 43.3333, lng: 2.5167 },
  { id: 12, commune: "Alet-les-Bains", description: "Abbaye d’Alet-les-Bains", niveau: 1, categorie: "Incontournable", lat: 43.0454, lng: 2.2599 },
  { id: 13, commune: "Gruissan", description: "Chapelle Notre-Dame des Auzils et Cimetière Marin", niveau: 1, categorie: "Incontournable", lat: 43.1197, lng: 3.0906 },
  { id: 14, commune: "Rennes-le-Château", description: "château, église Sainte-Marie-Madeleine", niveau: 1, categorie: "Incontournable", lat: 42.9288, lng: 2.2599 },
  { id: 15, commune: "Fanjeaux", description: "Cité Médiévale de Fanjeaux", niveau: 1, categorie: "Incontournable", lat: 43.1903, lng: 2.0558 },
  { id: 16, commune: "Lagrasse", description: "Abbaye Sainte-Marie, Cité Médiévale de Lagrasse", niveau: 1, categorie: "Incontournable", lat: 43.0906, lng: 2.6367 },
  { id: 17, commune: "Montolieu", description: "Abbaye Saint-Jean-Baptiste de Montolieu, Village du Livre", niveau: 1, categorie: "Incontournable", lat: 43.2842, lng: 2.2514 },
  { id: 18, commune: "Le Somail", description: "Maison Bonnal - Parcours Canaux et Rivières", niveau: 1, categorie: "Incontournable", lat: 43.2201, lng: 2.9550 },
  { id: 19, commune: "Saint-Hilaire", description: "Abbaye de Saint-Hilaire", niveau: 1, categorie: "Incontournable", lat: 43.0818, lng: 2.3789 },
  { id: 20, commune: "Saint-Papoul", description: "Abbaye de Saint-Papoul, Collégiale Saint-Michel", niveau: 1, categorie: "Incontournable", lat: 43.3333, lng: 2.0558 },
  { id: 21, commune: "Saint-Polycarpe", description: "Abbaye de Saint-Polycarpe", niveau: 1, categorie: "Incontournable", lat: 43.0336, lng: 2.2922 },
  { id: 22, commune: "Bizanet / Narbonne", description: "Abbaye Sainte-Marie de Fontfroide", niveau: 1, categorie: "Incontournable", lat: 43.1347, lng: 2.9150 }, // Position de l'Abbaye
  { id: 23, commune: "Joucou", description: "Abbaye Sainte-Marie de Joucou", niveau: 1, categorie: "Incontournable", lat: 42.8465, lng: 2.0967 },
  { id: 24, commune: "Saint-Martin-le-Vieil", description: "Abbaye Sainte-Marie de Villelongue", niveau: 1, categorie: "Incontournable", lat: 43.2505, lng: 2.2599 },
  { id: 25, commune: "Molières-sur-l’Alberte", description: "Abbaye Sainte-Marie de Rieunette", niveau: 1, categorie: "Incontournable", lat: 43.0818, lng: 2.3789 },
  { id: 26, commune: "Villeneuve-Minervois", description: "Dolmen du Palet de Roland", niveau: 3, categorie: "Suggéré", lat: 43.2842, lng: 2.4583 },
  { id: 27, commune: "Pépieux", description: "Dolmen des Fades", niveau: 3, categorie: "Suggéré", lat: 43.2842, lng: 2.6533 },
  { id: 28, commune: "Mayronnes", description: "Le Sentier Sculpturel de Mayronnes", niveau: 3, categorie: "Suggéré", lat: 43.0642, lng: 2.5722 },
  { id: 29, commune: "Villar-en-Val", description: "Le Sentier en Poésie", niveau: 3, categorie: "Suggéré", lat: 43.0818, lng: 2.5350 },
  { id: 30, commune: "Vinassan", description: "Maison de la Clape - Parcours Nature", niveau: 3, categorie: "Suggéré", lat: 43.1903, lng: 3.0906 },
  { id: 31, commune: "Servies-en-Val", description: "La Coop’Art - Centre d’Art Contemporain", niveau: 3, categorie: "Suggéré", lat: 43.1197, lng: 2.5533 },
  { id: 32, commune: "Ferrals-les-Corbières", description: "Spiktri Street Art Universe", niveau: 3, categorie: "Suggéré", lat: 43.1287, lng: 2.7567 },
  { id: 33, commune: "Leucate-Plage", description: "Maison de l’Étang de Leucate-Salses", niveau: 3, categorie: "Suggéré", lat: 42.9288, lng: 3.0333 }, // Position approximative de la plage de Leucate
  { id: 34, commune: "Bram", description: "Les Essar[t]s Espace Arts et Cultures", niveau: 3, categorie: "Suggéré", lat: 43.2593, lng: 2.1050 },
  { id: 35, commune: "Paraza", description: "Centre Local d’Art Parazanais - CLAP", niveau: 3, categorie: "Suggéré", lat: 43.2104, lng: 2.8078 },
  { id: 36, commune: "Escouloubre", description: "Grotte de l’Aguzou", niveau: 1, categorie: "Incontournable", lat: 42.7937, lng: 2.2153 },
  { id: 37, commune: "Cabrespine", description: "Gouffre Géant de Cabrespine", niveau: 3, categorie: "Suggéré", lat: 43.3283, lng: 2.4583 },
  { id: 38, commune: "Limousis", description: "Grotte de Limousis", niveau: 3, categorie: "Suggéré", lat: 43.3283, lng: 2.3789 },
  { id: 39, commune: "Fleury", description: "Gouffre de l’Oeil Doux", niveau: 1, categorie: "Incontournable", lat: 43.2677, lng: 3.1233 },
  { id: 40, commune: "Massif de la Clape", description: "Trou de Crouzade", niveau: 1, categorie: "Incontournable", lat: 43.1620, lng: 3.0991 }, // Position centrale du Massif
  { id: 41, commune: "Saint-Laurent-de-la-Cabrerisse", description: "Cascades de la Nielle", niveau: 1, categorie: "Incontournable", lat: 43.0818, lng: 2.7567 },
  { id: 42, commune: "Aragon", description: "église", niveau: 3, categorie: "Suggéré", lat: 43.2842, lng: 2.3533 },
  { id: 43, commune: "Bages", description: "église", niveau: 3, categorie: "Suggéré", lat: 43.1287, lng: 2.9772 },
  { id: 44, commune: "Chalabre", description: "château, cité médiévale", niveau: 2, categorie: "Remarquable", lat: 42.9859, lng: 2.0050 },
  { id: 45, commune: "Cucugnan", description: "moulin", niveau: 3, categorie: "Suggéré", lat: 42.8465, lng: 2.6936 },
  { id: 46, commune: "Duilhac-sous-Peyrepertuse (ou Duilhac)", description: "gorges, château", niveau: 2, categorie: "Remarquable", lat: 42.8550, lng: 2.5800 },
  { id: 47, commune: "Roquefère", description: "château, cascade", niveau: 1, categorie: "Incontournable", lat: 43.3000, lng: 2.4833 },
  { id: 48, commune: "La Pomarède", description: "château", niveau: 3, categorie: "Suggéré", lat: 43.3765, lng: 1.9647 },
  { id: 49, commune: "Montmaur", description: "château, mont", niveau: 3, categorie: "Suggéré", lat: 43.3333, lng: 1.9547 },
  { id: 50, commune: "Laurac", description: "remparts, église", niveau: 3, categorie: "Suggéré", lat: 43.2505, lng: 1.9264 },
  { id: 51, commune: "Cazalrenoux", description: "chapelle", niveau: 3, categorie: "Suggéré", lat: 43.2201, lng: 1.9647 },
  { id: 52, commune: "Bellegarde-du-Razès", description: "circulade", niveau: 3, categorie: "Suggéré", lat: 43.1539, lng: 2.0558 },
  { id: 53, commune: "Villasevary", description: "château, chapelle", niveau: 3, categorie: "Suggéré", lat: 43.1903, lng: 2.2922 },
  { id: 54, commune: "La Tourette-Cabardès", description: "deux églises", niveau: 3, categorie: "Suggéré", lat: 43.3680, lng: 2.3789 },
  { id: 55, commune: "Mas-Cabardès", description: "château, deux églises", niveau: 3, categorie: "Suggéré", lat: 43.3429, lng: 2.3789 },
  { id: 56, commune: "Lespinassière", description: "château, église", niveau: 3, categorie: "Suggéré", lat: 43.3429, lng: 2.4583 },
  { id: 57, commune: "Peyriac-Minervois", description: "château, remparts", niveau: 3, categorie: "Suggéré", lat: 43.2842, lng: 2.6533 },
  { id: 58, commune: "Argens-Minervois", description: "château, église", niveau: 3, categorie: "Suggéré", lat: 43.2505, lng: 2.7661 },
  { id: 59, commune: "Le Somail (doublon, déjà présent)", description: "entrepôts du canal du Midi", niveau: 2, categorie: "Remarquable", lat: 43.2201, lng: 2.9550 },
  { id: 60, commune: "Espéraza", description: "musée des dinosaures et traces de pas", niveau: 2, categorie: "Remarquable", lat: 42.9379, lng: 2.2227 },
  { id: 61, commune: "Port-la-Nouvelle", description: "musée de la baleine, église", niveau: 3, categorie: "Suggéré", lat: 43.0270, lng: 3.0414 },
  { id: 62, commune: "Couiza", description: "château", niveau: 3, categorie: "Suggéré", lat: 42.9567, lng: 2.2599 },
  { id: 63, commune: "Cuxac-Cabardès", description: "église", niveau: 3, categorie: "Suggéré", lat: 43.3680, lng: 2.3088 },
];

export async function GET() {
  return NextResponse.json(audeSites);
}
