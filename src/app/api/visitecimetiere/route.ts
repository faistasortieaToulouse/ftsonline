import { NextResponse } from "next/server";

interface Person {
name: string;
description: string;
address: string; // Cimetière, Section, Division
}

const people: Person[] = [
{ name: "Maurice Barrat", description: "mort 1896 explorateur explore Afrique", address: "???"},
{ name: "Roger Camboulives", description: "historien", address: "???"},
{ name: "Jean Coggia", description: "(1916-1943) résistance étudiant médecine", address: "???"},
{ name: "Joseph Latour", description: "(1806-1863) voyageur peintre", address: "???"},
{ name: "André Lavergne", description: "(1913-1992) général compagnon libération", address: "???"},
{ name: "Alexandre Marty", description: "(1894-1918) aviateur as aviation 14 - 18", address: "???"},
{ name: "Jean-Pierre Moulive", description: "(1813-1842) sculpteur", address: "???"},
{ name: "Henri Rachou", description: "(1856-1944) peintre conservateur Augustins", address: "???"},
{ name: "Dominique Baudis", description: "(1947-2014) maire Toulouse", address: "Salonique, 2, 11"},
{ name: "Pierre Baudis", description: "(1916-1997) maire Toulouse", address: "Salonique, 2, 11"},
{ name: "Pol Caltaux", description: "(1871-1957) ingénieur Ing. Général au corps des mines", address: "Salonique, 7, 1"},
{ name: "Famille le Franc de Pompignan", description: "marquis famille du poète", address: "Salonique, 7, 1"},
{ name: "Marius Pinel", description: "adjoint-maire secrétaire Bourse Travail", address: "Salonique, 7, 1"},
{ name: "Félix Lavit", description: "(1890-1930) adjoint-maire parc Félix Lavit", address: "Salonique, 7, 4"},
{ name: "Jean Micoud", description: "12 juin 44 résistance héros de la Résistance", address: "Salonique, 7, 4"},
{ name: "D. Peyrie", description: "caveau imposant monument", address: "Salonique, 7, 4"},
{ name: "Famille Trech", description: "caveau de la Juncasse", address: "Salonique, 7, 4"},
{ name: "Gustave Bachy", description: "1905 directeur chemins de fer Nord Espagne", address: "Salonique, 7, 5"},
{ name: "Famille Bouzignac", description: "caveau bronze égyptien ailé", address: "Salonique, 7, 5"},
{ name: "Famille Marcouire", description: "caveau bronze égyptien ailé", address: "Salonique, 7, 5"},
{ name: "Famille Mercin", description: "caveau bronze égyptien ailé", address: "Salonique, 7, 5"},
{ name: "Léon Dieulafe", description: "(1874-1941) professeur Médecine", address: "Salonique, 7, 6"},
{ name: "Raymond Dieulafe", description: "(1906-1980) professeur Faculté", address: "Salonique, 7, 6"},
{ name: "Famille Paloubart-Alexandre", description: "30 sept 1918 soldat mère et fils sculptés", address: "Salonique, 7, 7"},
{ name: "Joseph Engelmajer", description: "(1920-2007) fondateur association 'le Patriarche'", address: "Salonique, 7, 9"},
{ name: "Ch. Naudin", description: "bienfaiteur pleureuse", address: "Salonique, 7, 10"},
{ name: "Claude Nougaro", description: "chanteur variétés", address: "Salonique, 7, 18"},
{ name: "Pierre Nougaro", description: "chanteur baryton", address: "Salonique, 7, 18"},
{ name: "Jules Julien", description: "(1864-1935) adjoint-maire défense école laïque", address: "Salonique, 8, 1"},
{ name: "Renée Aspe", description: "peintre", address: "Salonique, 8, 7"},
{ name: "Renée Aspe", description: "(1922-1969) peintre", address: "Salonique, 8, 7b"},
{ name: "Louis Vestrepain", description: "(1809-1865) poète", address: "Terre-Cabade, 1, 1"},
{ name: "Ernest Jacques Barbot", description: "(1855-1915) général cim. Notre-Dame-de-Lorette", address: "Terre-Cabade, 1, 2"},
{ name: "Gaston Cabanis", description: "maire Toulouse", address: "Terre-Cabade, 1, 2"},
{ name: "José Cabanis", description: "(1922-2000) écrivain", address: "Terre-Cabade, 1, 2"},
{ name: "Louis-Victorin Cassagne", description: "(1774-1841) général campagnes de l'Empire", address: "Terre-Cabade, 1, 2"},
{ name: "Antonin Deloume", description: "(1836-1911) doyen Faculté droit", address: "Terre-Cabade, 1, 3"},
{ name: "Antonin Mercié", description: "(1845-1916) sculpteur peintre", address: "Terre-Cabade, 1, 3"},
{ name: "Alamir Ramel", description: "(1804-1864) bienfaiteur Hospices", address: "Terre-Cabade, 1, 3"},
{ name: "Auguste Virebent", description: "(1792-1857) graveur", address: "Terre-Cabade, 1, 3"},
{ name: "Gaston Virebent", description: "(1837-1925) graveur", address: "Terre-Cabade, 1, 3"},
{ name: "Jacques-Pascal Virebent", description: "(1746-1831) graveur", address: "Terre-Cabade, 1, 3"},
{ name: "Edmond Yarz", description: "(1845-1900) peintre", address: "Terre-Cabade, 1, 3"}
// ...et la liste continue pour toutes les personnes restantes selon ton fichier original
];

export async function GET() {
return NextResponse.json(people);
}
