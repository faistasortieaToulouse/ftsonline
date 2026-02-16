import { NextResponse } from 'next/server';

export async function GET() {
  const locations = [
    // Villes Clés & Points de départ
    { id: 1, name: "Toulouse Jolimont", coords: [43.6150, 1.4620], note: "Point de départ de l'expédition vers les terres audoises." },
    { id: 2, name: "Limoux", coords: [43.0535, 2.2175], note: "Cité du plus long carnaval du monde et de la Blanquette de Limoux." },
    { id: 3, name: "Arques", coords: [42.9531, 2.3752], note: "Célèbre pour son donjon médiéval intact et son lac paisible." },
    { id: 4, name: "Rennes-le-Château", coords: [42.9275, 2.2630], note: "Village mondialement connu pour son mystère et le trésor de l'abbé Saunière." },
    { id: 5, name: "Couiza", coords: [42.9461, 2.2519], note: "Abrite le château des Joyeuse, un joyau de la Renaissance au bord de l'Aude." },

    // Patrimoine & Abbayes
    { id: 6, name: "Abbaye de Saint-Polycarpe", coords: [43.0410, 2.2895], note: "Ancienne abbaye bénédictine nichée dans une vallée verdoyante." },
    { id: 7, name: "Château de Cubières", coords: [42.8614, 2.4608], note: "Vestiges d'une ancienne fortification située à proximité des gorges." },
    { id: 8, name: "Alet-les-Bains", coords: [42.9968, 2.2555], note: "Village médiéval réputé pour son abbaye en ruines et son eau minérale." },
    { id: 9, name: "Château de Termes", coords: [43.0011, 2.5621], note: "L'une des 'Cinq Fils de Carcassonne', haut lieu de la résistance cathare." },
    { id: 10, name: "Abbaye de Saint-Hilaire", coords: [43.0933, 2.3089], note: "Berceau de la Blanquette de Limoux, créée par les moines en 1531." },
    { id: 11, name: "Abbaye de Rieunette", coords: [43.0805, 2.4005], note: "Abbaye cistercienne féminine isolée dans un cadre naturel préservé." },
    { id: 12, name: "Château de Coustaussa", coords: [42.9360, 2.2745], note: "Ruines romantiques surplombant la vallée de la Sals, chargées d'histoire." },

    // Sommets
    { id: 13, name: "Pech de Bugarach", coords: [42.8775, 2.3514], note: "Le 'mont inversé', point culminant des Corbières et site de nombreuses légendes." },
    { id: 14, name: "Pech Cardou", coords: [42.9215, 2.3021], note: "Sommet offrant un panorama exceptionnel sur le massif des Corbières." },
    { id: 15, name: "Pic de Brau", coords: [43.0305, 2.1585], note: "Belvédère naturel dominant le vignoble de Limoux et du Razès." },

    // Gorges, Lacs et Eau
    { id: 16, name: "Gorges de Galamus", coords: [42.8375, 2.4795], note: "Site naturel vertigineux où l'Agly a creusé d'étroites parois calcaires." },
    { id: 17, name: "Gorges de la Pierre-Lys", coords: [42.8361, 2.2150], note: "Défilé spectaculaire creusé par l'Aude dans la roche calcaire." },
    { id: 18, name: "Gorges du Rébenty", coords: [42.8080, 2.1285], note: "Vallée sauvage et encaissée, paradis des randonneurs et des pêcheurs." },
    { id: 19, name: "Gorges de Saint-Georges", coords: [42.7935, 2.2110], note: "Le passage le plus étroit de la vallée de l'Aude." },
    { id: 20, name: "Lac d'Arques", coords: [42.9575, 2.3550], note: "Plan d'eau paisible idéal pour la détente au pied du donjon." },
    { id: 21, name: "Lac de Bugarach", coords: [42.8760, 2.3275], note: "Petit lac de montagne reflétant la silhouette imposante du Pech." },
    { id: 22, name: "Lac de Belvèze du Razès", coords: [43.1250, 2.0955], note: "Lac de plaine entouré de collines viticoles." },
    { id: 23, name: "Lac d'Escueillens", coords: [43.1160, 2.0435], note: "Étendue d'eau calme au cœur de la campagne du Razès." },
    { id: 24, name: "Fontaine des Amours", coords: [42.9230, 2.3215], note: "Vasque naturelle de la Sals, lieu mythique et romantique de Rennes-les-Bains." },
    { id: 25, name: "Cascade des Mathieux", coords: [42.8695, 2.3415], note: "Chute d'eau rafraîchissante située sur les pentes du Bugarach." },
    { id: 26, name: "Source Salée (Sougraigne)", coords: [42.9025, 2.3540], note: "Source d'eau naturellement salée, curiosité géologique locale." },

    // Villages et Hauteurs
    { id: 27, name: "Toureilles", coords: [43.0065, 2.2415], note: "Charmant petit village typique de la Haute Vallée." },
    { id: 28, name: "Magrie", coords: [43.0280, 2.2015], note: "Village viticole réputé pour la qualité de ses terroirs." },
    { id: 29, name: "Laux (Hauteurs)", coords: [43.0245, 2.1750], note: "Point de vue dominant les vallons entourant Limoux." },
    { id: 30, name: "Ninaute (Hauteurs)", coords: [43.0335, 2.1865], note: "Site offrant de superbes perspectives sur les Pyrénées ariégeoises." },
    { id: 31, name: "Cailhau", coords: [43.1425, 2.1355], note: "Village circulaire (circulade) typique de la région du Razès." },
    { id: 32, name: "Roquetaillade", coords: [42.9930, 2.2025], note: "Village perché offrant une vue imprenable sur la vallée." },
    { id: 33, name: "Conilhac-de-la-Montagne", coords: [42.9775, 2.1935], note: "Petit village authentique niché dans un écrin de verdure." }
  ];

  return NextResponse.json(locations);
}
