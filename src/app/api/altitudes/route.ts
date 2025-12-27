import { NextResponse } from "next/server";

export async function GET() {
  const altitudes = [
  { id: 1, nom: "Capitole (Centre)", altitude: 146, lat: 43.6045, lng: 1.4442, description: "Altitude de référence de la mairie." },
  { id: 2, nom: "Saint-Cyprien", altitude: 140, lat: 43.5979, lng: 1.4334, description: "Quartier bas en rive gauche, historiquement inondable." },
  { id: 3, nom: "Ginestous", altitude: 135, lat: 43.6425, lng: 1.4116, description: "Zone maraîchère et d'activités très basse au nord." },
  { id: 4, nom: "Jolimont", altitude: 160, lat: 43.6148, lng: 1.4627, description: "Crête dominant le centre-ville." },
  { id: 5, nom: "Côte Pavée", altitude: 200, lat: 43.5937, lng: 1.4682, description: "Quartier résidentiel sur les côteaux est." },
  { id: 6, nom: "Pech David", altitude: 263, lat: 43.5552, lng: 1.4468, description: "Point culminant de Toulouse (vue sur les Pyrénées)." },
  { id: 7, nom: "Pouvourville", altitude: 185, lat: 43.5615, lng: 1.4612, description: "Village perché au sud-est." },
  { id: 8, nom: "Lardenne", altitude: 155, lat: 43.5921, lng: 1.3855, description: "Plateau résidentiel à l'ouest." },
  { id: 9, nom: "Basso Cambo", altitude: 160, lat: 43.5684, lng: 1.3892, description: "Zone d'activité sur le plateau ouest." },
  { id: 10, nom: "Île du Ramier", altitude: 145, lat: 43.5855, lng: 1.4357, description: "Zone alluviale au milieu du fleuve." },
  { id: 11, nom: "Carmes (Centre)", altitude: 146, lat: 43.5991, lng: 1.4451, description: "Sommet de la cité antique, historiquement protégé des crues." },
  { id: 12, nom: "Bords de Garonne (Nord)", altitude: 115, lat: 43.6550, lng: 1.4150, description: "Point le plus bas de la commune, à la limite de Fenouillet." },
  { id: 13, nom: "Sept-Deniers", altitude: 138, lat: 43.6190, lng: 1.4120, description: "Quartier situé dans le lit majeur du fleuve, protégé par des digues." },
  { id: 14, nom: "Borderouge", altitude: 150, lat: 43.6330, lng: 1.4580, description: "Nouveau quartier au nord, légèrement plus haut que la plaine." },
  { id: 15, nom: "Croix-Daurade", altitude: 145, lat: 43.6300, lng: 1.4700, description: "Ancien faubourg situé au nord-est de la ville." },
  { id: 16, nom: "Montaudran", altitude: 155, lat: 43.5850, lng: 1.4780, description: "Quartier de l'innovation sur la terrasse sud-est." }
];

  return NextResponse.json(altitudes);
}