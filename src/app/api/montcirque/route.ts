// src/app/api/montcirque/route.ts
import { NextResponse } from 'next/server';

// Interface pour tous les types de points d'intérêt
export interface MontCirquePOI {
    id: number;
    name: string;
    type: 'pic' | 'cirque' | 'autre'; // Type de point (Pic ou Cirque)
    massif: string;
    department: string;
    altitude: number | null; // Altitude en mètres (null pour les cirques si non pertinent)
    lat: number;
    lng: number;
    description: string;
}

const montCirquePOIs: MontCirquePOI[] = [
    // --- PICS & MONTAGNES (> 3000m) ---
    { id: 1, name: "Vignemale (Grand Vignemale)", type: 'pic', massif: "Massif du Vignemale", department: "Hautes-Pyrénées (65)", altitude: 3298, lat: 42.783, lng: 0.147, description: "Plus haut sommet des Pyrénées françaises hors zone frontalière immédiate." },
    { id: 2, name: "Pic Long", type: 'pic', massif: "Massif du Néouvielle", department: "Hautes-Pyrénées (65)", altitude: 3194, lat: 42.846, lng: 0.165, description: "Un des plus hauts sommets du massif du Néouvielle." },
    { id: 3, name: "Pic de Campbieil", type: 'pic', massif: "Massif du Néouvielle", department: "Hautes-Pyrénées (65)", altitude: 3173, lat: 42.836, lng: 0.208, description: "Sommet majeur du massif de Campbieil." },
    { id: 4, name: "Pic du Néouvielle", type: 'pic', massif: "Massif du Néouvielle", department: "Hautes-Pyrénées (65)", altitude: 3091, lat: 42.855, lng: 0.134, description: "Offre un panorama exceptionnel sur le Néouvielle." },

    // --- PICS CÉLÈBRES (Altitude intermédiaire) ---
    { id: 5, name: "Pic du Midi de Bigorre", type: 'pic', massif: "Pyrénées", department: "Hautes-Pyrénées (65)", altitude: 2877, lat: 42.924, lng: 0.155, description: "Célèbre pour son observatoire astronomique." },
    { id: 6, name: "Mont Valier", type: 'pic', massif: "Couserans", department: "Ariège (09)", altitude: 2838, lat: 42.845, lng: 1.050, description: "Sommet emblématique et montagne sacrée de l'Ariège." },
    { id: 7, name: "Pic des Trois Seigneurs", type: 'pic', massif: "Pyrénées", department: "Ariège (09)", altitude: 2199, lat: 42.880, lng: 1.346, description: "Randonnée très populaire avec vue sur la chaîne des Pyrénées." },
    { id: 8, name: "Pic Saint-Barthélemy", type: 'pic', massif: "Massif de Tabe", department: "Ariège (09)", altitude: 2348, lat: 42.835, lng: 1.834, description: "Magnifique vue sur le massif de Tabe et ses lacs." },
    { id: 9, name: "Pic de Nore", type: 'pic', massif: "Montagne Noire", department: "Aude (11) / Tarn (81)", altitude: 1211, lat: 43.435, lng: 2.379, description: "Point culminant de la Montagne Noire, reconnaissable à son antenne." },
    { id: 10, name: "Mont Caroux", type: 'pic', massif: "Massif du Caroux", department: "Hérault (34)", altitude: 1091, lat: 43.590, lng: 2.943, description: "Surnommé la 'Montagne de Lumière', célèbre pour ses gorges." },
    
    // --- CIRQUES ---
    { id: 11, name: "Cirque de Gavarnie", type: 'cirque', massif: "Massif du Mont-Perdu", department: "Hautes-Pyrénées (65)", altitude: null, lat: 42.693, lng: 0.003, description: "Le plus célèbre d'Europe. Inscrit au patrimoine mondial de l'UNESCO." },
    { id: 12, name: "Cirque de Troumouse", type: 'cirque', massif: "Pyrénées", department: "Hautes-Pyrénées (65)", altitude: null, lat: 42.748, lng: 0.170, description: "L'un des plus grands cirques d'Europe par sa largeur (11 km de circonférence)." },
    { id: 13, name: "Cirque d'Estaubé", type: 'cirque', massif: "Pyrénées", department: "Hautes-Pyrénées (65)", altitude: null, lat: 42.715, lng: 0.088, description: "Le plus sauvage des trois grands cirques du Pays Toy." },
    { id: 14, name: "Cirque de Cagateille", type: 'cirque', massif: "Couserans", department: "Ariège (09)", altitude: null, lat: 42.802, lng: 1.258, description: "Situé au-dessus de la vallée d'Aulus-les-Bains." },
    
    // --- CIRQUES DU LOT ---
    { id: 15, name: "Cirque d'Autoire", type: 'cirque', massif: "Causses du Quercy", department: "Lot (46)", altitude: null, lat: 44.862, lng: 1.821, description: "Cirque d'érosion calcaire abritant une célèbre cascade." }, // VIRGULE MANQUANTE CORRIGÉE ICI

    // --- CIRQUES PYRÉNÉENS ET CAUSSES ---
    { id: 16, name: "Cirque d'Anglade", type: 'cirque', massif: "Massif de l'Aston", department: "Ariège (09)", altitude: null, lat: 42.721, lng: 1.825, description: "Cirque glaciaire isolé et sauvage, connu pour ses lacs d'altitude et sa faune." },
    { id: 17, name: "Cirque du Litor", type: 'cirque', massif: "Massif du Litor", department: "Hautes-Pyrénées (65)", altitude: null, lat: 42.925, lng: -0.117, description: "Grande courbe spectaculaire sur la route du Col d'Aubisque, offrant des panoramas alpins." },
    { id: 18, name: "Cirque du Lys", type: 'cirque', massif: "Massif du Lys", department: "Hautes-Pyrénées (65)", altitude: null, lat: 42.880, lng: -0.178, description: "Vaste cirque glaciaire abritant la station de ski de Cauterets-Lys." },
    { id: 19, name: "Cirque de Tournemire", type: 'cirque', massif: "Causses du Larzac", department: "Aveyron (12)", altitude: null, lat: 43.957, lng: 3.120, description: "Cirque d'érosion typique du Causse, abritant le château de Tournemire." },
    { id: 20, name: "Cirque de Saint-Paul-des-Fonts", type: 'cirque', massif: "Causses du Larzac", department: "Aveyron (12)", altitude: null, lat: 43.832, lng: 3.065, description: "Début des Gorges de la Dourbie, formation géologique impressionnante." },
    { id: 21, name: "Cirque de Vénès", type: 'cirque', massif: "Causses du Quercy", department: "Lot (46)", altitude: null, lat: 44.475, lng: 1.635, description: "Dépression karstique / Vallée morte. Tête d'une vallée fluviale asséchée." },
    { id: 22, name: "Cirque de Tour de Faure", type: 'cirque', massif: "Causses du Quercy", department: "Lot (46)", altitude: null, lat: 44.455, lng: 1.670, description: "Vallon encaissé près de Saint-Cirq Lapopie. Falaises surplombant la boucle du Lot." },
    { id: 23, name: "Cirque de Saint-Marcel", type: 'cirque', massif: "Causses du Larzac", department: "Aveyron (12)", altitude: null, lat: 43.945, lng: 3.208, description: "Large dépression karstique dominée par des falaises au bord du plateau du Larzac (Sainte-Eulalie-de-Cernon)." },
    { id: 24, name: "Cirque de Montfaucon", type: 'cirque', massif: "Gorges du Tarn", department: "Aveyron (12)", altitude: null, lat: 44.257, lng: 3.111, description: "Petit cirque marquant l'entrée des Gorges du Tarn à l'ouest." },
    { id: 25, name: "Cirque de Boussac", type: 'cirque', massif: "Monts de Lacaune", department: "Tarn (81)", altitude: null, lat: 43.715, lng: 2.620, description: "Vaste dépression dans la zone granitique des Monts de Lacaune." },
    { id: 26, name: "Cirque de Pessons", type: 'cirque', massif: "Massif du Carlit", department: "Pyrénées-Orientales (66)", altitude: null, lat: 42.553, lng: 1.765, description: "Ensemble de cirques glaciaires et de lacs d'altitude, très prisé pour la randonnée." },
    { id: 27, name: "Cirque de la Madeleine", type: 'cirque', massif: "Gorges de l'Aveyron", department: "Tarn-et-Garonne (82)", altitude: null, lat: 44.150, lng: 1.940, description: "Méandre de rivière encaissé avec des falaises créant une courbe serrée et spectaculaire." },

// --- PICS ET MASSIFS DES PYRÉNÉES-ORIENTALES (66) ---
    { id: 28, name: "Pic Carlit", type: 'pic', massif: "Massif du Carlit", department: "Pyrénées-Orientales (66)", altitude: 2921, lat: 42.585, lng: 1.838, description: "Point culminant du département des Pyrénées-Orientales (66) et du Massif du Carlit." },
    { id: 29, name: "Pic du Canigou", type: 'pic', massif: "Massif du Canigou", department: "Pyrénées-Orientales (66)", altitude: 2784, lat: 42.549, lng: 2.470, description: "Montagne sacrée des Catalans, emblème du Roussillon." },
    { id: 30, name: "Pic de Madrès", type: 'pic', massif: "Massif du Madres", department: "Aude (11) / Pyrénées-Orientales (66)", altitude: 2469, lat: 42.790, lng: 2.140, description: "Point culminant du Massif du Madrès, à la limite de l'Aude." },
    { id: 31, name: "Pic du Néoulous", type: 'pic', massif: "Massif des Albères", department: "Pyrénées-Orientales (66)", altitude: 1256, lat: 42.479, lng: 3.018, description: "Point culminant du Massif des Albères, marquant l'extrémité orientale de la chaîne des Pyrénées près de la Méditerranée." },
    { id: 32, name: "Massif du Capcir", type: 'autre', massif: "Massif du Carlit", department: "Pyrénées-Orientales (66)", altitude: 1600, lat: 42.665, lng: 2.050, description: "Vaste plateau d'altitude, réputé pour ses lacs et stations de ski de fond." },

// --- PETITS MASSIFS ---
    { id: 33, name: "Plateau de l'Aubrac", type: 'autre', massif: "Massif de l'Aubrac", department: "Aveyron (12)", altitude: 1350, lat: 44.671, lng: 2.923, description: "Point représentant la partie Aveyronnaise du Massif de l'Aubrac, vaste plateau de pâturages et de lacs volcaniques." },
    { id: 34, name: "Peyro Clabado", type: 'autre', massif: "Massif du Sidobre", department: "Tarn (81)", altitude: 600, lat: 43.626, lng: 2.378, description: "Le Massif du Sidobre, connu comme 'la Montagne de granit', présente des formations rocheuses remarquables comme le Peyro Clabado (rocher cloué)." },
    { id: 35, name: "Massif d'Arbas", type: 'autre', massif: "Massif d'Arbas", department: "Haute-Garonne (31)", altitude: 1100, lat: 43.003, lng: 0.898, description: "Massif calcaire dans les Pré-Pyrénées, connu pour ses grottes et son karst." },
    { id: 36, name: "Massif d'Ardiden", type: 'autre', massif: "Massif d'Ardiden", department: "Hautes-Pyrénées (65)", altitude: 2988, lat: 42.846, lng: -0.100, description: "Massif des Hautes-Pyrénées, dominé par le Pic d'Ardiden." },
    { id: 37, name: "Massif de Bassiès", type: 'autre', massif: "Massif de Bassiès", department: "Ariège (09)", altitude: 2750, lat: 42.812, lng: 1.341, description: "Situé dans le Parc naturel régional des Pyrénées Ariégeoises, réputé pour ses nombreux étangs." },
    { id: 38, name: "Massif de Batchimale", type: 'autre', massif: "Massif de Batchimale", department: "Hautes-Pyrénées (65) / Hte-Garonne (31)", altitude: 3177, lat: 42.756, lng: 0.435, description: "Massif transfrontalier avec le Pic de Batchimale (ou Grand Batchimale) comme point culminant." },
    { id: 39, name: "Massif de Cauterets", type: 'autre', massif: "Massif de Cauterets", department: "Hautes-Pyrénées (65)", altitude: 3298, lat: 42.816, lng: -0.197, description: "Massif comprenant le Vignemale, offrant des paysages de haute montagne, de lacs et de glaciers." },
    { id: 40, name: "Massif de l'Arbizon", type: 'autre', massif: "Massif de l'Arbizon", department: "Hautes-Pyrénées (65) / Hte-Garonne (31)", altitude: 2831, lat: 42.923, lng: 0.354, description: "Situé entre les vallées d'Aure et de Campan, facilement reconnaissable par sa forme pyramidale." },
    { id: 41, name: "Massif de l'Arize", type: 'autre', massif: "Massif de l'Arize", department: "Ariège (09)", altitude: 1680, lat: 42.969, lng: 1.378, description: "Massif calcaire de moyenne montagne en Ariège, s'étendant au nord du Massif des Trois-Seigneurs." },
    { id: 42, name: "Massif de Lascours", type: 'autre', massif: "Massif de Lascours", department: "Hautes-Pyrénées (65)", altitude: 2360, lat: 42.918, lng: 0.228, description: "Massif situé à l'ouest du Pic du Midi de Bigorre, zone de pâturages d'altitude." },
    { id: 43, name: "Massif de Lherz", type: 'autre', massif: "Massif de Lherz", department: "Ariège (09)", altitude: 1300, lat: 42.887, lng: 1.489, description: "Petit massif connu pour son minerai de lherzolite, roche magmatique rare." },
    { id: 44, name: "Massif de Perdiguère", type: 'autre', massif: "Massif de Perdiguère", department: "Haute-Garonne (31)", altitude: 3222, lat: 42.723, lng: 0.551, description: "Situé sur la frontière franco-espagnole, abritant le Pic de Perdiguère, le plus haut de la Haute-Garonne." },
    { id: 45, name: "Massif de Tabe", type: 'autre', massif: "Massif de Tabe", department: "Ariège (09)", altitude: 2368, lat: 42.875, lng: 1.777, description: "Massif de l'Est Ariègeois, dominé par le Pic de Saint-Barthélemy." },
    { id: 46, name: "Massif des Corbières", type: 'autre', massif: "Massif des Corbières", department: "Aude (11)", altitude: 1230, lat: 42.972, lng: 2.500, description: "Massif calcaire des Pré-Pyrénées audoises et catalanes, connu pour ses vignobles et ses châteaux cathares." },
    { id: 47, name: "Massif des Trois-Seigneurs", type: 'autre', massif: "Massif des Trois-Seigneurs", department: "Ariège (09)", altitude: 2199, lat: 42.894, lng: 1.385, description: "Massif central de l'Ariège, offrant des vues panoramiques sur la chaîne pyrénéenne." },
    { id: 48, name: "Massif du Carlit", type: 'autre', massif: "Massif du Carlit", department: "Pyrénées-Orientales (66) / Ariège (09)", altitude: 2921, lat: 42.585, lng: 1.838, description: "Cœur du Capcir et de la Cerdagne, caractérisé par une grande concentration de lacs d'altitude." },
    { id: 49, name: "Massif du Montcalm", type: 'autre', massif: "Massif du Montcalm", department: "Ariège (09)", altitude: 3143, lat: 42.651, lng: 1.408, description: "Massif frontalier abritant plusieurs sommets de plus de 3000 mètres, dont le Pic du Montcalm." },
    { id: 50, name: "Massif du Néouvielle", type: 'autre', massif: "Massif du Néouvielle", department: "Hautes-Pyrénées (65)", altitude: 3091, lat: 42.825, lng: 0.170, description: "Massif granitique et réserve naturelle, célèbre pour ses pins à crochets, ses lacs et son Pic de Néouvielle." },
    { id: 51, name: "Massif du Plantaurel", type: 'autre', massif: "Massif du Plantaurel", department: "Ariège (09)", altitude: 940, lat: 43.080, lng: 1.580, description: "Chaîne de collines et de montagnes calcaires, formant la barrière nord des Pyrénées Ariégeoises." },
    { id: 52, name: "Massif du Vignemale", type: 'autre', massif: "Massif du Vignemale", department: "Hautes-Pyrénées (65)", altitude: 3298, lat: 42.775, lng: -0.157, description: "Point culminant des Pyrénées françaises (Pic du Vignemale) et abritant le Glacier d'Ossoue." },
    { id: 53, name: "Petites Pyrénées", type: 'autre', massif: "Petites Pyrénées", department: "Haute-Garonne (31) / Ariège (09)", altitude: 800, lat: 43.150, lng: 1.090, description: "Chaîne de collines marquant le passage entre les plaines de Garonne et les hautes Pyrénées." },
    { id: 54, name: "Plateau de Beille", type: 'autre', massif: "Plateau de Beille", department: "Ariège (09)", altitude: 1800, lat: 42.750, lng: 1.760, description: "Plateau d'altitude en Ariège, réputé pour son domaine de ski de fond et ses ascensions cyclistes." },
    
    // --- AUTRES MASSIFS (Hors Pyrénées) ---
    { id: 55, name: "Montagne Noire", type: 'autre', massif: "Montagne Noire", department: "Aude (11) / Tarn (81) / Hérault (34)", altitude: 1211, lat: 43.430, lng: 2.500, description: "Extrémité sud-ouest du Massif Central, marquant le partage des eaux entre Atlantique et Méditerranée." },
    { id: 56, name: "Montagne d'Alaric", type: 'autre', massif: "Montagne d'Alaric", department: "Aude (11)", altitude: 600, lat: 43.150, lng: 2.450, description: "Massif calcaire isolé dans les Corbières, associé à la légende du roi Wisigoth Alaric II." },
    { id: 57, name: "Massif de la Clape", type: 'autre', massif: "Massif de la Clape", department: "Aude (11)", altitude: 214, lat: 43.150, lng: 3.160, description: "Ancienne île calcaire, aujourd'hui rattachée au continent, connue pour ses falaises et ses vignobles face à la Méditerranée." },
    { id: 58, name: "Sarrat de la Bernède", type: 'autre', massif: "Massif de Tabe", department: "Aude (11)", altitude: 1500, lat: 42.920, lng: 1.950, description: "Partie audoise du Massif de Tabe/Saint-Barthélemy, souvent intégrée aux Pré-Pyrénées audoises." },
    { id: 59, name: "Colline de Fanjeaux", type: 'autre', massif: "Plateau de la Piège / Fangar", department: "Aude (11)", altitude: 450, lat: 43.140, lng: 2.050, description: "Collines et plateau marquant la région de la Piège, à l'extrême ouest du département, près de Fanjeaux." },
    { id: 60, name: "Massif du Luchonnais", type: 'autre', massif: "Massif du Luchonnais", department: "Haute-Garonne (31)", altitude: 3000, lat: 42.760, lng: 0.590, description: "Regroupe les plus hauts sommets du département, à proximité de Bagnères-de-Luchon." },
    { id: 61, name: "Massif du Mont Valier (Ouest)", type: 'autre', massif: "Massif du Mont Valier", department: "Haute-Garonne (31) / Ariège (09)", altitude: 2800, lat: 42.790, lng: 1.050, description: "Partie ouest du Massif du Mont Valier, abritant le Cirque d'Oô et la célèbre cascade." },
    { id: 62, name: "Massif de l'Estats-Montcalm (Ouest)", type: 'autre', massif: "Massif du Montcalm", department: "Haute-Garonne (31) / Ariège (09)", altitude: 3000, lat: 42.660, lng: 1.250, description: "Massif de haute altitude, situé à la jonction de la Haute-Garonne, de l'Ariège et de la Catalogne." },
    { id: 63, name: "Collines de Gascogne (Sud)", type: 'autre', massif: "Contreforts des Pyrénées", department: "Gers (32)", altitude: 378, lat: 43.320, lng: 0.500, description: "Zone de collines au sud du département, assurant la transition avec le piémont pyrénéen (proche de la zone de Miélan/Mirande)." },
    { id: 64, name: "Plateau de la Piège (Ouest)", type: 'autre', massif: "Plateau de Gascogne", department: "Gers (32)", altitude: 300, lat: 43.450, lng: 0.950, description: "Zone de collines au nord-est du département, marquant l'entrée dans le Plateau de Gascogne." },
    { id: 65, name: "Plateau de la Lère", type: 'autre', massif: "Quercy Blanc", department: "Tarn-et-Garonne (82)", altitude: 250, lat: 44.020, lng: 1.250, description: "Vaste plateau calcaire situé au nord de Montauban, marquant l'entrée dans le Quercy Blanc." },
    { id: 66, name: "Pays de Serres (Est)", type: 'autre', massif: "Plateau de Gascogne", department: "Tarn-et-Garonne (82)", altitude: 200, lat: 44.000, lng: 0.950, description: "Zone de collines et de vallons à l'ouest du département, typique du Plateau de Gascogne." },
    { id: 67, name: "Causse de Gramat", type: 'autre', massif: "Causses du Quercy", department: "Lot (46)", altitude: 350, lat: 44.750, lng: 1.680, description: "Le plus vaste des Causses du Quercy, caractérisé par son paysage karstique et ses vallées sèches." },
    { id: 68, name: "Causse de Limogne", type: 'autre', massif: "Causses du Quercy", department: "Lot (46)", altitude: 300, lat: 44.300, lng: 1.630, description: "Causse méridional du Lot, réputé pour la trufficulture et ses dolmens." },
    { id: 69, name: "Région de la Bouriane", type: 'autre', massif: "Plateau de Gascogne (Nord)", department: "Lot (46)", altitude: 300, lat: 44.600, lng: 1.250, description: "Zone de collines et de forêts à l'ouest du Lot, distincte des Causses calcaires." },
    { id: 70, name: "Plateau Cordais", type: 'autre', massif: "Plateaux du Ségala", department: "Tarn (81)", altitude: 300, lat: 44.050, lng: 1.950, description: "Région de plateaux et de collines au nord du département, faisant la transition avec le Ségala." },
    { id: 71, name: "Plateau d'Agout", type: 'autre', massif: "Plaines du Tarn", department: "Tarn (81)", altitude: 200, lat: 43.700, lng: 2.050, description: "Zone de plaines et de bas plateaux traversée par la rivière Agout, au cœur du département." },
    { id: 75, name: "Massif de l'Espinouse", type: 'autre', massif: "Monts de l'Espinouse", department: "Hérault (34)", altitude: 1100, lat: 43.500, lng: 2.900, description: "Massif montagneux de l'extrémité sud du Massif Central, au nord de Saint-Pons-de-Thomières." },
    { id: 76, name: "Plateau du Minervois", type: 'autre', massif: "Corbières Héraultaises", department: "Hérault (34)", altitude: 300, lat: 43.350, lng: 2.950, description: "Plateau calcaire entre l'Aude et l'Hérault, connu pour ses vignobles." },
    { id: 77, name: "Les Avants-Monts", type: 'autre', massif: "Contreforts de l'Espinouse", department: "Hérault (34)", altitude: 500, lat: 43.480, lng: 3.200, description: "Collines et reliefs marquant la transition entre la plaine côtière et le Massif de l'Espinouse." }
]

export async function GET() {
    return NextResponse.json(montCirquePOIs);
}