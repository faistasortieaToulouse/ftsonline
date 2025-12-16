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
  // Coordonnées APPROXIMATIVES ajoutées
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
  { commune: "Decazeville", nom: "Association de Sauvegarde du Patrimoine Industriel du Bassin", adresse: "12300 Decazeville", categorie: "Industrie", url: "https://www.tourisme-aveyron.com/fiche/association-de-sauvegarde-du-patrimoine-industriel-du-bassin-de-decazeville-decazeville-fr-2342795/", lat: 44.5720, lng: 2.2610 }
];

export async function GET() {
  return NextResponse.json(museesAveyron);
}

export type Musee = MuseeAveyron;
