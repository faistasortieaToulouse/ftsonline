import { NextResponse } from 'next/server';

export async function GET() {
  const iles = [
    { 
      id: 1, 
      nom: "Île de la Saudrune", 
      description: "Pointe sud de l'archipel au confluent de la Saudrune.", 
      // CORRECTION : Remonté au niveau du confluent réel
      lat: 43.5625, 
      lng: 1.4328 
    },
    { 
      id: 2, 
      nom: "Îlot des Lapins", 
      description: "Petit îlot sauvage face au chemin de la Loge.", 
      // CORRECTION : Descendu plus au Sud sur l'îlot boisé
      lat: 43.5585, 
      lng: 1.4338 
    },
    { 
      id: 3, 
      nom: "Îlot de la Poudrière", 
      description: "Situé près de l'ancienne poudrerie impériale.", 
      // CORRECTION : Remonté vers le nord (lat augmentée)
      lat: 43.5745, 
      lng: 1.4345 
    },
    { 
      id: 4, 
      nom: "Île d'Empalot", 
      description: "Partie centrale accueillant des infrastructures sportives et techniques.", 
      // CORRECTION : Légèrement abaissé pour centrer sur la zone
      lat: 43.5685, 
      lng: 1.4360 
    },
    { 
      id: 5, 
      nom: "Le Grand Ramier", 
      description: "Cœur de l'île (Stadium, Parc des Sports).", 
      lat: 43.5855, 
      lng: 1.4368 
    },
   { 
      id: 6, 
      nom: "Île de Banlève", 
      description: "Ancienne cité ouvrière, zone de la soufflerie.", 
      // CORRECTION : Décalé à droite pour être sur la terre ferme
      lat: 43.5898, 
      lng: 1.4385 
    },
    { 
      id: 7, 
      nom: "Île Sainte-Catherine", 
      description: "Refuge boisé (l'île la plus à gauche sur les trois).", 
      // Décalage vers la droite (lng augmentée de 1.4382 à 1.4388)
      lat: 43.5925, 
      lng: 1.4388 
    },
    { 
      id: 8, 
      nom: "Îlot du Pont Saint-Michel", 
      description: "Banc de terre végétalisé (l'île centrale sur les trois).", 
      // Décalage vers la droite (lng augmentée de 1.4391 à 1.4397)
      lat: 43.5927, 
      lng: 1.4397 
    },
    { 
      id: 9, 
      nom: "Ancienne île de la Prairie des Filtres (Cours Dillon)", 
      description: "Positionnée sur l'espace vert de la Prairie des Filtres.", 
      lat: 43.5972, 
      lng: 1.4375 
    },
    { 
      id: 10, 
      nom: "Îlot du Pont de Halage de Tounis", 
      description: "Petit îlot historique (l'île la plus à droite sur les trois).", 
      lat: 43.5930, 
      lng: 1.4402 
    },
    { 
      id: 11, 
      nom: "Ancienne Île de Tounis", 
      description: "Quartier historique entre le Pont Neuf et la Dalbade.", 
      lat: 43.5985, 
      lng: 1.4406 
    },
    { 
      id: 12, 
      nom: "Îlots de la Cavaletade", 
      description: "Série de trois petits îlots naturels à l'est de l'îlot des Lapins.", 
      // CORRECTION : Un peu plus haut (lat +) et un peu plus à droite (lng +)
      lat: 43.5598, 
      lng: 1.4368 
    },
    { 
      id: 13, 
      nom: "Îlot du Fer à Cheval", 
      description: "Petit îlot situé face au quartier du Fer à Cheval, sur la rive gauche.", 
      // AJOUT : Positionné au nord du Pont Saint-Michel, côté rive gauche
      // CORRECTION : Remonté au-dessus du pont et décalé vers la rive gauche (X)
      lat: 43.5928, 
      lng: 1.4372
    },
    { 
      id: 14, 
      nom: "Îlot des Moulins de la Garonne", 
      description: "Banc de terre sauvage situé en amont du bras supérieur de la Garonne.", 
      // Positionné au niveau du texte sur l'image, au sud du Parc de l'Île du Ramier
      // CORRECTION : Remonté au Nord (lat +) et décalé à gauche (lng -)
      lat: 43.5735, 
      lng: 1.4297
    },
    { 
      id: 15, 
      nom: "Îlot du Pont de l'ONIA", 
      description: "Îlot végétalisé situé juste au-dessus du Pont de l'ONIA (A620).", 
      // Positionné juste au-dessus du pont de l'ONIA sur le bras gauche
      // CORRECTION : Remonté juste au Nord du pont de l'autoroute et décalé à gauche
      lat: 43.5698, 
      lng: 1.4306
    },
  ];

  return NextResponse.json(iles);
}