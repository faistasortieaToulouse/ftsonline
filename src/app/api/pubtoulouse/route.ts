import { NextResponse } from 'next/server';

export async function GET() {
  const pubs = [
    // Irish Pubs
    { name: "The Danu", category: "Irlandais", address: "Rue du Pont Guilheméry", coords: [43.6025, 1.4554] },
    { name: "O'Briens Irish Pub", category: "Irlandais", address: "Rue Léon Gambetta / rue des Tourneurs", coords: [43.6033, 1.4421] },
    { name: "O'Briens Irish Pub (Tourneurs)", category: "Irlandais", address: "Rue des Tourneurs", coords: [43.6028, 1.4426] },
    { name: "Dubliners", category: "Irlandais", address: "Avenue Marcel Langer", coords: [43.5866, 1.4402] },
    { name: "The Thirsty Monk", category: "Irlandais", address: "Allées Jean Jaurès", coords: [43.6062, 1.4485] },
    { name: "The De Danann", category: "Irlandais", address: "Rue de la Colombette", coords: [43.6055, 1.4532] },

    // English Pubs
    { name: "The George and Dragon", category: "Anglais", address: "Place du Peyrou", coords: [43.6074, 1.4385] },
    { name: "The Frog & Rosbif", category: "Anglais", address: "Rue de l'Industrie", coords: [43.6068, 1.4512] },
    { name: "London Town", category: "Anglais", address: "Rue des Prêtres, quartier Carmes", coords: [43.5968, 1.4445] },
    { name: "Seven Sisters", category: "Anglais", address: "Rue Raymond IV", coords: [43.6106, 1.4474] },
    { name: "The Petit London", category: "Anglais", address: "Rue de la Colombette", coords: [43.6052, 1.4538] },
    { name: "The Tower of London", category: "Anglais", address: "Rue de la Colombette", coords: [43.6056, 1.4525] },
    { name: "The Dispensary", category: "Anglais", address: "Rue de la République, Saint-Cyprien", coords: [43.5992, 1.4338] },
    { name: "The Killarney", category: "Anglais", address: "Rue des Blanchers", coords: [43.6027, 1.4388] },
    { name: "The Classroom", category: "Anglais", address: "Rue Pargaminières", coords: [43.6041, 1.4401] },
    { name: "The Four Twenty bar", category: "Anglais", address: "Rue Pargaminières", coords: [43.6043, 1.4395] },

    // Écossais
    { name: "The Hopscotch Pub & Brewery", category: "Écossais", address: "Rue de la Colombette", coords: [43.6051, 1.4528] },

    // Concept / British Spirit
    { name: "The Black Lion", category: "Concept", address: "Allées Paul Feuga", coords: [43.5932, 1.4428] },
    { name: "Bota Pub (The Botanist)", category: "Concept", address: "Boulevard Maréchal Leclerc", coords: [43.6105, 1.4352] },
    { name: "Pub O’Clock", category: "Concept", address: "Boulevard de Strasbourg", coords: [43.6075, 1.4468] },
    { name: "Melting Pot", category: "Concept", address: "Boulevard de Strasbourg", coords: [43.6069, 1.4472] },
    { name: "The Four Monkeys", category: "Concept", address: "Rue de Metz", coords: [43.6001, 1.4462] },
    { name: "Rooster & Beer", category: "Concept", address: "Rue Gabriel Péri", coords: [43.6053, 1.4501] },
    { name: "Little O'Clock", category: "Concept", address: "Allées Jean Jaurès", coords: [43.6060, 1.4489] },
    { name: "The Black Owl Pub", category: "Concept", address: "Boulevard de Strasbourg", coords: [43.6081, 1.4463] },
    { name: "Old School", category: "Concept", address: "Rue Clémence Isaure", coords: [43.6012, 1.4431] },
    { name: "The Old Dockers", category: "Concept", address: "Boulevard de Strasbourg", coords: [43.6085, 1.4459] },
    { name: "Pelican's Pub", category: "Concept", address: "cheminement André Malraux", coords: [43.6095, 1.4542] },
    { name: "Sauvage Social Pub", category: "Concept", address: "Place Esquirol", coords: [43.6005, 1.4446] },
    { name: "Wanted Jack Saloon", category: "Concept", address: "Rue Raymond IV", coords: [43.6109, 1.4478] },
    { name: "Delicatessen", category: "Concept", address: "Rue Riquet", coords: [43.6078, 1.4524] },
    { name: "The Beer Social Club", category: "Concept", address: "Pl Marcel Bouilloux-Lafont", coords: [43.5785, 1.4372] }
  ];

  return NextResponse.json(pubs);
}
