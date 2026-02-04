import { NextResponse } from 'next/server';

export async function GET() {
  const enclaves = [
    // --- NIVEAU RÉGIONAL / INTER-RÉGIONAL ---
    {
      nom: "Enclaves Bigourdanes (Nord)",
      lieu: "Escaunets, Séron, Villenave-près-Béarn",
      appartenance: "Hautes-Pyrénées (65) - Occitanie",
      enclaveDans: "Pyrénées-Atlantiques (64) - Nouvelle-Aquitaine",
      type: "Régional",
      lat: 43.3441, lng: -0.0682,
      notes: "Enclave historique de la Bigorre dans le Béarn."
    },
    {
      nom: "Enclaves Bigourdanes (Sud)",
      lieu: "Gardères, Luquet",
      appartenance: "Hautes-Pyrénées (65) - Occitanie",
      enclaveDans: "Pyrénées-Atlantiques (64) - Nouvelle-Aquitaine",
      type: "Régional",
      lat: 43.2758, lng: -0.1118,
      notes: "Seconde poche des Hautes-Pyrénées en terre béarnaise."
    },
    {
      nom: "L'Enclave des Papes",
      lieu: "Grillon, Richerenches, Valréas, Visan",
      appartenance: "Vaucluse (84) - PACA",
      enclaveDans: "Drôme (26) - Auvergne-Rhône-Alpes",
      type: "Régional",
      lat: 44.3833, lng: 4.9667,
      notes: "Canton de Valréas, rattaché au Vaucluse pour des raisons historiques liées au Saint-Siège."
    },

    // --- NIVEAU DÉPARTEMENTAL (TOTAL) ---
    {
      nom: "Enclave du Cambrésis",
      lieu: "Boursies, Doignies, Mœuvres",
      appartenance: "Nord (59)",
      enclaveDans: "Pas-de-Calais (62)",
      type: "Départemental",
      lat: 50.1386, lng: 3.0294,
      notes: "Trois communes du Nord totalement entourées par le Pas-de-Calais."
    },
    {
      nom: "Exclave de Ménessaire",
      lieu: "Ménessaire",
      appartenance: "Côte-d'Or (21)",
      enclaveDans: "Nièvre (58) / Saône-et-Loire (71)",
      type: "Départemental",
      lat: 47.1322, lng: 4.1436,
      notes: "Située aux confins du Morvan."
    },
    {
      nom: "Enclave d'Othe",
      lieu: "Othe",
      appartenance: "Meurthe-et-Moselle (54)",
      enclaveDans: "Meuse (55)",
      type: "Départemental",
      lat: 49.4908, lng: 5.4336,
      notes: "Petite commune du 54 isolée dans le 55."
    },

    // --- NIVEAU COMMUNAL (Totalement enclavées dans une autre ville) ---
    { nom: "Curmont", lieu: "Enclavée dans Colombey les Deux Églises", appartenance: "Haute-Marne (52)", type: "Communal", lat: 48.2567, lng: 4.8631 },
    { nom: "Giuncheto", lieu: "Enclavée dans Sartène", appartenance: "Corse-du-Sud (2A)", type: "Communal", lat: 41.5889, lng: 8.9556 },
    { nom: "Hesdin", lieu: "Enclavée dans Marconne", appartenance: "Pas-de-Calais (62)", type: "Communal", lat: 50.3744, lng: 2.0369 },
    { nom: "Husseren-les-Châteaux", lieu: "Enclavée dans Eguisheim", appartenance: "Haut-Rhin (68)", type: "Communal", lat: 48.0358, lng: 7.2811 },
    { nom: "La Pellerine", lieu: "Enclavée dans Noyant-Villages", appartenance: "Maine-et-Loire (49)", type: "Communal", lat: 47.5353, lng: 0.1250 },
    { nom: "Le Pin-au-Haras", lieu: "Enclavée dans Gouffern en Auge", appartenance: "Orne (61)", type: "Communal", lat: 48.7444, lng: 0.1472 },
    { nom: "Moncale", lieu: "Enclavée dans Calenzana", appartenance: "Haute-Corse (2B)", type: "Communal", lat: 42.5103, lng: 8.8419 },
    { nom: "Mont-Dauphin", lieu: "Enclavée dans Eygliers", appartenance: "Hautes-Alpes (05)", type: "Communal", lat: 44.6706, lng: 6.6272 },
    { nom: "Pontécoulant", lieu: "Enclavée dans Condé-en-Normandie", appartenance: "Calvados (14)", type: "Communal", lat: 48.8794, lng: -0.5886 },
    { 
      nom: "Suzan", 
      lieu: "Enclavée dans La Bastide-de-Sérou", 
      appartenance: "Ariège (09)", 
      type: "Communal", 
      lat: 43.0122, lng: 1.3514,
      notes: "Cas unique : les limites ne sont pas clairement identifiées." 
    },

    // --- NIVEAU PARTIEL (Parcelles spécifiques) ---
    { nom: "Pont-d’Ouilly (parcelle)", lieu: "Enclave dans Cahan", appartenance: "Calvados (14)", type: "Partiel", lat: 48.8781, lng: -0.4286 },
    { nom: "Chêne-Sec (2 parcelles)", lieu: "Enclaves dans Beauvernois", appartenance: "Jura (39)", type: "Partiel", lat: 46.8333, lng: 5.4333 },
    { nom: "Grand-Failly (parcelle)", lieu: "Enclave dans la Meuse (55)", appartenance: "Meurthe-et-Moselle (54)", type: "Partiel", lat: 49.4208, lng: 5.5133 }
  ];

  return NextResponse.json(enclaves);
}
