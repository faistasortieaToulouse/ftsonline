import { NextResponse } from 'next/server';

export async function GET() {
  const populations = [
    { rang: 1, commune: "Paris", dept: "75", region: "Île-de-France", pop: 2103778, statut: "Capitale", lat: 48.8566, lng: 2.3522 },
    { rang: 2, commune: "Marseille", dept: "13", region: "PACA", pop: 886040, statut: "Préfecture", lat: 43.2965, lng: 5.3698 },
    { rang: 3, commune: "Lyon", dept: "69", region: "Auvergne-Rhône-Alpes", pop: 519127, statut: "Préfecture", lat: 45.7640, lng: 4.8357 },
    { rang: 4, commune: "Toulouse", dept: "31", region: "Occitanie", pop: 514819, statut: "Préfecture", lat: 43.6047, lng: 1.4442 },
    { rang: 5, commune: "Nice", dept: "06", region: "PACA", pop: 357737, statut: "Préfecture", lat: 43.7102, lng: 7.2620 },
    { rang: 6, commune: "Nantes", dept: "44", region: "Pays de la Loire", pop: 327734, statut: "Préfecture", lat: 47.2184, lng: -1.5536 },
    { rang: 7, commune: "Montpellier", dept: "34", region: "Occitanie", pop: 310240, statut: "Préfecture", lat: 43.6108, lng: 3.8767 },
    { rang: 8, commune: "Strasbourg", dept: "67", region: "Grand Est", pop: 293771, statut: "Préfecture", lat: 48.5734, lng: 7.7521 },
    { rang: 9, commune: "Bordeaux", dept: "33", region: "Nouvelle-Aquitaine", pop: 267991, statut: "Préfecture", lat: 44.8378, lng: -0.5792 },
    { rang: 10, commune: "Lille", dept: "59", region: "Hauts-de-France", pop: 238246, statut: "Préfecture", lat: 50.6292, lng: 3.0573 },
    { rang: 11, commune: "Rennes", dept: "35", region: "Bretagne", pop: 230890, statut: "Préfecture", lat: 48.1173, lng: -1.6778 },
    { rang: 12, commune: "Toulon", dept: "83", region: "PACA", pop: 179116, statut: "Préfecture", lat: 43.1242, lng: 5.9280 },
    { rang: 13, commune: "Reims", dept: "51", region: "Grand Est", pop: 177674, statut: "Sous-préfecture", lat: 49.2583, lng: 4.0317 },
    { rang: 14, commune: "Saint-Étienne", dept: "42", region: "Auvergne-Rhône-Alpes", pop: 173136, statut: "Préfecture", lat: 45.4397, lng: 4.3872 },
    { rang: 15, commune: "Le Havre", dept: "76", region: "Normandie", pop: 166687, statut: "Sous-préfecture", lat: 49.4944, lng: 0.1079 },
    { rang: 16, commune: "Villeurbanne", dept: "69", region: "Auvergne-Rhône-Alpes", pop: 163684, statut: "Commune", lat: 45.7719, lng: 4.8814 },
    { rang: 17, commune: "Dijon", dept: "21", region: "Bourgogne-Franche-Comté", pop: 161830, statut: "Préfecture", lat: 47.3220, lng: 5.0415 },
    { rang: 18, commune: "Angers", dept: "49", region: "Pays de la Loire", pop: 159022, statut: "Préfecture", lat: 47.4784, lng: -0.5563 },
    { rang: 19, commune: "Grenoble", dept: "38", region: "Auvergne-Rhône-Alpes", pop: 156140, statut: "Préfecture", lat: 45.1885, lng: 5.7245 },
    { rang: 20, commune: "Saint-Denis (Réunion)", dept: "974", region: "La Réunion", pop: 155634, statut: "Préfecture", lat: -20.8821, lng: 55.4507 },
    { rang: 21, commune: "Nîmes", dept: "30", region: "Occitanie", pop: 151839, statut: "Préfecture", lat: 43.8367, lng: 4.3601 },
    { rang: 22, commune: "Aix-en-Provence", dept: "13", region: "PACA", pop: 149695, statut: "Sous-préfecture", lat: 43.5297, lng: 5.4474 },
    { rang: 23, commune: "Saint-Denis (93)", dept: "93", region: "Île-de-France", pop: 149077, statut: "Sous-préfecture", lat: 48.9362, lng: 2.3574 },
    { rang: 24, commune: "Clermont-Ferrand", dept: "63", region: "Auvergne-Rhône-Alpes", pop: 146351, statut: "Préfecture", lat: 45.7772, lng: 3.0870 },
    { rang: 25, commune: "Le Mans", dept: "72", region: "Pays de la Loire", pop: 146249, statut: "Préfecture", lat: 48.0061, lng: 0.1996 }
  ];

  return NextResponse.json(populations);
}
