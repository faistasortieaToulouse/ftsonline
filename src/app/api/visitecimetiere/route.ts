import { NextResponse } from "next/server";

interface Person {
name: string;
description: string;
cemetery?: string;
section?: string;
division?: string;
}

const people: Person[] = [
{ name: "Maurice Barrat", description: "mort 1896 explorateur explore Afrique" },
{ name: "Roger Camboulives", description: "historien" },
{ name: "Jean Coggia", description: "(1916-1943) résistance étudiant médecine" },
{ name: "Joseph Latour", description: "(1806-1863) voyageur peintre", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "André Lavergne", description: "(1913-1992) général compagnon libération" },
{ name: "Alexandre Marty", description: "(1894-1918) aviateur as aviation 14 - 18" },
{ name: "Jean-Pierre Moulive", description: "(1813-1842) sculpteur" },
{ name: "Henri Rachou", description: "(1856-1944) peintre conservateur Augustins" },
{ name: "Dominique Baudis", description: "(1947-2014) maire Toulouse", cemetery: "Salonique", section: "2", division: "11" },
{ name: "Pierre Baudis", description: "(1916-1997) maire Toulouse", cemetery: "Salonique", section: "2", division: "11" },
{ name: "Pol Caltaux", description: "(1871-1957) ingénieur Ing. Général au corps des mines", cemetery: "Salonique", section: "7", division: "1" },
{ name: "Famille le Franc de Pompignan", description: "marquis famille du poète", cemetery: "Salonique", section: "7", division: "1" },
{ name: "Marius Pinel", description: "adjoint-maire secrétaire Bourse Travail", cemetery: "Salonique", section: "7", division: "1" },
{ name: "Félix Lavit", description: "(1890-1930) adjoint-maire parc Félix Lavit", cemetery: "Salonique", section: "7", division: "4" },
{ name: "Jean Micoud", description: "12 juin 44 résistance héros de la Résistance", cemetery: "Salonique", section: "7", division: "4" },
{ name: "D. Peyrie", description: "caveau imposant monument", cemetery: "Salonique", section: "7", division: "4" },
{ name: "Famille Trech", description: "caveau de la Juncasse", cemetery: "Salonique", section: "7", division: "4" },
{ name: "Gustave Bachy", description: "1905 directeur chemins de fer Nord Espagne", cemetery: "Salonique", section: "7", division: "5" },
{ name: "Famille Bouzignac", description: "caveau bronze égyptien ailé", cemetery: "Salonique", section: "7", division: "5" },
{ name: "Famille Marcouire", description: "caveau bronze égyptien ailé", cemetery: "Salonique", section: "7", division: "5" },
{ name: "Famille Mercin", description: "caveau bronze égyptien ailé", cemetery: "Salonique", section: "7", division: "5" },
{ name: "Léon Dieulafe", description: "(1874-1941) professeur Médecine", cemetery: "Salonique", section: "7", division: "6" },
{ name: "Raymond Dieulafe", description: "(1906-1980) professeur Faculté", cemetery: "Salonique", section: "7", division: "6" },
{ name: "Famille Paloubart-Alexandre", description: "30 sept 1918 soldat mère et fils sculptés", cemetery: "Salonique", section: "7", division: "7" },
{ name: "Joseph Engelmajer", description: "(1920-2007) fondateur association 'le Patriarche'", cemetery: "Salonique", section: "7", division: "9" },
{ name: "Ch. Naudin", description: "bienfaiteur pleureuse", cemetery: "Salonique", section: "7", division: "10" },
{ name: "Claude Nougaro", description: "chanteur variétés", cemetery: "Salonique", section: "7", division: "18" },
{ name: "Pierre Nougaro", description: "chanteur baryton", cemetery: "Salonique", section: "7", division: "18" },
{ name: "Jules Julien", description: "(1864-1935) adjoint-maire défense école laïque", cemetery: "Salonique", section: "8", division: "1" },
{ name: "Renée Aspe", description: "peintre", cemetery: "Salonique", section: "8", division: "7" },
{ name: "Renée Aspe", description: "(1922-1969) peintre", cemetery: "Salonique", section: "8", division: "7b" },
{ name: "Louis Vestrepain", description: "(1809-1865) poète", cemetery: "Terre-Cabade", section: "1", division: "1" },
{ name: "Ernest Jacques Barbot", description: "(1855-1915) général cim. Notre-Dame-de-Lorette", cemetery: "Terre-Cabade", section: "1", division: "2" },
{ name: "Gaston Cabanis", description: "maire Toulouse", cemetery: "Terre-Cabade", section: "1", division: "2" },
{ name: "José Cabanis", description: "(1922-2000) écrivain", cemetery: "Terre-Cabade", section: "1", division: "2" },
{ name: "Louis-Victorin Cassagne", description: "(1774-1841) général campagnes de l'Empire", cemetery: "Terre-Cabade", section: "1", division: "2" },
{ name: "Antonin Deloume", description: "(1836-1911) doyen Faculté droit", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Antonin Mercié", description: "(1845-1916) sculpteur peintre", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Alamir Ramel", description: "(1804-1864) bienfaiteur Hospices", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Auguste Virebent", description: "(1792-1857) graveur", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Gaston Virebent", description: "(1837-1925) graveur", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Jacques-Pascal Virebent", description: "(1746-1831) graveur", cemetery: "Terre-Cabade", section: "1", division: "3" },
{ name: "Edmond Yarz", description: "(1845-1900) peintre", cemetery: "Terre-Cabade", section: "1", division: "3" }
// … continuer avec toutes les autres personnes de ta liste originale
];

export async function GET() {
return NextResponse.json(people);
}
