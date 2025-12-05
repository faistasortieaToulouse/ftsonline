// /src/app/api/visitefontaines/route.ts

import { NextResponse } from 'next/server';

// Définition du type pour la clarté
interface Fontaine {
    id: number;
    name: string;
    address: string;
    description: string;
}

// Les données des 56 fontaines (Nom de la Fontaine et Adresse)
const fontainesData: Fontaine[] = [
    {
        id: 1,
        name: "Fontaine de Lalande",
        address: "Place de l'Église Lalande, 31200 Toulouse",
        description: "Fontaine moderne, devant l'église du quartier.",
    },
    {
        id: 2,
        name: "Fontaine Ravary",
        address: "1, place du Chanoine Ravary, 31500 Toulouse",
        description: "Des têtes de lion en bronze jettent l'eau. Connue comme la 'source sacrée'.",
    },
    {
        id: 3,
        name: "Fontaine Jolimont",
        address: "Boulevard des Crêtes Jacques Chirac, 31500 Toulouse",
        description: "Fontaines d'aménagement urbain moderne (1971).",
    },
    {
        id: 4,
        name: "Fontaine de la Coquille",
        address: "159, avenue de la Gloire, 31500 Toulouse",
        description: "Ancien abreuvoir des chevaux du Maréchal Niel (1867).",
    },
    {
        id: 5,
        name: "Fontaine rideau d'eau Marengo",
        address: "Allées Xavier Sarradet, 31000 Toulouse",
        description: "Rideau d'eau de l'aménagement Busquets (2001).",
    },
    {
        id: 6,
        name: "Cascade d'eau de Marengo",
        address: "Allées Jean Jaurès / Gare Matabiau, 31000 Toulouse",
        description: "Fait partie du grand projet de réaménagement des Allées Jean Jaurès (Postérieur à 2014).",
    },
    {
        id: 7,
        name: "Fontaine Évasion",
        address: "Place d'Arménie, 31000 Toulouse",
        description: "Représente La Garonne et l'Aéronautique, l'air et l'eau (1987).",
    },
    {
        id: 8,
        name: "Fontaine Clémence Isaure",
        address: "Place de la Concorde, 31000 Toulouse",
        description: "Dite fontaine de la Poésie Romane ou de la Belle Paule (1911).",
    },
    {
        id: 9,
        name: "Jet d'eau de Compans-Caffarelli",
        address: "Jardin Compans-Caffarelli, 31000 Toulouse",
        description: "Grand bassin central avec jets d'eau (1980).",
    },
    {
        id: 10,
        name: "Fontaine Dame d'Elche",
        address: "Jardin Compans-Caffarelli, 31000 Toulouse",
        description: "Copie de la statue ibérique de la Dame d'Elche dans un bassin (1983).",
    },
    {
        id: 11,
        name: "Fontaine Arnaud-Bernard",
        address: "Place Arnaud-Bernard, 31000 Toulouse",
        description: "Plan d'eau et aménagement de la place (1970).",
    },
    {
        id: 12,
        name: "Fontaine des Tiercerettes",
        address: "Place des Tiercerettes, 31000 Toulouse",
        description: "Ornée de figures antiques en terre cuite Virebent (1985).",
    },
    {
        id: 13,
        name: "Fontaine de Carthaillac",
        address: "Rue Emile Carthaillac (jardin du cloître des Bernardins), 31000 Toulouse",
        description: "Fontaine située dans le jardin du cloître (1982).",
    },
    {
        id: 14,
        name: "Fontaine de Saint-Sernin",
        address: "Place Saint-Sernin, 31000 Toulouse",
        description: "Trois jets d'eau après la rénovation de la place (2020).",
    },
    {
        id: 15,
        name: "Fontaine de la Bibliothèque",
        address: "Rue du Périgord, 31000 Toulouse",
        description: "Connue comme la Fontaine de la Littérature classique / Jeune Littérature (1933).",
    },
    {
        id: 16,
        name: "Fontaine de Bologne",
        address: "Place de Bologne, 31000 Toulouse",
        description: "Aménagement urbain du secteur (1971).",
    },
    {
        id: 17,
        name: "Fontaine de Saint-Cyprien",
        address: "Place intérieure Saint-Cyprien, 31300 Toulouse",
        description: "Bassin urbain, puits du jour au-dessus du métro (1933).",
    },
    {
        id: 18,
        name: "Fontaine place Olivier",
        address: "Place des Oliviers, 31300 Toulouse",
        description: "Le monde aquatique et céleste, commémoration de l'inondation de 1875 (1993).",
    },
    {
        id: 19,
        name: "Fontaine Ariège et Garonne",
        address: "13ter, place Augustin Lafourcade, 31000 Toulouse",
        description: "Monumentale en bas-relief allégorique (1893).",
    },
    {
        id: 20,
        name: "Fontaine le soir de la vie",
        address: "Rond-point des Français Libres (Allées Jules Guesde), 31000 Toulouse",
        description: "Méditation sur la fin de vie, œuvre de J. Escoula (1910).",
    },
    {
        id: 21,
        name: "Fontaine du Jardin des Plantes",
        address: "Jardin des Plantes, 31000 Toulouse",
        description: "Fontaines et bassins d'agrément, dont celle du Moulin du Château Narbonnais (XIXe).",
    },
    {
        id: 22,
        name: "Fontaine du Grand Rond",
        address: "Jardin du Grand-Rond, 31000 Toulouse",
        description: "Gerbe d'eau et monument à la gloire de Toulouse (1828).",
    },
    {
        id: 23,
        name: "Fontaine Dupuy (Colonne Dupuy)",
        address: "Place Dupuy, 31000 Toulouse",
        description: "Colonne élevée à la Gloire du Général Dupuy (1834).",
    },
    {
        id: 24,
        name: "Fontaine Roland",
        address: "Place Roland / Boulevard Lazare Carnot, 31000 Toulouse",
        description: "Roland de Roncevaux, sculpture de J.J. Labatut (1892).",
    },
    {
        id: 25,
        name: "Fontaine Occitane",
        address: "Place Occitane, 31000 Toulouse",
        description: "Simple jet d'eau et aménagement moderne (1994).",
    },
    {
        id: 26,
        name: "Fontaine Sainte-Scarbes",
        address: "Place Sainte-Scarbes, 31000 Toulouse",
        description: "Représente Diane guerrière (1989).",
    },
    {
        id: 27,
        name: "Fontaine du Griffoulet",
        address: "Place Saint-Étienne, 31000 Toulouse",
        description: "Fontaine historique (1re mention en 1523).",
    },
    {
        id: 28,
        name: "Chantepleure Saint-Etienne",
        address: "Square Cardinal Saliège, 31000 Toulouse",
        description: "Chantepleure moderne située sur le square à proximité (1989).",
    },
    {
        id: 29,
        name: "Fontaine Rouaix",
        address: "Place Rouaix, 31000 Toulouse",
        description: "Colonne à Antique, colonne intemporelle (1829).",
    },
    {
        id: 30,
        name: "Fontaine de la Trinité",
        address: "Place de la Trinité, 31000 Toulouse",
        description: "Ornée des célèbres Sirènes ailées, œuvre d'Urbain Vitry (1826).",
    },
    {
        id: 31,
        name: "Fontaine Feuille d'eau",
        address: "Place de la Bourse, 31000 Toulouse",
        description: "Miroir d'eau ou cascade d'eau dans un aménagement moderne (1999).",
    },
    {
        id: 32,
        name: "Fontaine Garonne rue Boulbonne",
        address: "Rue Boulbonne, 31000 Toulouse",
        description: "Dite L'électricité de la Garonne, allégorie (1910).",
    },
    {
        id: 33,
        name: "Fontaine Edouard Privat",
        address: "Square Edouard Privat, 31000 Toulouse",
        description: "Caractérisée par trois jets d'eau dans le square.",
    },
    {
        id: 34,
        name: "Fontaine Xavier Darasse",
        address: "Rue Antoine Mercié, 31000 Toulouse",
        description: "Fontaine ornée de chantepleures qui déversent l'eau (1992).",
    },
    {
        id: 35,
        name: "Fontaine des Puits-Clos",
        address: "Rue des Puits-Clos, 31000 Toulouse",
        description: "Colonnes corinthiennes de la Dalbade, avec chantepleures (1741/1984).",
    },
    {
        id: 36,
        name: "Fontaine Saint-Panthaléon",
        address: "Place Roger Salengro, 31000 Toulouse",
        description: "Représente Le monde aquatique (1851).",
    },
    {
        id: 37,
        name: "Fontaine de la cour du Capitole",
        address: "Cour Henri IV (Capitole), 31000 Toulouse",
        description: "Bassin d'agrément dans la cour intérieure (1993).",
    },
    {
        id: 38,
        name: "Fontaine du Donjon",
        address: "Square Charles de Gaulle, 31000 Toulouse",
        description: "Fontaine sèche et jeux d'eau modernes près du Donjon (2013).",
    },
    {
        id: 39,
        name: "Fontaine des Capitouls",
        address: "Promenade des Capitouls (Place du Capitole), 31000 Toulouse",
        description: "Jets d'eau ou bassin d'agrément en façade du Capitole (1978).",
    },
    {
        id: 40,
        name: "Fontaine du Patio",
        address: "Centre commercial Place Occitane, 31000 Toulouse",
        description: "Fontaines d'agrément dans le patio du centre commercial (1978).",
    },
    {
        id: 41,
        name: "Fontaine Goudouli",
        address: "Place Wilson, 31000 Toulouse",
        description: "Fontaine monumentale au centre de la place (1907).",
    },
    {
        id: 42,
        name: "Fontaine Wallace (Allées Jean Jaurès)",
        address: "Allées Jean Jaurès, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 43,
        name: "Fontaine Wallace (Cours Dillon)",
        address: "Cours Dillon, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 44,
        name: "Fontaine Wallace (Grand Rond)",
        address: "Grand Rond, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 45,
        name: "Fontaine Wallace (Jardin des Plantes)",
        address: "Jardin des Plantes, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 46,
        name: "Fontaine Wallace (Place Saint-Georges)",
        address: "Place Saint-Georges, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 47,
        name: "Fontaine Wallace (Place Laganne)",
        address: "Place Laganne, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 48,
        name: "Fontaine Wallace (Place Pierre-François Combes)",
        address: "Place Pierre-François Combes, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
    },
    {
        id: 49,
        name: "Fontaine de la Patte d'Oie",
        address: "Place de la Patte d'Oie, 31300 Toulouse",
        description: "Aménagement urbain de la place, près de la station de métro (1993).",
    },
    {
        id: 50,
        name: "Fontaine de la Croix de Pierre",
        address: "Rond-point Pierre Bourthoumieux, 31300 Toulouse",
        description: "Aménagement urbain du secteur.",
    },
    {
        id: 51,
        name: "Fontaine Nakache",
        address: "Piscine municipale Alfred Nakache, Île du Ramier, 31400 Toulouse",
        description: "Fontaine située à la piscine municipale (1934).",
    },
    {
        id: 52,
        name: "Fontaine de la Reynerie",
        address: "Quartier de la Reynerie / Lac de Reynerie, 31100 Toulouse",
        description: "Aménagement urbain moderne (années 1970/1980).",
    },
    {
        id: 53,
        name: "Fontaine de Bellefontaine",
        address: "Place de la Reynerie, 31100 Toulouse",
        description: "Fontaine sur la dalle, près de la station de métro (1993).",
    },
    {
        id: 54,
        name: "Fontaine des Gilières",
        address: "Place Gilières (Lafourguette), 31100 Toulouse",
        description: "Fontaine d'aménagement de quartier (2002).",
    },
    {
        id: 55,
        name: "Fontaine de la Toque à Purpan",
        address: "Avenue de Grande-Bretagne (Hôtel Palladia), 31300 Toulouse",
        description: "Fontaine moderne sur le parvis ou dans l'enceinte de l'hôtel/campus de Purpan.",
    },
    {
        id: 56,
        name: "Fontaine du périphérique, Oncopole",
        address: "Rond-point Henri Sarramon, 31059 Toulouse",
        description: "Aménagement de rond-point moderne. Dite fontaine AZF.",
    },
];

export async function GET() {
    // Retourne les données formatées pour le composant
    const establishments = fontainesData.map(f => ({
        name: `${f.id}. ${f.name}`, // Ajoutez le numéro dans le nom pour l'affichage de la liste
        address: f.address,
        description: f.description // Inclure la description pour la fenêtre d'info
    }));
    return NextResponse.json(establishments);
}
