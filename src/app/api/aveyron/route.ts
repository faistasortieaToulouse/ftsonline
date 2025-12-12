// src/app/api/aveyron/route.ts
import { NextResponse } from 'next/server';

// Définition de type pour les données d'un site en Aveyron
export interface SiteAveyron {
  id: number;
  commune: string;
  description: string;
  niveau: number;
  categorie: 'incontournable' | 'remarquable' | 'suggéré';
  lat: number; // Latitude pour la géolocalisation
  lng: number; // Longitude pour la géolocalisation
}

// Les données complètes des sites, avec des coordonnées géographiques approximatives
const aveyronSites: SiteAveyron[] = [
  { id: 1, commune: "Rodez", description: "Cathédrale Notre-Dame, Musée Fenaille, Musée Soulages", niveau: 1, categorie: "incontournable", lat: 44.354, lng: 2.576 },
  { id: 2, commune: "Millau", description: "Viaduc de Millau, palais des rois d'Aragon", niveau: 1, categorie: "incontournable", lat: 44.098, lng: 3.078 },
  { id: 3, commune: "Conques-en-Rouergue", description: "Abbatiale et tympan du Jugement dernier", niveau: 1, categorie: "incontournable", lat: 44.599, lng: 2.396 },
  { id: 4, commune: "Laguiole", description: "Village et couteau emblématique", niveau: 1, categorie: "incontournable", lat: 44.685, lng: 2.846 },
  { id: 5, commune: "Espalion", description: "Cité de caractère, Château de Calmont d’Olt", niveau: 1, categorie: "incontournable", lat: 44.520, lng: 2.766 },
  { id: 6, commune: "Belcastel", description: "Château et Pont roman", niveau: 1, categorie: "incontournable", lat: 44.346, lng: 2.378 },
  { id: 7, commune: "Sainte-Eulalie-d’Olt", description: "Château", niveau: 1, categorie: "incontournable", lat: 44.453, lng: 2.956 },
  { id: 8, commune: "Brousse-le-Château", description: "Plus beaux villages de France", niveau: 1, categorie: "incontournable", lat: 43.985, lng: 2.593 },
  { id: 9, commune: "La Couvertoirade", description: "Cité templière et hospitalière", niveau: 1, categorie: "incontournable", lat: 43.945, lng: 3.328 },
  { id: 10, commune: "Sévérac-le-Château", description: "Château des ducs d’Arpajon", niveau: 1, categorie: "incontournable", lat: 44.312, lng: 3.064 },
  { id: 11, commune: "Sauveterre-de-Rouergue", description: "Cité médiévale, Bastide royale", niveau: 1, categorie: "incontournable", lat: 44.184, lng: 2.247 },
  { id: 12, commune: "Baraqueville", description: "Manoir et ferme des Crouzets", niveau: 3, categorie: "suggéré", lat: 44.209, lng: 2.368 },
  { id: 13, commune: "Decazeville", description: "Anciennes mines de charbon", niveau: 2, categorie: "remarquable", lat: 44.577, lng: 2.261 },
  { id: 14, commune: "Villefranche-de-Rouergue", description: "Château de Graves, Chartreuse de Saint-Sauveur", niveau: 1, categorie: "incontournable", lat: 44.352, lng: 2.037 },
  { id: 15, commune: "Aubrac", description: "Plateau, Parc Naturel Régional", niveau: 3, categorie: "suggéré", lat: 44.646, lng: 3.023 },
  { id: 16, commune: "Larzac", description: "Plateau, site UNESCO, patrimoine templier", niveau: 3, categorie: "suggéré", lat: 43.990, lng: 3.250 },
  { id: 17, commune: "Rougier de Camarès", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 43.830, lng: 2.920 },
  { id: 18, commune: "Ségala / Ségala Sauvage", description: "Plateau / Paysage", niveau: 3, categorie: "suggéré", lat: 44.200, lng: 2.100 },
  { id: 19, commune: "Gorges de l'Aveyron", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.090, lng: 1.870 },
  { id: 20, commune: "Gorges de la Dourbie", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.110, lng: 3.200 },
  { id: 21, commune: "Gorges de la Truyère", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.690, lng: 2.650 },
  { id: 22, commune: "Monts et lacs du Lévézou", description: "Région naturelle", niveau: 2, categorie: "remarquable", lat: 44.180, lng: 2.700 },
  { id: 23, commune: "Pareloup", description: "Région des lacs", niveau: 2, categorie: "remarquable", lat: 44.170, lng: 2.730 },
  { id: 24, commune: "Roquefort-sur-Soulzon / Roquefort", description: "Musée des dinosaures, fromage", niveau: 1, categorie: "incontournable", lat: 43.984, lng: 2.993 },
  { id: 25, commune: "Saint-Léons", description: "Parc à thème / Musée, Micropolis / Maison Fabre", niveau: 1, categorie: "incontournable", lat: 44.118, lng: 2.934 },
  { id: 26, commune: "Compolibat", description: "Site naturel (couleur rouge), Le Colorado", niveau: 1, categorie: "incontournable", lat: 44.332, lng: 2.158 },
  { id: 27, commune: "Bournazel", description: "château Renaissance, jardin remarquable", niveau: 1, categorie: "incontournable", lat: 44.475, lng: 2.187 },
  { id: 28, commune: "La Salvetat-Peyralès", description: "Château de La Salvetat-Peyralès", niveau: 2, categorie: "remarquable", lat: 44.187, lng: 2.222 },
  { id: 29, commune: "Saint-Izaire", description: "Château de Saint-Izaire", niveau: 2, categorie: "remarquable", lat: 43.998, lng: 2.686 },
  { id: 30, commune: "Rivière-sur-Tarn", description: "Château de Peyrelade", niveau: 2, categorie: "remarquable", lat: 44.175, lng: 3.129 },
  { id: 31, commune: "Centrès (site de Taurines)", description: "Château de Taurines", niveau: 2, categorie: "remarquable", lat: 44.148, lng: 2.378 },
  { id: 32, commune: "Sévérac-le-Château", description: "Château de Sévérac-le-Château", niveau: 1, categorie: "incontournable", lat: 44.312, lng: 3.064 }, // Doublon (voir ID 10)
  { id: 33, commune: "Pierrefiche", description: "Château de Galinières", niveau: 1, categorie: "incontournable", lat: 44.209, lng: 2.890 },
  { id: 34, commune: "Montpeyroux", description: "Château de Boussquet / ruines", niveau: 3, categorie: "suggéré", lat: 44.653, lng: 2.938 },
  { id: 35, commune: "La Bastide-l'Évêque", description: "Village et château", niveau: 2, categorie: "remarquable", lat: 44.315, lng: 2.109 },
  { id: 36, commune: "Entraygues-sur-Truyère", description: "Ville et pont", niveau: 1, categorie: "incontournable", lat: 44.621, lng: 2.585 },
  { id: 37, commune: "Estaing", description: "Plus Beau Village de France", niveau: 1, categorie: "incontournable", lat: 44.492, lng: 2.723 },
  { id: 38, commune: "Combret", description: "Village médiéval", niveau: 1, categorie: "incontournable", lat: 43.834, lng: 2.671 },
  { id: 39, commune: "Sévérac-le-Château", description: "Château et cité médiévale", niveau: 1, categorie: "incontournable", lat: 44.312, lng: 3.064 }, // Doublon (voir ID 10 & 32)
  { id: 40, commune: "Martiel", description: "Abbaye du Loc-Dieu", niveau: 1, categorie: "incontournable", lat: 44.380, lng: 1.956 },
  { id: 41, commune: "Le Cayrol", description: "Abbaye de Bonneval", niveau: 1, categorie: "incontournable", lat: 44.597, lng: 2.879 },
  { id: 42, commune: "Coupiac", description: "Château", niveau: 2, categorie: "remarquable", lat: 43.914, lng: 2.535 },
  { id: 43, commune: "Monts d'Aubrac", description: "Plateau", niveau: 3, categorie: "suggéré", lat: 44.646, lng: 3.023 }, // Doublon (voir ID 15)
  { id: 44, commune: "Plaisance", description: "Village", niveau: 3, categorie: "suggéré", lat: 43.917, lng: 2.395 },
  { id: 45, commune: "Villefranche-de-Rouergue", description: "Bastide et château", niveau: 1, categorie: "incontournable", lat: 44.352, lng: 2.037 }, // Doublon (voir ID 14)
  { id: 46, commune: "Castelnau-Pégayrols", description: "Village médiéval", niveau: 2, categorie: "remarquable", lat: 44.150, lng: 2.943 },
  { id: 47, commune: "Montjaux", description: "Village", niveau: 3, categorie: "suggéré", lat: 44.083, lng: 2.956 },
  { id: 48, commune: "Saint-Beauzély", description: "Village", niveau: 3, categorie: "suggéré", lat: 44.103, lng: 2.981 },
  { id: 49, commune: "Rieupeyroux", description: "Village et patrimoine", niveau: 3, categorie: "suggéré", lat: 44.225, lng: 2.158 },
  { id: 50, commune: "Creissels", description: "Viaduc", niveau: 1, categorie: "incontournable", lat: 44.077, lng: 3.061 },
  { id: 51, commune: "Saint-Victor-et-Melvieu", description: "Tour", niveau: 3, categorie: "suggéré", lat: 44.004, lng: 2.855 },
  { id: 52, commune: "Cantobre", description: "Village perché", niveau: 2, categorie: "remarquable", lat: 44.030, lng: 3.242 },
  { id: 53, commune: "Saint-Affrique", description: "Dolmens", niveau: 2, categorie: "remarquable", lat: 43.955, lng: 2.894 },
  { id: 54, commune: "Sylvanès", description: "Abbaye et église orthodoxe", niveau: 1, categorie: "incontournable", lat: 43.834, lng: 2.766 },
  { id: 55, commune: "Nant", description: "Village", niveau: 3, categorie: "suggéré", lat: 44.020, lng: 3.300 },
  { id: 56, commune: "Martrin", description: "Village", niveau: 3, categorie: "suggéré", lat: 43.900, lng: 2.450 },
  { id: 57, commune: "Lugan", description: "Village", niveau: 2, categorie: "remarquable", lat: 44.484, lng: 2.378 },
  { id: 58, commune: "Saint-Jean-d’Alcas et Saint-Paul les Fonts", description: "Village templier", niveau: 1, categorie: "incontournable", lat: 43.985, lng: 3.033 },
  { id: 59, commune: "Saint-Rome de Cernon", description: "Village templier", niveau: 1, categorie: "incontournable", lat: 43.950, lng: 3.000 },
  { id: 60, commune: "Versols-et-Lapeyre", description: "Village templier", niveau: 1, categorie: "incontournable", lat: 43.978, lng: 3.040 },
  { id: 61, commune: "Mur-de-Barrez", description: "Tour Garibaldi", niveau: 1, categorie: "incontournable", lat: 44.851, lng: 2.650 },
  { id: 62, commune: "Sainte-Geneviève-sur-Argence", description: "Village", niveau: 3, categorie: "suggéré", lat: 44.801, lng: 2.793 },
  { id: 63, commune: "Coubisou", description: "Château de Cabrespines", niveau: 2, categorie: "remarquable", lat: 44.597, lng: 2.663 },
  { id: 64, commune: "Vallée du Lot", description: "Vallée", niveau: 3, categorie: "suggéré", lat: 44.400, lng: 2.600 },
  { id: 65, commune: "Rance", description: "Vallée", niveau: 3, categorie: "suggéré", lat: 43.930, lng: 2.500 },
  { id: 66, commune: "Olt", description: "Vallée", niveau: 3, categorie: "suggéré", lat: 44.500, lng: 2.800 },
  { id: 67, commune: "Salars", description: "Lac / région des lacs", niveau: 1, categorie: "incontournable", lat: 44.155, lng: 2.633 },
  { id: 68, commune: "Rouergue", description: "Région naturelle", niveau: 3, categorie: "suggéré", lat: 44.300, lng: 2.300 },
  { id: 69, commune: "Cernon", description: "Vallée", niveau: 3, categorie: "suggéré", lat: 43.950, lng: 3.000 },
  { id: 70, commune: "Soulzon", description: "Village / fromage", niveau: 1, categorie: "incontournable", lat: 43.984, lng: 2.993 }, // Proche de Roquefort (ID 24)
  { id: 71, commune: "Viaur", description: "Vallée", niveau: 3, categorie: "suggéré", lat: 44.060, lng: 2.300 },
  { id: 72, commune: "Moustier", description: "Village", niveau: 2, categorie: "remarquable", lat: 44.040, lng: 2.760 },
  { id: 73, commune: "Lévézou", description: "Plateau et lacs", niveau: 3, categorie: "suggéré", lat: 44.180, lng: 2.700 }, // Doublon (voir ID 22)
  { id: 74, commune: "Najac", description: "Château et village", niveau: 1, categorie: "incontournable", lat: 44.218, lng: 1.977 },
  { id: 75, commune: "Peyre", description: "Village troglodytique", niveau: 1, categorie: "incontournable", lat: 44.095, lng: 3.013 },
  { id: 76, commune: "Foissac", description: "Grotte préhistorique", niveau: 1, categorie: "incontournable", lat: 44.512, lng: 1.954 },
  { id: 77, commune: "Bozouls", description: "Canyon et village, l'Trou de Bozouls", niveau: 1, categorie: "incontournable", lat: 44.464, lng: 2.716 },
  { id: 78, commune: "Montrozier", description: "Parc / Jardin des Bêtes", niveau: 3, categorie: "suggéré", lat: 44.385, lng: 2.810 },
  { id: 79, commune: "Peyreleau", description: "Village", niveau: 3, categorie: "suggéré", lat: 44.195, lng: 3.208 },
  { id: 80, commune: "La Cavalerie", description: "Village, templiers", niveau: 1, categorie: "incontournable", lat: 44.008, lng: 3.161 },
  { id: 81, commune: "Gissac", description: "Château de Montaigut", niveau: 2, categorie: "remarquable", lat: 43.896, lng: 2.756 },
  { id: 82, commune: "Gorges du Tarn", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.270, lng: 3.320 },
  { id: 83, commune: "Vallon de Marcillac", description: "Vallon, vignobles", niveau: 3, categorie: "suggéré", lat: 44.460, lng: 2.450 },
  { id: 84, commune: "Vallée de l'Aveyron", description: "vallée", niveau: 3, categorie: "suggéré", lat: 44.150, lng: 2.100 },
  { id: 85, commune: "Sévérac-d'Aveyron / Sévérac", description: "ruines du château", niveau: 3, categorie: "suggéré", lat: 44.312, lng: 3.064 },
  { id: 86, commune: "Camarès", description: "berges", niveau: 3, categorie: "suggéré", lat: 43.882, lng: 2.879 },
  { id: 87, commune: "Naucelle", description: "bastide", niveau: 2, categorie: "remarquable", lat: 44.120, lng: 2.279 },
  { id: 88, commune: "Saint-Sernin-sur-Rance / Saint-Sernin", description: "lieu classé historique avec l'« Enfant sauvage » : Victor de l'Aveyron.", niveau: 3, categorie: "suggéré", lat: 43.897, lng: 2.585 },
  { id: 89, commune: "Calmont", description: "château", niveau: 2, categorie: "remarquable", lat: 44.200, lng: 2.650 },
  { id: 90, commune: "Cassagnes-Bégonhès", description: "église", niveau: 3, categorie: "suggéré", lat: 44.053, lng: 2.441 },
  { id: 91, commune: "Arvieu", description: "lac", niveau: 2, categorie: "remarquable", lat: 44.110, lng: 2.593 },
  { id: 92, commune: "Ayressens / Ayseènes", description: "Belvédère du Roc Saint-Jean", niveau: 2, categorie: "remarquable", lat: 44.250, lng: 2.390 },
  { id: 93, commune: "Banassac", description: "château", niveau: 2, categorie: "remarquable", lat: 44.428, lng: 3.161 },
  { id: 94, commune: "Beauzély (Saint-Beauzély)", description: "château", niveau: 1, categorie: "incontournable", lat: 44.103, lng: 2.981 }, // Réfère à St-Beauzély (ID 48)
  { id: 95, commune: "Bédérine", description: "paysage", niveau: 3, categorie: "suggéré", lat: 44.570, lng: 2.100 },
  { id: 96, commune: "Bertholène", description: "château des Bourines", niveau: 2, categorie: "remarquable", lat: 44.375, lng: 2.810 },
  { id: 97, commune: "Le Bez", description: "château", niveau: 3, categorie: "suggéré", lat: 43.900, lng: 2.700 },
  { id: 98, commune: "Broquiès", description: "château", niveau: 2, categorie: "remarquable", lat: 43.987, lng: 2.637 },
  { id: 99, commune: "Brusque", description: "berges", niveau: 3, categorie: "suggéré", lat: 43.766, lng: 2.855 },
  { id: 100, commune: "Campestre", description: "causse", niveau: 3, categorie: "suggéré", lat: 44.150, lng: 3.250 },
  { id: 101, commune: "Campouriez", description: "Église et village", niveau: 3, categorie: "suggéré", lat: 44.646, lng: 2.668 },
  { id: 102, commune: "Cantoin", description: "Village de Vines", niveau: 3, categorie: "suggéré", lat: 44.821, lng: 2.822 },
  { id: 103, commune: "Capdenac / Capdenac-le-Haut", description: "musée du train", niveau: 2, categorie: "remarquable", lat: 44.576, lng: 2.053 },
  { id: 104, commune: "Cassis", description: "église", niveau: 3, categorie: "suggéré", lat: 44.020, lng: 2.600 },
  { id: 105, commune: "Castelmary", description: "ruines du château", niveau: 3, categorie: "suggéré", lat: 44.134, lng: 2.158 },
  { id: 106, commune: "Castelnau / Castelnau-Pégayrols", description: "cité de caractère", niveau: 1, categorie: "incontournable", lat: 44.150, lng: 2.943 }, // Réfère à ID 46
  { id: 107, commune: "Saint-Just-sur-Viaur", description: "château de Castelpers", niveau: 3, categorie: "suggéré", lat: 44.053, lng: 2.174 },
  { id: 108, commune: "Clairvaux / Clairvaux-d'Aveyron", description: "cité médiévale, vignoble", niveau: 2, categorie: "remarquable", lat: 44.475, lng: 2.368 },
  { id: 109, commune: "Espeyrac", description: "Moyen-Âge", niveau: 3, categorie: "suggéré", lat: 44.629, lng: 2.457 },
  { id: 110, commune: "Gramond", description: "oratoire", niveau: 2, categorie: "remarquable", lat: 44.145, lng: 2.417 },
  { id: 111, commune: "La Bastide-Pradines", description: "Village perché", niveau: 3, categorie: "suggéré", lat: 43.900, lng: 3.030 },
  { id: 112, commune: "La Capelle-Bleys", description: "église", niveau: 1, categorie: "incontournable", lat: 44.331, lng: 2.126 },
  { id: 113, commune: "La Roque / La Roque-Ste-Marguerite", description: "Moulin de Corp", niveau: 3, categorie: "suggéré", lat: 44.095, lng: 3.250 },
  { id: 114, commune: "La Vinzelle", description: "paysage", niveau: 3, categorie: "suggéré", lat: 44.619, lng: 2.404 },
  { id: 115, commune: "Laissac / Laissac-Sévérac-l'Église", description: "second marché aux bestiaux de France", niveau: 3, categorie: "suggéré", lat: 44.321, lng: 2.805 },
  { id: 116, commune: "Latour", description: "château", niveau: 3, categorie: "suggéré", lat: 43.850, lng: 2.650 },
  { id: 117, commune: "Le Fiel / Le Fel", description: "paysage", niveau: 3, categorie: "suggéré", lat: 44.600, lng: 2.500 },
  { id: 118, commune: "Lincou", description: "lac", niveau: 2, categorie: "remarquable", lat: 44.040, lng: 2.370 },
  { id: 119, commune: "Livinhac-le-Haut", description: "berges", niveau: 3, categorie: "suggéré", lat: 44.570, lng: 2.226 },
  { id: 120, commune: "Mandailles", description: "monts", niveau: 3, categorie: "suggéré", lat: 44.360, lng: 2.520 },
  { id: 121, commune: "Marcillac / Marcillac-Vallon", description: "vignoble et bourgs", niveau: 2, categorie: "remarquable", lat: 44.471, lng: 2.470 }, // Réfère à ID 83
  { id: 122, commune: "Montagnol", description: "statue-menhir", niveau: 2, categorie: "remarquable", lat: 43.850, lng: 3.100 },
  { id: 123, commune: "Monestiés", description: "cité médiévale", niveau: 1, categorie: "incontournable", lat: 44.116, lng: 2.054 },
  { id: 124, commune: "Montsalès", description: "château", niveau: 3, categorie: "suggéré", lat: 44.484, lng: 1.936 },
  { id: 125, commune: "Mostuéjouls / Montuéjouls", description: "monts", niveau: 3, categorie: "suggéré", lat: 44.195, lng: 3.210 },
  { id: 126, commune: "Moyrazès", description: "château de Moyrazès, château du Cayla", niveau: 3, categorie: "suggéré", lat: 44.300, lng: 2.390 },
  { id: 127, commune: "Muret / Muret-le-Château", description: "vignoble et bourgs", niveau: 3, categorie: "suggéré", lat: 44.475, lng: 2.659 },
  { id: 128, commune: "Palmas d'Aveyron", description: "château des évêques, château de Soulages", niveau: 2, categorie: "remarquable", lat: 44.428, lng: 2.923 },
  { id: 129, commune: "Pont-de-Salars", description: "Village de Camboulas", niveau: 3, categorie: "suggéré", lat: 44.179, lng: 2.668 },
  { id: 130, commune: "Prévinquières / Pradinas", description: "château", niveau: 3, categorie: "suggéré", lat: 44.300, lng: 2.080 },
  { id: 131, commune: "Rodelle", description: "village perché", niveau: 2, categorie: "remarquable", lat: 44.402, lng: 2.593 },
  { id: 132, commune: "Saint-Amans-des-Côts", description: "château du Batut", niveau: 2, categorie: "remarquable", lat: 44.654, lng: 2.659 },
  { id: 133, commune: "Saint-Chély / Saint-Chély-d'Aubrac", description: "Tour", niveau: 3, categorie: "suggéré", lat: 44.605, lng: 2.870 },
  { id: 134, commune: "Saint-Christophe", description: "paysage", niveau: 3, categorie: "suggéré", lat: 44.200, lng: 2.050 },
  { id: 135, commune: "Saint-Côme / Saint-Côme-d'Olt", description: "Village classé", niveau: 2, categorie: "remarquable", lat: 44.475, lng: 2.827 },
  { id: 136, commune: "Saint-Geniez / Saint-Geniez-d'Olt", description: "Ville et patrimoine", niveau: 2, categorie: "remarquable", lat: 44.453, lng: 2.980 },
  { id: 137, commune: "Saint-Grégoire", description: "église", niveau: 3, categorie: "suggéré", lat: 44.520, lng: 2.060 },
  { id: 138, commune: "Saint-Jean / Saint-Jean-d'Alcas", description: "Village templier", niveau: 1, categorie: "incontournable", lat: 43.985, lng: 3.033 }, // Réfère à ID 58
  { id: 139, commune: "Saint-Laurent-d'Olt", description: "Église et village", niveau: 3, categorie: "suggéré", lat: 44.420, lng: 3.100 },
  { id: 140, commune: "Saint-Parthem", description: "château", niveau: 3, categorie: "suggéré", lat: 44.629, lng: 2.378 },
  { id: 141, commune: "Saint-Radegonde", description: "clochers d'église", niveau: 3, categorie: "suggéré", lat: 44.354, lng: 2.628 },
  { id: 142, commune: "Saint-Rémy", description: "fortifications", niveau: 2, categorie: "remarquable", lat: 44.500, lng: 2.080 },
  { id: 143, commune: "Saint-Rome / Saint-Rome-de-Tarn", description: "Village et château, cascade des Baumes", niveau: 2, categorie: "remarquable", lat: 44.077, lng: 2.855 },
  { id: 144, commune: "Saint-Santin", description: "deux églises", niveau: 2, categorie: "remarquable", lat: 44.629, lng: 2.222 },
  { id: 145, commune: "Saint-Saturnin / Saint-Saturnin-de-Lenne", description: "église", niveau: 3, categorie: "suggéré", lat: 44.416, lng: 3.129 },
  { id: 146, commune: "Saint-Véran", description: "village", niveau: 3, categorie: "suggéré", lat: 44.050, lng: 2.700 },
  { id: 147, commune: "Salles / Salles-la-Source / Salles-Curan", description: "château et cascade", niveau: 1, categorie: "incontournable", lat: 44.385, lng: 2.457 },
  { id: 148, commune: "Salmiech", description: "village", niveau: 3, categorie: "suggéré", lat: 44.135, lng: 2.585 },
  { id: 149, commune: "Sanvensa", description: "château", niveau: 2, categorie: "remarquable", lat: 44.250, lng: 2.000 },
  { id: 150, commune: "Sainte-Croix", description: "château", niveau: 3, categorie: "suggéré", lat: 44.300, lng: 2.000 },
  { id: 151, commune: "Sainte-Eulalie / Sainte-Eulalie-de-Cernon", description: "templiers", niveau: 1, categorie: "incontournable", lat: 43.957, lng: 3.091 }, // Sainte-Eulalie-d'Olt était ID 7
  { id: 152, commune: "Sébrazac / Sebbazac", description: "église et berges", niveau: 2, categorie: "remarquable", lat: 44.577, lng: 2.659 },
  { id: 153, commune: "Sénergues", description: "château", niveau: 3, categorie: "suggéré", lat: 44.605, lng: 2.470 },
  { id: 154, commune: "Tournemire", description: "cirque", niveau: 1, categorie: "incontournable", lat: 43.900, lng: 2.900 },
  { id: 155, commune: "Vabre-Tizac / Vabres-l'Abbaye", description: "abbaye", niveau: 1, categorie: "incontournable", lat: 44.020, lng: 2.470 },
  { id: 156, commune: "Valady / Valady-le-Château", description: "château", niveau: 3, categorie: "suggéré", lat: 44.402, lng: 2.457 },
  { id: 157, commune: "Villecomtal", description: "cité médiévale", niveau: 1, categorie: "incontournable", lat: 44.500, lng: 2.500 },
  { id: 158, commune: "Aubin", description: "ville et cascade", niveau: 1, categorie: "incontournable", lat: 44.504, lng: 2.247 },
  { id: 159, commune: "Vimenet", description: "remparts", niveau: 2, categorie: "remarquable", lat: 44.274, lng: 2.970 },
  { id: 160, commune: "Gorges d'Aveyron", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.090, lng: 1.870 }, // Réfère à ID 19
  { id: 161, commune: "Gorges du Lot", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.600, lng: 2.600 },
  { id: 162, commune: "Gorges de Dourbie", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.110, lng: 3.200 }, // Réfère à ID 20
  { id: 163, commune: "Causse du Larzac", description: "site naturel", niveau: 3, categorie: "suggéré", lat: 43.990, lng: 3.250 }, // Réfère à ID 16
  { id: 164, commune: "Monts et Lacs du Lévézou", description: "site naturel", niveau: 3, categorie: "suggéré", lat: 44.180, lng: 2.700 }, // Réfère à ID 22/73
  { id: 165, commune: "Vallée du Tarn", description: "site naturel", niveau: 3, categorie: "suggéré", lat: 44.000, lng: 2.900 },
  { id: 166, commune: "Pays de Conques", description: "Vallon de Marcillac", niveau: 3, categorie: "suggéré", lat: 44.500, lng: 2.400 },
  { id: 167, commune: "pays Ruthénois", description: "Vallée de l'Aveyron", niveau: 3, categorie: "suggéré", lat: 44.300, lng: 2.550 },
  { id: 168, commune: "Peyrusse-le-Roc", description: "châteaux perchés", niveau: 2, categorie: "remarquable", lat: 44.504, lng: 2.100 },
  { id: 169, commune: "Pons", description: "église", niveau: 3, categorie: "suggéré", lat: 43.900, lng: 2.600 },
  { id: 170, commune: "Saint-Affricain", description: "terre", niveau: 3, categorie: "suggéré", lat: 43.955, lng: 2.894 }, // Réfère à ID 53
  { id: 171, commune: "Salles-Curan", description: "lac de Pareloup", niveau: 1, categorie: "incontournable", lat: 44.155, lng: 2.755 },
  { id: 172, commune: "Pays du Viaur", description: "terre", niveau: 3, categorie: "suggéré", lat: 44.060, lng: 2.150 }, // Réfère à ID 71
  { id: 173, commune: "Salles-la-Source", description: "vignoble et bourgs", niveau: 3, categorie: "suggéré", lat: 44.385, lng: 2.457 }, // Réfère à ID 147
  { id: 174, commune: "Viala-du-Pas-de-Jaux", description: "Village templier", niveau: 1, categorie: "incontournable", lat: 44.053, lng: 3.064 },
  { id: 175, commune: "Villeneuve / Villeneuve-d'Aveyron", description: "Château", niveau: 1, categorie: "incontournable", lat: 44.420, lng: 2.020 },
  { id: 176, commune: "La Vayssière", description: "Le Tindoul de la Vayssière", niveau: 2, categorie: "remarquable", lat: 44.354, lng: 2.550 },
  { id: 177, commune: "Millavois", description: "terre", niveau: 3, categorie: "suggéré", lat: 44.080, lng: 3.000 },
  { id: 178, commune: "plateau du Lévézou", description: "site naturel", niveau: 3, categorie: "suggéré", lat: 44.180, lng: 2.700 },
  { id: 179, commune: "Roquecézière", description: "vierge au sommet", niveau: 2, categorie: "remarquable", lat: 43.830, lng: 2.720 },
  { id: 180, commune: "Salvagnac-Cajarc", description: "château", niveau: 2, categorie: "remarquable", lat: 44.428, lng: 1.870 },
  { id: 181, commune: "Camjac", description: "château du Bosc (de Toulouse-Lautrec)", niveau: 2, categorie: "remarquable", lat: 44.080, lng: 2.279 },
  { id: 182, commune: "Tauriac de Naucelle", description: "viaduc du Viaur", niveau: 2, categorie: "remarquable", lat: 44.085, lng: 2.158 },
  { id: 183, commune: "Bas-Segala", description: "bastide", niveau: 2, categorie: "remarquable", lat: 44.200, lng: 2.100 }, // Réfère à ID 18
  { id: 184, commune: "Grand-Vabre", description: "village", niveau: 3, categorie: "suggéré", lat: 44.605, lng: 2.396 },
  { id: 185, commune: "Gorges de la Jonte", description: "Site naturel", niveau: 1, categorie: "incontournable", lat: 44.200, lng: 3.320 },
  { id: 186, commune: "Montpellier Le Vieux", description: "chaos", niveau: 1, categorie: "incontournable", lat: 44.120, lng: 3.200 },
  { id: 187, commune: "Roquesaltes", description: "orgues", niveau: 1, categorie: "incontournable", lat: 44.050, lng: 3.150 },
  { id: 188, commune: "Lauras", description: "cave de Roquefort", niveau: 1, categorie: "incontournable", lat: 43.998, lng: 3.018 },
  { id: 189, commune: "Le Clapier", description: "chapelle, templiers", niveau: 2, categorie: "remarquable", lat: 43.890, lng: 3.100 },
  { id: 190, commune: "Peyrebrune", description: "tour, templiers", niveau: 2, categorie: "remarquable", lat: 43.850, lng: 2.650 },
  { id: 191, commune: "Vezins", description: "château templiers", niveau: 1, categorie: "incontournable", lat: 44.200, lng: 2.850 },
  { id: 192, commune: "Cransac", description: "anciennes mines de charbon", niveau: 3, categorie: "suggéré", lat: 44.520, lng: 2.261 },
  { id: 193, commune: "Firmi", description: "anciennes mines de charbon", niveau: 3, categorie: "suggéré", lat: 44.550, lng: 2.300 },
  { id: 194, commune: "Vibiez", description: "anciennes mines de charbon", niveau: 3, categorie: "suggéré", lat: 44.577, lng: 2.261 }, // Proche de Decazeville (ID 13)
  { id: 195, commune: "Le Carladez", description: "site naturel", niveau: 3, categorie: "suggéré", lat: 44.800, lng: 2.600 },
  { id: 196, commune: "la Vayssière", description: "Grange monastique", niveau: 1, categorie: "incontournable", lat: 44.354, lng: 2.550 }, // Réfère à ID 176
  { id: 197, commune: "Mayran", description: "Grange monastique", niveau: 1, categorie: "incontournable", lat: 44.331, lng: 2.378 },
];

export async function GET() {
  // Simuler un petit délai pour le chargement, si nécessaire
  // await new Promise(resolve => setTimeout(resolve, 500)); 
  return NextResponse.json(aveyronSites);
}

// Optionnel: Exportez le type pour l'utiliser dans page.tsx (plus propre)
// export type Site = SiteAveyron; // Si vous voulez l'appeler juste 'Site'
