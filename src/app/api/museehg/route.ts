// src/app/api/museehg/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un musée
export interface MuseeHG {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données des musées de la Haute-Garonne (31) avec coordonnées approximatives.
// Règles de capitalisation appliquées (première lettre majuscule, reste minuscule)
const museesHG: MuseeHG[] = [
  { commune: 'Auterive', nom: 'Fondation rené pous', categorie: 'Art', adresse: 'Les Escloupiès, route de Grépiac, 31190 Auterive', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/fondation-rene-pous-956718', lat: 43.3508, lng: 1.4883 },
  { commune: 'Carbonne', nom: 'Musée andré abbal', categorie: 'Art', adresse: '10 rue du sculpteur Abbal, 31390 Carbonne', url: 'http://www.ville-carbonne.fr/Musee-Abbal.html', lat: 43.2848, lng: 1.2294 },
  { commune: 'Mazères-sur-salat', nom: 'Musée de rizla croix', categorie: 'Art', adresse: 'Rue du Stade, 31260 Mazères-sur-Salat', url: 'http://www.tourisme-occitanie.com/musee-rizla-croix/mazeres-sur-salat', lat: 43.1095, lng: 1.0505 },
  { commune: 'Saint-frajou', nom: 'Musée de peinture de saint-frajou', categorie: 'Art', adresse: 'Place de la Mairie, 31230 Saint-Frajou', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-de-peinture-955606', lat: 43.2505, lng: 0.8142 },
  { commune: 'Saint-frajou', nom: 'Musée de peinture de saint-frajou', categorie: 'Art', adresse: 'Place de la Mairie, 31230 Saint-Frajou', url: 'http://www.musee-saint-frajou.com/', lat: 43.2505, lng: 0.8142 },
  { commune: 'Saint-gaudens', nom: 'Musée - arts & figures des pyrénées centrales', categorie: 'Art', adresse: '35 Boulevard Jean Bepmale, 31800 Saint-Gaudens', url: 'https://musees-occitanie.fr/musees/le-musee-arts-et-figures-des-pyrenees-centrales/', lat: 43.1030, lng: 0.6975 },
  { commune: 'Aurignac', nom: 'Musée de l\'aurignacien', categorie: 'Histoire', adresse: 'Avenue de Bénabarre, 31420 Aurignac', url: 'http://www.musee-aurignacien.com/', lat: 43.2105, lng: 0.8875 },
  { commune: 'Martres-tolosane', nom: 'Musée archéologique du donjon', categorie: 'Histoire', adresse: 'Angonia, Place Henri Dulion, 31220 Martres-Tolosane', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-archeologique-du-donjon-955681', lat: 43.2215, lng: 1.0028 },
  { commune: 'Montmaurin', nom: 'Villa gallo-romaine de montmaurin', categorie: 'Histoire', adresse: '1 route de Blajan, 31350 Montmaurin', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/villa-gallo-romaine-956640', lat: 43.1979, lng: 0.6698 },
  { commune: 'Saint-bertrand-de-comminges', nom: 'Musée archéologique de saint-bertrand-de-comminges', categorie: 'Histoire', adresse: '40 rue Victor Cazes, 31510 Saint-Bertrand-de-Comminges', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/le-musee-archeologique-departemental-956743', lat: 43.0298, lng: 0.6729 },
  { commune: 'Saint-bertrand-de-comminges', nom: 'Site antique de lugdunum', categorie: 'Histoire', adresse: '31510 Saint-Bertrand-de-Comminges', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/site-antique-956644', lat: 43.0305, lng: 0.6735 },
  { commune: 'Blajan', nom: 'Musée de la tuile de blajan', categorie: 'Industrie', adresse: '21 Village, 31350 Blajan', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-de-la-tuile-956774', lat: 43.2505, lng: 0.6300 },
  { commune: 'Génos', nom: 'Cité des abeilles', categorie: 'Industrie', adresse: 'GAEC Ruchers Sainte Marie Morlière et Fils, 31510 Génos', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/cite-des-abeilles-2493614', lat: 43.0858, lng: 0.6405 },
  { commune: 'Revel', nom: 'Musée du bois et de la marquetrie', categorie: 'Industrie', adresse: '13 rue Jean Moulin, 31250 Revel', url: 'http://www.museedubois.com/', lat: 43.4687, lng: 2.0076 },
  { commune: 'Villemur-sur-tarn', nom: 'Usinotopie', categorie: 'Loisirs, spectacles', adresse: '267 Route de Busque, 81300 Graulhet (Tarn)', url: 'http://www.lusinotopie.fr/', lat: 43.8340, lng: 1.9960 },
  { commune: 'Villaudric', nom: 'Château de cazes', categorie: 'Monuments', adresse: '45 rue Négrette, 31620 Villaudric', url: 'http://www.hautegaronnetourisme.com/preparer/manger-deguster/visites-gourmandes/chateau-caze-957701', lat: 43.7915, lng: 1.3965 },
  { commune: 'Laréole', nom: 'Château de laréole', categorie: 'Monuments', adresse: 'Place du Village, 31480 Laréole', url: 'http://www.haute-garonne.fr/proximite/decouvrir/chateau-de-lareole', lat: 43.7664, lng: 1.0961 },
  { commune: 'Loubens-lauragais', nom: 'Château de loubens', categorie: 'Monuments', adresse: 'Château de Loubens, 31460 Loubens-Lauragais', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/chateau-et-parc-de-loubens-lauragais-388777', lat: 43.5855, lng: 1.8791 },
  { commune: 'Valcabrère', nom: 'Basilique saint-just de valcabrère', categorie: 'Monuments', adresse: '4 Saint-Just, 31510 Valcabrère', url: 'https://fr.wikipedia.org/wiki/Basilique_Saint-Just_de_Valcabr%C3%A8re', lat: 43.0330, lng: 0.6780 },
  { commune: 'Auterive', nom: 'Musée des vieux outils', categorie: 'Patrimoine', adresse: '5 rue Camille Pissarro, 31190 Auterive', url: 'http://www.musee-des-vieux-outils.org/', lat: 43.3440, lng: 1.4880 },
  { commune: 'Avignonet-lauraguais', nom: 'Maison de haute-garonne à port-lauragais', categorie: 'Patrimoine', adresse: 'Aire de Port Lauragais, Autoroute A61, 31290 Avignonet-Lauraguais', url: 'http://www.hautegaronnetourisme.com/la-maison-de-la-haute-garonne', lat: 43.3645, lng: 1.7010 },
  { commune: 'Bagnères-de-luchon', nom: 'Musée du pays de luchon', categorie: 'Patrimoine', adresse: '18 Allée d\'Étigny, 31110 Bagnères-de-Luchon', url: 'http://www.luchon.com/musee-du-pays-de-luchon/bagneres-de-luchon/tabid/37151/offreid/72546b9c-6eb2-4b2e-af77-a546d8376820/detail.aspx', lat: 42.7885, lng: 0.5900 },
  { commune: 'Bagnères-de-luchon', nom: 'Musée de l\'hospice de france', categorie: 'Patrimoine', adresse: 'Route de l\'Hospice de France, 31110 Bagnères-de-Luchon', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-de-l-hospice-de-france-955463', lat: 42.7560, lng: 0.5950 },
  { commune: 'Boussan', nom: 'Maison patrimoniale de barthète', categorie: 'Patrimoine', adresse: 'Lieu-dit Barthète, 31420 Boussan', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/maison-patrimoniale-de-barthete-956719', lat: 43.2085, lng: 0.8805 },
  { commune: 'Cazères-sur-garonne', nom: 'Espace muséographique de cazères (maison garonne)', categorie: 'Patrimoine', adresse: '7 boulevard des Pyrénées, 31220 Cazères-sur-Garonne', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/maison-garonne-2450849', lat: 43.2205, lng: 1.0772 },
  { commune: 'Fos', nom: 'Maison du pays de l\'ours', categorie: 'Patrimoine', adresse: 'Place de la Mairie, 31440 Fos', url: 'http://www.paysdelours.com/fr/communes-adet/fos/', lat: 42.8250, lng: 0.6860 },
  { commune: 'Montferrand', nom: 'Seuil du naurouze', categorie: 'Patrimoine', adresse: '31290 Montferrand', url: 'https://fr.wikipedia.org/wiki/Seuil_de_Naurouze', lat: 43.3440, lng: 1.8340 },
  { commune: 'Puymaurin', nom: 'Musée du jamais vu', categorie: 'Patrimoine', adresse: 'Le Village, 31230 Puymaurin', url: 'http://www.grandsudinsolite.fr/1649-31-haute-garonne-le-musee-du-jamais-vu.html', lat: 43.3765, lng: 0.8355 },
  { commune: 'Vaudreuille', nom: 'Musée et jardins du canal du midi', categorie: 'Patrimoine', adresse: '1410 Route du Lac de Saint-Ferréol, 31250 Vaudreuille (proche de Revel)', url: 'http://museecanaldumidi31.blogspot.com/', lat: 43.4350, lng: 2.0100 },
  { commune: 'Rieux-volvestre', nom: 'Musées de rieux-volvestre', categorie: 'Patrimoine', adresse: 'Rue de l\'Évêché, 31310 Rieux-Volvestre', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/les-musees-de-rieux-956729', lat: 43.2845, lng: 1.2000 },
  { commune: 'Saint-bertrand-de-comminges', nom: 'Musée des blasons et ordres de la chevalerie', categorie: 'Patrimoine', adresse: '31510 Saint-Bertrand-de-Comminges', url: 'https://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-du-blason-et-des-ordres-de-chevalerie-957269', lat: 43.0298, lng: 0.6729 },
  { commune: 'Nailloux', nom: 'Legend gallery du stade toulousain', categorie: 'Sport', adresse: 'Village des Marques de Nailloux (près du Club 15), 31560 Nailloux', url: 'https://brasserieclub15.business.site/', lat: 43.3745, lng: 1.5835 },
  { commune: 'Bagnères-de-luchon', nom: 'Musée léon elissalde de l\'aéronautique', categorie: 'Transport', adresse: '16 Boulevard Charles de Gaulle, 31110 Bagnères-de-Luchon', url: 'http://www.hautegaronnetourisme.com/preparer/voir-faire/culture-et-patrimoine/musee-de-l-aeronautique-leon-elissalde-956773', lat: 42.7885, lng: 0.5900 },
  { commune: 'Revel', nom: 'Musée de l\'aviation légère de la montagne noire', categorie: 'Transport', adresse: 'Aérodrome de Revel - Belloc, 31250 Revel', url: 'http://www.mairie-revel.fr/bouger-sortir/musees/musee-de-l-aviation-legere/', lat: 43.4560, lng: 2.0120 },
  { commune: 'Saint-aventin', nom: 'Musée du train à crémaillères', categorie: 'Transport', adresse: 'Lieu-dit Superbagnères, 31110 Saint-Aventin (accès par télécabine/route depuis Bagnères-de-Luchon)', url: 'http://www.luchon.com/musee-du-grand-hotel-et-du-train-a-cremaillere/superbagneres/tabid/37151/offreid/2e93e157-27a5-4cb3-a50c-d6430345a1da/detail.aspx', lat: 42.7805, lng: 0.5890 },
];

export async function GET() {
  return NextResponse.json(museesHG);
}

// Exportez le type pour l'utiliser dans page.tsx
export type Musee = MuseeHG;
