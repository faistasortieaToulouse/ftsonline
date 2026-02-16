import { NextResponse } from 'next/server';

export async function GET() {
  const pubs = [
    // Irish Pubs
    { name: "The Danu", category: "Irlandais", address: "Rue du Pont Guilheméry", coords: [43.6025, 1.4554] },
    { name: "O'Briens Irish Pub", category: "Irlandais", address: "Rue Léon Gambetta", coords: [43.6033, 1.4421] },
    { name: "Dubliners", category: "Irlandais", address: "Avenue Marcel Langer", coords: [43.5866, 1.4402] },
    { name: "The Thirsty Monk", category: "Irlandais", address: "Allées Jean Jaurès", coords: [43.6062, 1.4485] },
    { name: "The De Danann", category: "Irlandais", address: "Rue de la Colombette", coords: [43.6055, 1.4532] },
    
    // English Pubs
    { name: "The George and Dragon", category: "Anglais", address: "Place du Peyrou", coords: [43.6074, 1.4385] },
    { name: "The Frog & Rosbif", category: "Anglais", address: "Rue de l'Industrie", coords: [43.6068, 1.4512] },
    { name: "London Town", category: "Anglais", address: "Rue des Prêtres", coords: [43.5968, 1.4445] },
    { name: "The Petit London", category: "Anglais", address: "Rue de la Colombette", coords: [43.6052, 1.4538] },
    { name: "The Dispensary", category: "Anglais", address: "Rue de la République", coords: [43.5992, 1.4338] },
    
    // Concept / British
    { name: "The Black Lion", category: "Concept", address: "Allées Paul Feuga", coords: [43.5932, 1.4428] },
    { name: "Bota Pub", category: "Concept", address: "Boulevard Maréchal Leclerc", coords: [43.6105, 1.4352] },
    { name: "The Four Monkeys", category: "Concept", address: "Rue de Metz", coords: [43.6001, 1.4462] },
    { name: "The Hopscotch", category: "Écossais", address: "Rue de la Colombette", coords: [43.6051, 1.4528] }
  ];

  return NextResponse.json(pubs);
}
