import { NextResponse } from 'next/server';

export async function GET() {
  const pubs = [
    // --- Irish Pubs ---
    { name: "The Danu", category: "Irlandais", address: "9 Rue du Pont Guilheméry", coords: [43.6025, 1.4554] },
    { name: "O'Briens Irish Pub (Gambetta)", category: "Irlandais", address: "6 Rue Léon Gambetta", coords: [43.6033, 1.4421] },
    { name: "O'Briens Irish Pub (Tourneurs)", category: "Irlandais", address: "38 Rue des Tourneurs", coords: [43.6028, 1.4426] },
    { name: "Dubliners", category: "Irlandais", address: "46 Avenue Marcel Langer", coords: [43.5866, 1.4402] },
    { name: "The Thirsty Monk", category: "Irlandais", address: "33 Allées Jean Jaurès", coords: [43.6062, 1.4485] },
    { name: "The De Danann", category: "Irlandais", address: "9 Rue de la Colombette", coords: [43.6055, 1.4532] },

    // --- English Pubs ---
    { name: "The George and Dragon", category: "Anglais", address: "1 Place du Peyrou", coords: [43.6074, 1.4385] },
    { name: "The Frog & Rosbif", category: "Anglais", address: "14 Rue de l'Industrie", coords: [43.6068, 1.4512] },
    { name: "London Town", category: "Anglais", address: "14 Rue des Prêtres", coords: [43.5968, 1.4445] },
    { name: "Seven Sisters", category: "Anglais", address: "42 Rue Raymond IV", coords: [43.6106, 1.4474] },
    { name: "The Petit London", category: "Anglais", address: "7 Rue de la Colombette", coords: [43.6052, 1.4538] },
    { name: "The Tower of London", category: "Anglais", address: "39 Rue de la Colombette", coords: [43.6056, 1.4525] },
    { name: "The Dispensary", category: "Anglais", address: "1 Rue de la République", coords: [43.5992, 1.4338] },
    { name: "The Killarney", category: "Anglais", address: "14 Rue des Blanchers", coords: [43.6027, 1.4388] },
    { name: "The Classroom", category: "Anglais", address: "42 Rue Pargaminières", coords: [43.6041, 1.4401] },
    { name: "The Four Twenty bar", category: "Anglais", address: "39 Rue Pargaminières", coords: [43.6043, 1.4395] },

    // --- Écossais ---
    { name: "The Hopscotch Pub & Brewery", category: "Écossais", address: "3 Rue de la Colombette", coords: [43.6051, 1.4528] },

    // --- Concept / British Spirit ---
    { name: "The Black Lion", category: "Concept", address: "4 Allées Paul Feuga", coords: [43.5932, 1.4428] },
    { name: "Bota Pub (The Botanist)", category: "Concept", address: "33 Boulevard Maréchal Leclerc", coords: [43.6105, 1.4352] },
    { name: "Pub O’Clock", category: "Concept", address: "21 Boulevard de Strasbourg", coords: [43.6075, 1.4468] },
    { name: "Melting Pot", category: "Concept", address: "26 Boulevard de Strasbourg", coords: [43.6069, 1.4472] },
    { name: "The Four Monkeys", category: "Concept", address: "7 Rue de Metz", coords: [43.6001, 1.4462] },
    { name: "Rooster & Beer", category: "Concept", address: "100 Rue Gabriel Péri", coords: [43.6053, 1.4501] },
    { name: "Little O'Clock", category: "Concept", address: "18 Allées Jean Jaurès", coords: [43.6060, 1.4489] },
    { name: "The Black Owl Pub", category: "Concept", address: "11 Boulevard de Strasbourg", coords: [43.6081, 1.4463] },
    { name: "Old School", category: "Concept", address: "10 Rue Clémence Isaure", coords: [43.6012, 1.4431] },
    { name: "The Old Dockers", category: "Concept", address: "3 Boulevard de Strasbourg", coords: [43.6085, 1.4459] },
    { name: "Pelican's Pub", category: "Concept", address: "4 cheminement André Malraux", coords: [43.6095, 1.4542] },
    { name: "Sauvage Social Pub", category: "Concept", address: "11 Place Esquirol", coords: [43.6005, 1.4446] },
    { name: "Wanted Jack Saloon", category: "Concept", address: "2 Rue Raymond IV", coords: [43.6109, 1.4478] },
    { name: "Delicatessen", category: "Concept", address: "11 bis Rue Riquet", coords: [43.6078, 1.4524] },
    { name: "The Beer Social Club", category: "Concept", address: "1 Place Marcel Bouilloux-Lafont", coords: [43.5785, 1.4372] }
  ];

  return NextResponse.json(pubs);
}
