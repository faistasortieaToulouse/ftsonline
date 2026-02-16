import { NextResponse } from 'next/server';

export async function GET() {
  const locations = [
    // Villes Clés & Points de départ
    { id: 1, name: "Toulouse Jolimont", coords: [43.6150, 1.4620], note: "Point de départ" },
    { id: 2, name: "Limoux", coords: [43.0535, 2.2175], note: "Destination Carnaval" },
    { id: 3, name: "Arques", coords: [42.9531, 2.3752], note: "Village & Donjon" },
    { id: 4, name: "Rennes-le-Château", coords: [42.9275, 2.2630], note: "Domaine de l'Abbé Saunière" },
    { id: 5, name: "Couiza", coords: [42.9461, 2.2519], note: "Carrefour de la Haute Vallée" },

    // Patrimoine & Abbayes
    { id: 6, name: "Abbaye de Saint-Polycarpe", coords: [43.0410, 2.2895], note: "" },
    { id: 7, name: "Château de Cubières", coords: [42.8614, 2.4608], note: "" },
    { id: 8, name: "Alet-les-Bains", coords: [42.9968, 2.2555], note: "" },
    { id: 9, name: "Château de Termes", coords: [43.0011, 2.5621], note: "" },
    { id: 10, name: "Abbaye de Saint-Hilaire", coords: [43.0933, 2.3089], note: "" },
    { id: 11, name: "Abbaye de Rieunette", coords: [43.0805, 2.4005], note: "" },
    { id: 12, name: "Château de Coustaussa", coords: [42.9360, 2.2745], note: "" },

    // Sommets
    { id: 13, name: "Pech de Bugarach", coords: [42.8775, 2.3514], note: "" },
    { id: 14, name: "Pech Cardou", coords: [42.9215, 2.3021], note: "" },
    { id: 15, name: "Pic de Brau", coords: [43.0305, 2.1585], note: "" },

    // Gorges, Lacs et Eau
    { id: 16, name: "Gorges de Galamus", coords: [42.8375, 2.4795], note: "" },
    { id: 17, name: "Gorges de la Pierre-Lys", coords: [42.8361, 2.2150], note: "" },
    { id: 18, name: "Gorges du Rébenty", coords: [42.8080, 2.1285], note: "" },
    { id: 19, name: "Gorges de Saint-Georges", coords: [42.7935, 2.2110], note: "" },
    { id: 20, name: "Lac d'Arques", coords: [42.9575, 2.3550], note: "" },
    { id: 21, name: "Lac de Bugarach", coords: [42.8760, 2.3275], note: "" },
    { id: 22, name: "Lac de Belvèze du Razès", coords: [43.1250, 2.0955], note: "" },
    { id: 23, name: "Lac d'Escueillens", coords: [43.1160, 2.0435], note: "" },
    { id: 24, name: "Fontaine des Amours", coords: [42.9230, 2.3215], note: "" },
    { id: 25, name: "Cascade des Mathieux", coords: [42.8695, 2.3415], note: "" },
    { id: 26, name: "Source Salée (Sougraigne)", coords: [42.9025, 2.3540], note: "" },

    // Villages et Hauteurs
    { id: 27, name: "Toureilles", coords: [43.0065, 2.2415], note: "" },
    { id: 28, name: "Magrie", coords: [43.0280, 2.2015], note: "" },
    { id: 29, name: "Laux (Hauteurs)", coords: [43.0245, 2.1750], note: "" },
    { id: 30, name: "Ninaute (Hauteurs)", coords: [43.0335, 2.1865], note: "" },
    { id: 31, name: "Cailhau", coords: [43.1425, 2.1355], note: "" },
    { id: 32, name: "Roquetaillade", coords: [42.9930, 2.2025], note: "" },
    { id: 33, name: "Conilhac-de-la-Montagne", coords: [42.9775, 2.1935], note: "" }
  ];

  return NextResponse.json(locations);
}
