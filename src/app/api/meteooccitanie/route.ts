import { NextResponse } from 'next/server';

const COORDONNEES: Record<string, { lat: number, lng: number }> = {
  // --- PRÉFECTURES & VILLES PRINCIPALES ---
  toulouse: { lat: 43.6045, lng: 1.4442 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  perpignan: { lat: 42.6986, lng: 2.8956 },
  carcassonne: { lat: 43.2122, lng: 2.3537 },
  albi: { lat: 43.9289, lng: 2.1464 },
  montauban: { lat: 44.0175, lng: 1.3550 },
  tarbes: { lat: 43.2320, lng: 0.0789 },
  rodez: { lat: 44.3506, lng: 2.5750 },
  auch: { lat: 43.6465, lng: 0.5855 },
  cahors: { lat: 44.4475, lng: 1.4419 },
  foix: { lat: 42.9639, lng: 1.6054 },
  mende: { lat: 44.5181, lng: 3.5000 },

  // --- ARIÈGE ---
  pamiers: { lat: 43.1167, lng: 1.6167 },
  'st-girons': { lat: 42.9833, lng: 1.15 },
  lavelanet: { lat: 42.9333, lng: 1.85 },
  saverdun: { lat: 43.2333, lng: 1.5667 },

  // --- AUDE ---
  narbonne: { lat: 43.1833, lng: 3.0000 },
  lezignan: { lat: 43.2031, lng: 2.7592 },
  castelnaudary: { lat: 43.3167, lng: 1.95 },
  limoux: { lat: 43.05, lng: 2.2167 },

  // --- AVEYRON ---
  millau: { lat: 44.1, lng: 3.0833 },
  'villefranche-r': { lat: 44.35, lng: 2.0333 },
  'st-affrique': { lat: 43.95, lng: 2.8833 },
  decazeville: { lat: 44.55, lng: 2.25 },

  // --- GARD ---
  ales: { lat: 44.1333, lng: 4.0833 },
  bagnols: { lat: 44.1625, lng: 4.6192 },
  beaucaire: { lat: 43.8075, lng: 4.6439 },
  'st-gilles': { lat: 43.6767, lng: 4.4308 },

  // --- HAUTE-GARONNE ---
  'st-gaudens': { lat: 43.1083, lng: 0.7233 },
  luchon: { lat: 42.7894, lng: 0.595 },
  carbonne: { lat: 43.2975, lng: 1.2269 },
  revel: { lat: 43.4586, lng: 2.0053 },

  // --- GERS ---
  'isle-jourdain': { lat: 43.6131, lng: 1.0853 },
  condom: { lat: 43.9583, lng: 0.3725 },
  fleurance: { lat: 43.85, lng: 0.6667 },
  eauze: { lat: 43.8608, lng: 0.1008 },

  // --- HÉRAULT ---
  beziers: { lat: 43.3444, lng: 3.2158 },
  sete: { lat: 43.4, lng: 3.7 },
  agde: { lat: 43.3108, lng: 3.4758 },
  lunel: { lat: 43.675, lng: 4.1347 },

  // --- LOT ---
  figeac: { lat: 44.6083, lng: 2.0333 },
  gourdon: { lat: 44.7333, lng: 1.3833 },
  gramat: { lat: 44.7794, lng: 1.7247 },
  souillac: { lat: 44.8936, lng: 1.4772 },

  // --- LOZÈRE ---
  marvejols: { lat: 44.5528, lng: 3.2908 },
  'st-chely': { lat: 44.8011, lng: 3.2758 },
  langogne: { lat: 44.7261, lng: 3.8550 },
  'peyre-aubrac': { lat: 44.7, lng: 3.2833 },

  // --- HAUTES-PYRÉNÉES ---
  lourdes: { lat: 43.0947, lng: -0.0458 },
  aureilhan: { lat: 43.2439, lng: 0.1306 },
  'bagneres-bigorre': { lat: 43.0658, lng: 0.1492 },
  lannemezan: { lat: 43.1267, lng: 0.3850 },

  // --- PYRÉNÉES-ORIENTALES ---
  canet: { lat: 42.7031, lng: 3.0077 },
  'st-esteve': { lat: 42.7092, lng: 2.8422 },
  'st-cyprien': { lat: 42.6186, lng: 3.0336 },
  argeles: { lat: 42.5461, lng: 3.0233 },

  // --- TARN ---
  gaillac: { lat: 43.9014, lng: 1.8969 },
  castres: { lat: 43.6044, lng: 2.2428 },
  graulhet: { lat: 43.7608, lng: 1.9908 },
  lavaur: { lat: 43.6981, lng: 1.8206 },

  // --- TARN-ET-GARONNE ---
  castelsarrasin: { lat: 44.0389, lng: 1.1069 },
  moissac: { lat: 44.1031, lng: 1.0947 },
  caussade: { lat: 44.1611, lng: 1.5369 },
  montech: { lat: 43.9575, lng: 1.2300 },

  // --- ANDORRE ---
  'andorra-vella': { lat: 42.5063, lng: 1.5218 },
  escaldes: { lat: 42.5089, lng: 1.5383 },
  encamp: { lat: 42.5361, lng: 1.5828 },
  'sant-julia': { lat: 42.4637, lng: 1.4913 },
  'la-massana': { lat: 42.5448, lng: 1.5148 },
  ordino: { lat: 42.5564, lng: 1.5331 },
  canillo: { lat: 42.5667, lng: 1.6000 }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville')?.toLowerCase() || 'toulouse';
  
  const coords = COORDONNEES[ville];

  if (!coords) {
    return NextResponse.json({ error: `Ville '${ville}' non supportée` }, { status: 404 });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,windspeed_10m_max&timezone=Europe%2FBerlin`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur Open-Meteo");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de récupérer la météo" }, { status: 500 });
  }
}
