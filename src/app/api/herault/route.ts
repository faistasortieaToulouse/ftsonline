import { NextResponse } from 'next/server';

interface SiteHerault {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number;
  lng: number;
}

const heraultSites: SiteHerault[] = [
  { id: 1, commune: "Capestang", description: "Collégiale Saint-Étienne et Château des Archevêques", niveau: 1, categorie: "incontournable", lat: 43.3283, lng: 3.0442 },
  { id: 2, commune: "Nissan-lez-Enserune", description: "Oppidum d'Enserune et Tunnel de Malpas", niveau: 1, categorie: "incontournable", lat: 43.2911, lng: 3.1275 },
  { id: 3, commune: "Béziers", description: "Cathédrale Saint-Nazaire et les 9 Écluses de Fonseranes", niveau: 1, categorie: "incontournable", lat: 43.3442, lng: 3.2158 },
  { id: 4, commune: "Agde", description: "Cathédrale Saint-Étienne en pierre noire et Cité Grecque", niveau: 1, categorie: "incontournable", lat: 43.3108, lng: 3.4758 },
  { id: 5, commune: "Pézenas", description: "Hôtels particuliers et Centre Historique (Molière)", niveau: 1, categorie: "incontournable", lat: 43.4608, lng: 3.4233 },
  { id: 6, commune: "Colombiers", description: "Port sur le Canal du Midi et Église Sainte-Colombe", niveau: 2, categorie: "remarquable", lat: 43.3147, lng: 3.1411 },
  { id: 7, commune: "Sérignan", description: "Musée d'art contemporain MRAC et Collégiale Notre-Dame", niveau: 1, categorie: "incontournable", lat: 43.2817, lng: 3.2794 },
  { id: 8, commune: "Maureilhan", description: "Église Saint-Baudile et architecture circulade", niveau: 1, categorie: "incontournable", lat: 43.3589, lng: 3.1203 },
  { id: 9, commune: "Puisserguier", description: "Château féodal et Écomusée de la Vie d'Autrefois", niveau: 1, categorie: "incontournable", lat: 43.3678, lng: 3.0411 },
  { id: 10, commune: "Cruzy", description: "Église fortifiée Sainte-Eulalie et Musée de Paléontologie", niveau: 1, categorie: "incontournable", lat: 43.3564, lng: 2.9408 },
  { id: 11, commune: "Cessenon-sur-Orb", description: "Donjon médiéval et rives de l'Orb", niveau: 1, categorie: "incontournable", lat: 43.4503, lng: 3.0508 },
  { id: 12, commune: "Roquebrun", description: "Jardin Méditerranéen et Tour médiévale", niveau: 2, categorie: "remarquable", lat: 43.5003, lng: 3.0306 },
  { id: 13, commune: "Roquelongue", description: "Vestiges du Château et panorama sur la vallée", niveau: 1, categorie: "incontournable", lat: 43.5350, lng: 3.1460 },
  { id: 14, commune: "Prémian", description: "Église romane et sentiers de randonnée (Espinouse)", niveau: 2, categorie: "remarquable", lat: 43.5289, lng: 2.8314 },
  { id: 15, commune: "Olargues", description: "Pont du Diable et clocher de l'ancienne église", niveau: 1, categorie: "incontournable", lat: 43.5572, lng: 2.9122 },
  { id: 16, commune: "Cambon-et-Salvergues", description: "Église de l'Espinouse et paysages sauvages", niveau: 3, categorie: "suggéré", lat: 43.6178, lng: 2.8586 },
  { id: 17, commune: "La Tour-sur-Orb", description: "Anciennes usines de chaux et Église Saint-Saturnin", niveau: 1, categorie: "incontournable", lat: 43.6531, lng: 3.1511 },
  { id: 18, commune: "Le Bousquet-d'Orb", description: "Ancien bassin minier et Église Saint-Vincent", niveau: 1, categorie: "incontournable", lat: 43.6931, lng: 3.1672 },
  { id: 19, commune: "Ceilhes-et-Rocozel", description: "Église fortifiée et Lac d'Avène", niveau: 2, categorie: "remarquable", lat: 43.8033, lng: 3.1100 },
  { id: 20, commune: "Lamalou-les-Bains", description: "Architecture thermale Belle Époque", niveau: 2, categorie: "remarquable", lat: 43.5975, lng: 3.0786 },
  { id: 21, commune: "Dio-et-Valquières", description: "Château de Dio (monument historique)", niveau: 2, categorie: "remarquable", lat: 43.6675, lng: 3.2325 },
  { id: 22, commune: "Colombières-sur-Orb", description: "Gorges de Colombières et habitat troglodytique", niveau: 1, categorie: "incontournable", lat: 43.5786, lng: 2.9992 },
  { id: 23, commune: "Vieussan", description: "Village perché médiéval", niveau: 2, categorie: "remarquable", lat: 43.5414, lng: 2.9772 },
  { id: 24, commune: "Causses-et-Veyran", description: "Le site du Pech de la Suque", niveau: 3, categorie: "suggéré", lat: 43.4744, lng: 3.0853 },
  { id: 25, commune: "Laurens", description: "Château de Laurens et terroirs viticoles Faugères", niveau: 1, categorie: "incontournable", lat: 43.5233, lng: 3.1978 },
  { id: 26, commune: "Magalas", description: "Vieux village et Oppidum de Montfo", niveau: 3, categorie: "suggéré", lat: 43.4719, lng: 3.2217 },
  { id: 27, commune: "Vias", description: "Église Saint-Jean-Baptiste en basalte", niveau: 3, categorie: "suggéré", lat: 43.3125, lng: 3.4183 },
  { id: 28, commune: "Bessan", description: "Moulin de Bladier et Église Saint-Pierre", niveau: 3, categorie: "suggéré", lat: 43.3608, lng: 3.4275 },
  { id: 29, commune: "Saint-Thibéry", description: "Abbaye et Pont Romain sur l'Hérault", niveau: 2, categorie: "remarquable", lat: 43.3975, lng: 3.4167 },
  { id: 30, commune: "Nézignan-l'Évêque", description: "Village médiéval en circulade", niveau: 3, categorie: "suggéré", lat: 43.4217, lng: 3.4056 },
  { id: 31, commune: "Castelnau-de-Guers", description: "Château des Barons de Guers et Ermitage Saint-Antoine", niveau: 2, categorie: "remarquable", lat: 43.4350, lng: 3.4386 },
  { id: 32, commune: "Lieuran-lès-Béziers", description: "Château de Libouriac", niveau: 2, categorie: "remarquable", lat: 43.4194, lng: 3.2386 },
  { id: 33, commune: "Saint-Chinian", description: "Abbaye et patrimoine viticole", niveau: 2, categorie: "remarquable", lat: 43.4217, lng: 2.9467 },
  { id: 34, commune: "Cazedarnes", description: "Abbaye de Fontcaude", niveau: 2, categorie: "remarquable", lat: 43.4247, lng: 3.0306 },
  { id: 35, commune: "Thézan-lès-Béziers", description: "Ancien village castral et Château", niveau: 3, categorie: "suggéré", lat: 43.4219, lng: 3.1706 },
  { id: 36, commune: "Pailhès", description: "Vestiges du Château et église romane", niveau: 2, categorie: "remarquable", lat: 43.4286, lng: 3.1186 },
  { id: 37, commune: "Puimisson", description: "Vieux village et Château", niveau: 3, categorie: "suggéré", lat: 43.4397, lng: 3.2069 },
  { id: 38, commune: "Pouzolles", description: "Château de Pouzolles et remparts", niveau: 2, categorie: "remarquable", lat: 43.4831, lng: 3.3131 },
  { id: 39, commune: "Autignac", description: "Village vigneron et patrimoine vernaculaire", niveau: 3, categorie: "suggéré", lat: 43.4994, lng: 3.1692 },
  { id: 40, commune: "Puissalicon", description: "Tour romane et Château", niveau: 2, categorie: "remarquable", lat: 43.4581, lng: 3.2347 },
  { id: 41, commune: "Alignan-du-Vent", description: "Circulade médiévale et Tour", niveau: 2, categorie: "remarquable", lat: 43.4700, lng: 3.3411 },
  { id: 42, commune: "Montblanc", description: "Église Sainte-Eulalie fortifiée", niveau: 2, categorie: "remarquable", lat: 43.3964, lng: 3.3669 },
  { id: 43, commune: "Valros", description: "Tour médiévale de guet", niveau: 3, categorie: "suggéré", lat: 43.4197, lng: 3.3683 },
  { id: 44, commune: "La Salvetat-sur-Agout", description: "Village de montagne, Lac de la Raviège et eaux minérales", niveau: 1, categorie: "incontournable", lat: 43.6008, lng: 2.7036 },
  { id: 45, commune: "Beaufort", description: "Château de Beaufort (XIIe siècle) et panorama Minervois", niveau: 2, categorie: "remarquable", lat: 43.2986, lng: 2.7578 },
  { id: 46, commune: "Montouliers", description: "Village de caractère, calades et panorama sur l'Aude", niveau: 2, categorie: "remarquable", lat: 43.3375, lng: 2.9067 },
  { id: 47, commune: "Douch", description: "Hameau typique du Caroux, départ de randonnée et Mouflons", niveau: 1, categorie: "incontournable", lat: 43.6108, lng: 2.9739 },
  { id: 48, commune: "Margon", description: "Château de Margon (Monument Historique) et jardins", niveau: 1, categorie: "incontournable", lat: 43.4869, lng: 3.3039 },
];

export async function GET() {
  return NextResponse.json(heraultSites);
}
