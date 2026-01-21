// /src/app/api/visitefontaines/route.ts

import { NextResponse } from 'next/server';

interface Fontaine {
    id: number;
    name: string;
    address: string;
    description: string;
    details: string; // Ajout du champ détails
}

const fontainesData: Fontaine[] = [
    {
        id: 1,
        name: "Fontaine de Lalande",
        address: "Place de l'Église Lalande, 31200 Toulouse",
        description: "Fontaine moderne, devant l'église du quartier.",
        details: "Même fontaine que celle des Gilières. Bassin octogonal où l'eau est déversée par quatre mufles de lion installés sur quatre faces d'un édicule terminé par une boule au milieu du bassin (2002).",
        latitude: 43.646628,
        longitude: 1.430903
    },
    {
        id: 2,
        name: "Fontaine Ravary",
        address: "1, place du Chanoine Ravary, 31500 Toulouse",
        description: "Des têtes de lion en bronze jettent l'eau. Connue comme la 'source sacrée'.",
        details: "Deux lions d'où sort l'eau encadrent deux fenêtres gothiques. Un médaillon porte la Croix Occitane. La source, à 13m de profondeur, a été découverte en 1863. Fontaine inaugurée en 1944.",
        latitude: 43.618691,
        longitude: 1.458134
    },
    {
        id: 3,
        name: "Fontaine Jolimont",
        address: "Boulevard des Crêtes Jacques Chirac, 31500 Toulouse",
        description: "Fontaines d'aménagement urbain moderne (1971).",
        details: "Animation d'un grand axe de circulation (1971) avec de multiples jets et gerbes d'eau. Fontaine lumineuse de type espagnol, semblable à celles de Barcelone.",
        latitude: 43.614448,
        longitude: 1.465907
    },
    {
        id: 4,
        name: "Fontaine de la Coquille",
        address: "159, avenue de la Gloire, 31500 Toulouse",
        description: "Ancien abreuvoir des chevaux du Maréchal Niel (1867).",
        details: "Bassin rectangulaire orné d'une coquille Saint-Jacques, supportée par un putto (jeune garçon nu représentant l'Amour) (1867).",
        latitude: 43.606790,
        longitude: 1.471907
    },

    {
        id: 5,
        name: "Fontaine rideau d'eau Marengo",
        address: "Allées Xavier Sarradet, 31000 Toulouse",
        description: "Rideau d'eau de l'aménagement Busquets (2001).",
        details: "Blocs de marbre reliés verticalement sur deux plans horizontaux. Crée un effet de coulisse qui protège la promenade vers le boulevard de la ville (2001).",
        latitude: 43.6094,
        longitude: 1.4539
    },
    {
        id: 6,
        name: "Cascade d'eau de Marengo",
        address: "Allées Jean Jaurès / Gare Matabiau, 31000 Toulouse",
        description: "Fait partie du grand projet de réaménagement des Allées Jean Jaurès (Postérieur à 2014).",
        details: "Fait partie du grand projet de réaménagement des Allées Jean Jaurès (Postérieur à 2014).",
        latitude: 43.6105,
        longitude: 1.4532
    },
    {
        id: 7,
        name: "Fontaine Évasion",
        address: "Place d'Arménie, 31000 Toulouse",
        description: "Représente La Garonne et l'Aéronautique, l'air et l'eau (1987).",
        details: "Sculpture d'une Naïade (nymphe aquatique) et d'une Déesse des airs, sculptées par les courants d'air et les rafales du vent d'Autan. Évocation de la Garonne, de l'air et de l'aéronautique, donnant un sentiment de légèreté et de fraîcheur (1987).",
        latitude: 43.6062,
        longitude: 1.4497
    },
    {
        id: 8,
        name: "Fontaine Clémence Isaure",
        address: "Place de la Concorde, 31000 Toulouse",
        description: "Dite fontaine de la Poésie Romane ou de la Belle Paule (1911).",
        details: "Clémence Isaure sous les traits de la Belle Paule. Sept anges posent leur regard sur les troubadours. Ornée de trois jeunes filles sculptées représentant les trois fleurs remises aux Jeux Floraux : la violette, l'églantine et le souci. Évoque l'Art Nouveau et l'Art Courtois (1911).",
        latitude: 43.6114,
        longitude: 1.4468
    },
    {
        id: 9,
        name: "Jet d'eau de Compans-Caffarelli",
        address: "Jardin Compans-Caffarelli, 31000 Toulouse",
        description: "Grand bassin central avec jets d'eau (1980).",
        details: "Imite le jet d'eau du lac de Genève. Pièce d'eau principale du jardin Compans-Caffarelli (1980).",
        latitude: 43.6110,
        longitude: 1.4363
    },
    {
        id: 10,
        name: "Fontaine Dame d'Elche",
        address: "Jardin Compans-Caffarelli, 31000 Toulouse",
        description: "Copie de la statue ibérique de la Dame d'Elche dans un bassin (1983).",
        details: "Reproduction de la Dame d'Elche (IVe siècle av. J.-C.) avec mitre et boucles d'oreilles. Ses vêtements et parure évoquent sa puissance et sa position sociale (1983).",
        latitude: 43.6106,
        longitude: 1.4355
    },
    {
        id: 11,
        name: "Fontaine Arnaud-Bernard",
        address: "Place Arnaud-Bernard, 31000 Toulouse",
        description: "Plan d'eau et aménagement de la place (1970).",
        details: "Petit bassin avec gerbes d'eau s'échappant d'une cascade. Aménagé en 1970, il fut détruit et réaménagé plusieurs fois. Aujourd'hui, on trouve un autre bassin avec 8 jets d'eau.",
        latitude: 43.6106,
        longitude: 1.4377
    },
    {
        id: 12,
        name: "Fontaine des Tiercerettes",
        address: "Place des Tiercerettes, 31000 Toulouse",
        description: "Ornée de figures antiques en terre cuite Virebent (1985).",
        details: "Utilise des moules de Virebent. Représente des scènes mythologiques : Poséidon sur son char tiré par des dauphins, tritons soufflant dans des cornes, chevaux de mer, têtes de béliers, faunes ailés et masques grotesques (1985).",
        latitude: 43.6089,
        longitude: 1.4382
    },
    {
        id: 13,
        name: "Fontaine de Carthaillac",
        address: "Rue Emile Carthaillac (jardin du cloître des Bernardins), 31000 Toulouse",
        description: "Fontaine située dans le jardin du cloître (1982).",
        details: "Bassin de brique avec un édicule rectangulaire orné de quatre mascarons en terre cuite qui versent l'eau. Ces mascarons sont des masques de théâtre antiques (1982).",
        latitude: 43.6074,
        longitude: 1.4388
    },
    {
        id: 14,
        name: "Fontaine de Saint-Sernin",
        address: "Place Saint-Sernin, 31000 Toulouse",
        description: "Trois jets d'eau après la rénovation de la place (2020).",
        details: "Trois jets d'eau symbolisant la Sainte-Trinité et les trois cierges du baptistère. L'eau s'écoule au milieu de l'anneau de l'alliance (le rosaire), au rythme d'un psaume (2020).",
        latitude: 43.6082,
        longitude: 1.4418
    },
    {
        id: 15,
        name: "Fontaine de la Bibliothèque",
        address: "Rue du Périgord, 31000 Toulouse",
        description: "Connue comme la Fontaine de la Littérature classique / Jeune Littérature (1933).",
        details: "Deux statues féminines se tournent le dos et s'ignorent : la Classique (pudique, respect des règles) et la Moderne (juvénile, sans retenue). Elles symbolisent la querelle entre Anciens et Modernes dans l'écriture (1933).",
        latitude: 43.6068,
        longitude: 1.4431
    },
    {
        id: 16,
        name: "Fontaine de Bologne",
        address: "Place de Bologne, 31000 Toulouse",
        description: "Aménagement urbain du secteur (1971).",
        details: "Deux bassins octogonaux avec trois marches d'escaliers. L'eau retombe du bassin supérieur sous forme de rideau. Un obélisque central se dresse au milieu du bassin (1971, 1991).",
        latitude: 43.6053,
        longitude: 1.4381
    },
    {
        id: 17,
        name: "Fontaine de Saint-Cyprien",
        address: "Place intérieure Saint-Cyprien, 31300 Toulouse",
        description: "Bassin urbain, puits du jour au-dessus du métro (1933).",
        details: "Mur incliné d'un seul pan, composé de milliers de briques, évoquant un clavier harmonique. Sert de puits de lumière au métro. Allégorie de la continuité architecturale de Toulouse (1933).",
        latitude: 43.5983,
        longitude: 1.4334
    },
    {
        id: 18,
        name: "Fontaine place Olivier",
        address: "Place des Oliviers, 31300 Toulouse",
        description: "Le monde aquatique et céleste, commémoration de l'inondation de 1875 (1993).",
        details: "Commémoration de l'inondation de 1875. Une Déesse veille sur les eaux. Elle est entourée d'anges libellules (pensée intérieure) et de petits anges en deuil, perpétuant le souvenir des disparus. Tritons, tortues, héron et roseaux composent le monde aquatique à ses pieds (1993).",
        latitude: 43.5996,
        longitude: 1.4347
    },
    {
        id: 19,
        name: "Fontaine Ariège et Garonne",
        address: "13ter, place Augustin Lafourcade, 31000 Toulouse",
        description: "Monumentale en bas-relief allégorique (1893).",
        details: "La Garonne (puissante, sereine, étirant ses bras) et l'Ariège (sa cadette, discrète, pelotonnée). La composition triangulaire évoque l'écoulement des eaux des Pyrénées vers l'océan (1893).",
        latitude: 43.5927,
        longitude: 1.4442
    },
    {
        id: 20,
        name: "Fontaine le soir de la vie",
        address: "Rond-point des Français Libres (Allées Jules Guesde), 31000 Toulouse",
        description: "Méditation sur la fin de vie, œuvre de J. Escoula (1910).",
        details: "Méditation sur la fin de vie. Le voile qui tombe symbolise la mort (nuit). Jeunesse (jeune fille offrant un bouquet) et Vieillesse (vieillards). Le poète est accompagné de la musique (lyre) et de la poésie, ses égéries de jeunesse. Fontaine ouverte en forme d'hémicycle (1910).",
        latitude: 43.5946,
        longitude: 1.4503
    },
    {
        id: 21,
        name: "Fontaine du Jardin des Plantes",
        address: "Jardin des Plantes, 31000 Toulouse",
        description: "Fontaines et bassins d'agrément, dont celle du Moulin du Château Narbonnais (XIXe siècle).",
        details: "Le bassin évoque l'impluvium (bassin romain récepteur des pluies) des maisons romaines. Le faible jet d'eau au milieu reflète les images du jardin et du ciel. Le motif du bassin est la feuille (XIXe siècle).",
        latitude: 43.5936,
        longitude: 1.4518
    },
    {
        id: 22,
        name: "Fontaine du Grand Rond",
        address: "Jardin du Grand-Rond, 31000 Toulouse",
        description: "Gerbe d'eau et monument à la gloire de Toulouse (1828).",
        details: "Jet d'eau imitant celui du Palais Royal de Paris (1828, rénovée en 1935). Il jaillit en gerbe, couronne et rideaux, évoquant la magnificence de la ville de Toulouse.",
        latitude: 43.5961,
        longitude: 1.4532
    },
    {
        id: 23,
        name: "Fontaine Dupuy (Colonne Dupuy)",
        address: "Place Dupuy, 31000 Toulouse",
        description: "Colonne élevée à la Gloire du Général Dupuy (1834).",
        details: "Colonne élevée à la Gloire du Général Dupuy (campagne d'Italie). Quatre griffons (aigle et lion, maître du temps et de l'espace) partagent les points cardinaux. La Renommée, au pinacle, projette les couronnes de lauriers. Glorifie la mort du général (1834).",
        latitude: 43.600020,
        longitude: 1.453747
    },
    {
        id: 24,
        name: "Fontaine Roland",
        address: "Place Roland / Boulevard Lazare Carnot, 31000 Toulouse",
        description: "Roland de Roncevaux, sculpture de J.J. Labatut (1892).",
        details: "Monument à la gloire des combattants. Représente Roland (capitaine de Charlemagne), soutenu par son épée Durandal, et son beau-frère Olivier mourant à ses pieds. Ayant accompli son devoir, Roland peut mourir (1892).",
        latitude: 43.603398,
        longitude: 1.451350
    },
    {
        id: 25,
        name: "Fontaine Occitane",
        address: "Place Occitane, 31000 Toulouse",
        description: "Simple jet d'eau et aménagement moderne (1994).",
        details: "Fait partie du complexe Fontaines Lumière Mouvement. Bassin octogonal avec jet central en forme de parapluie, relié à la cascade qui descend vers le bassin rectangulaire de la promenade des Capitouls (1978).",
        latitude: 43.603194,
        longitude: 1.449911
    },
    {
        id: 26,
        name: "Fontaine Sainte-Scarbes",
        address: "Place Sainte-Scarbes, 31000 Toulouse",
        description: "Représente Diane guerrière (1989).",
        details: "Fontaine conique qui accueillait Diane Guerrière, la chasseresse. L'eau jaillit de la gueule de lions, rappelant la chasse. Diane est en position de vainqueur, délivrant les nouveaux-nés et ouvrant la voie de la vie (1989, 2002).",
        latitude: 43.598313,
        longitude: 1.448857
    },
    {
        id: 27,
        name: "Fontaine du Griffoulet",
        address: "Place Saint-Étienne, 31000 Toulouse",
        description: "Fontaine historique (1re mention en 1523).",
        details: "Mascarons aux visages austères (symbolisant la face du temps) rejettent l'eau par la bouche. Les armoiries des capitouls, la fleur de lys et le fanion au sommet rappellent l'ordre et le pouvoir (1523).",
        latitude: 43.599862,
        longitude: 1.449283
    },
    {
        id: 28,
        name: "Chantepleure Saint-Etienne",
        address: "Square Cardinal Saliège, 31000 Toulouse",
        description: "Chantepleure moderne située sur le square à proximité (1989).",
        details: "L'eau s'écoule dans un bassin ovoïde en pierre et brique. Fontaine adossée à l'édicule du square (1989).",
        latitude: 43.600177,
        longitude: 1.450301
    },
    {
        id: 29,
        name: "Fontaine Rouaix",
        address: "Place Rouaix, 31000 Toulouse",
        description: "Colonne à Antique, colonne intemporelle (1829).",
        details: "Colonne intemporelle (1829). La composition (octogonale, carrée, triangle, cercle) symbolise la fusion du matériel et du spirituel. Deux lions pharaoniques (résurrection, Nil fécondateur) et deux dauphins. Huit bornes érigent la colonne en temple (1829).",
        latitude: 43.6001,
        longitude: 1.4449
    },
    {
        id: 30,
        name: "Fontaine de la Trinité",
        address: "Place de la Trinité, 31000 Toulouse",
        description: "Ornée des célèbres Sirènes ailées, œuvre d'Urbain Vitry (1826).",
        details: "Surnommée 'Temple de l'Eau'. L'oiseau (sirène ailée) perce le rideau d'eau. Les anneaux de cercles et la coupole (cercle inversé) symbolisent l'élévation spirituelle. Le doux chant émane des sirènes (1826).",
        latitude: 43.5998,
        longitude: 1.4444
    },
    {
        id: 31,
        name: "Fontaine Feuille d'eau",
        address: "Place de la Bourse, 31000 Toulouse",
        description: "Miroir d'eau ou cascade d'eau dans un aménagement moderne (1999).",
        details: "Eau rafraîchissante destinée au promeneur. Le motif de la pluie donne la vie à la feuille. L'eau peut être interrompue pour boire (1999).",
        latitude: 43.6010,
        longitude: 1.4411
    },
    {
        id: 32,
        name: "Fontaine Garonne rue Boulbonne",
        address: "Rue Boulbonne, 31000 Toulouse",
        description: "Dite L'électricité de la Garonne, allégorie de la ville de Toulouse et du fleuve (1910).",
        details: "L'impétueuse Garonne est aux pieds de Dame Toulouse (en costume traditionnel, appuyée sur les armoiries). Elle lui tend une sphère, symbole de la lumière émise par la Fée Électricité (1910, 1984).",
        latitude: 43.6006,
        longitude: 1.4468
    },
    {
        id: 33,
        name: "Fontaine Edouard Privat",
        address: "Square Edouard Privat, 31000 Toulouse",
        description: "Caractérisée par trois jets d'eau dans le square.",
        details: "Socle de pierre quadrilobe. Trois jets d'eau symbolisent la Sainte-Trinité. Fontaine simple devant le couvent des Augustins, évoquant la pureté (inconnue).",
        latitude: 43.6011,
        longitude: 1.4462
    },
    {
        id: 34,
        name: "Fontaine Xavier Darasse",
        address: "Rue Antoine Mercié, 31000 Toulouse",
        description: "Fontaine ornée de chantepleures qui déversent l'eau (1992).",
        details: "Les chantepleures (note grave du ruissellement) et la petite table-clavier représentent l'orgue. Le musicien toulousain est figé sur un nuage (réfléchissant la lumière de l'invisible) pour l'éternité. Forts contrastes, comme sa musique (1992).",
        latitude: 43.6015,
        longitude: 1.4455
    },
    {
        id: 35,
        name: "Fontaine des Puits-Clos",
        address: "Rue des Puits-Clos, 31000 Toulouse",
        description: "Colonnes corinthiennes de la Dalbade, avec chantepleures (1741/1984).",
        details: "Les colonnes du rétable (1741) forment un temple imaginaire. Les chantepleures figurent les naos grecs. L'ensemble est un temple de briques dont les chapiteaux sont de type corinthien à feuilles d'acanthe (installée en 1984).",
        latitude: 43.6015,
        longitude: 1.4439
    },
    {
        id: 36,
        name: "Fontaine Saint-Panthaléon",
        address: "Place Roger Salengro, 31000 Toulouse",
        description: "Représente Le monde aquatique (1851).",
        details: "Korê grecque (déesse du monde souterrain) au sommet. L'eau retourne au ciel (cycle de l'eau). Tritons sur tortues (gouvernent les profondeurs), hérons, martins-pêcheurs, grèbes, roseaux et joncs, illustrant le cycle de la vie (1851, 1852).",
        latitude: 43.6023,
        longitude: 1.4447
    },
    {
        id: 37,
        name: "Fontaine de la cour du Capitole",
        address: "Cour Henri IV (Capitole), 31000 Toulouse",
        description: "Bassin d'agrément dans la cour intérieure (1993).",
        details: "Socle de granit et quatre socles de verre sur lesquels s'écoule l'eau (quatre rideaux). Copie de la statue de Victor Segoffin, 'La Suppliante' (1993).",
        latitude: 43.6044,
        longitude: 1.4442
    },
    {
        id: 38,
        name: "Fontaine du Donjon",
        address: "Square Charles de Gaulle, 31000 Toulouse",
        description: "Fontaine sèche et jeux d'eau modernes près du Donjon (2013).",
        details: "Quatorze jets d'eau (les musiciens) applaudissent le poète Nougaro qui marche sur la dalles noire (la scène). Le jet majeur est le 'do', la lumière est le 'dièse'. Elle évoque la résurrection de la vie artistique du maestro (2013).",
        latitude: 43.6047,
        longitude: 1.4452
    },
    {
        id: 39,
        name: "Fontaine des Capitouls",
        address: "Promenade des Capitouls (Place du Capitole), 31000 Toulouse",
        description: "Jets d'eau ou bassin d'agrément en façade du Capitole (1978).",
        details: "Fait partie du complexe Fontaines Lumière Mouvement. Cascade qui descend de la place Occitane vers un grand bassin rectangulaire, avec 16 lames d'eau formant une voûte (1978).",
        latitude: 43.6039,
        longitude: 1.4449
    },
    {
        id: 40,
        name: "Fontaine du Patio",
        address: "Centre commercial Place Occitane, 31000 Toulouse",
        description: "Fontaines d'agrément dans le patio du centre commercial (1978).",
        details: "Fait partie du complexe Fontaines Lumière Mouvement. L'eau s'écoule en cascade d'un réceptacle à un autre. Le premier bassin, octogonal, a trois jets d'eau formant un champignon (1978).",
        latitude: 43.6030,
        longitude: 1.4495
    },
    {
        id: 41,
        name: "Fontaine Goudouli",
        address: "Place Wilson, 31000 Toulouse",
        description: "Fontaine monumentale au centre de la place (1907).",
        details: "Hommage au poète Pierre Goudouli (1907). L'allégorie de sa muse, Érato (déesse de la poésie), est couchée à ses pieds, représentant la Garonne. La gerbe d'eau à l'arrière est la scène de théâtre à l'italienne.",
        latitude: 43.60487,
        longitude: 1.44737
    },
    {
        id: 42,
        name: "Fontaine Wallace (Allées Jean Jaurès)",
        address: "Allées Jean Jaurès, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps). Offertes pour ne pas s'adonner à l'alcool. Sculptées par Charles Lebourg, fondues par Barbezat (1872 à Paris, ~1900 à Toulouse).",
        latitude: 43.60670,
        longitude: 1.45030
    },
    {
        id: 43,
        name: "Fontaine Wallace (Cours Dillon)",
        address: "Cours Dillon, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.59790,
        longitude: 1.43730
    },
    {
        id: 44,
        name: "Fontaine Wallace (Grand Rond)",
        address: "Grand Rond, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.59470,
        longitude: 1.45330
    },
    {
        id: 45,
        name: "Fontaine Wallace (Jardin des Plantes)",
        address: "Jardin des Plantes, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.59245,
        longitude: 1.45095
    },
    {
        id: 46,
        name: "Fontaine Wallace (Place Saint-Georges)",
        address: "Place Saint-Georges, 31000 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.60211,
        longitude: 1.44788
    },
    {
        id: 47,
        name: "Fontaine Wallace (Place Laganne)",
        address: "Place Laganne, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.5985,
        longitude: 1.4379
    },
    {
        id: 48,
        name: "Fontaine Wallace (Place Pierre-François Combes)",
        address: "Place Pierre-François Combes, 31300 Toulouse",
        description: "Modèle classique Wallace (carriatides) pour l'eau potable (~1900).",
        details: "Vénus née des eaux. Les quatre cariatides représentent la Bonté (Hiver), la Charité (Été), la Sobriété (Automne) et la Simplicité (Printemps).",
        latitude: 43.5957,
        longitude: 1.4293
    },
    {
        id: 49,
        name: "Fontaine de la Patte d'Oie",
        address: "Place de la Patte d'Oie, 31300 Toulouse",
        description: "Aménagement urbain de la place, près de la station de métro (1993).",
        details: "Carrefour important (1993). Gerbe centrale encerclée par une corolle de jets. L'amphore évidée distribue l'eau dans les 'pattes d'oie' et rappelle la proximité des Arènes romaines.",
        latitude: 43.5973,
        longitude: 1.4243
    },
    {
        id: 50,
        name: "Fontaine de la Croix de Pierre",
        address: "Rond-point Pierre Bourthoumieux, 31300 Toulouse",
        description: "Aménagement urbain du secteur.",
        details: "Bassin circulaire de pierre flammée. Quatre rangs de jets d'eau croissants forment un spectacle. Le rond-point donnait autrefois l'heure (inconnue).",
        latitude: 43.5847,
        longitude: 1.4277
    },
    {
        id: 51,
        name: "Fontaine Nakache",
        address: "Piscine municipale Alfred Nakache, Île du Ramier, 31400 Toulouse",
        description: "Fontaine située à la piscine municipale (1934).",
        details: "Jeune femme (Vénus/Astarté, l'Hygiène) dont le bras repose sur une urne d'où sort l'eau. Un enfant repose à ses côtés. Évoque l'hygiène comme servante de la beauté et la volonté de rendre accessible l'air, l'eau et la lumière (1934).",
        latitude: 43.5866,
        longitude: 1.4348
    },
    {
        id: 52,
        name: "Fontaine de la Reynerie",
        address: "Quartier de la Reynerie / Lac de Reynerie, 31100 Toulouse",
        description: "Aménagement urbain moderne (années 1970/1980).",
        details: "Aménagement urbain moderne du secteur de la Reynerie (années 1970/1980).",
        latitude: 43.5708,
        longitude: 1.4015
    },
    {
        id: 53,
        name: "Fontaine de Bellefontaine",
        address: "Place de la Reynerie, 31100 Toulouse",
        description: "Fontaine sur la dalle, près de la station de métro (1993).",
        details: "L'eau s'écoule du plafond sur un mur de verre de la station de métro Bellefontaine. L'eau est mise en scène, parfois avec une vis d'Archimède, évoquant la lumière et la transparence (1993).",
        latitude: 43.5684,
        longitude: 1.4018
    },
    {
        id: 54,
        name: "Fontaine des Gilières",
        address: "Place Gilières (Lafourguette), 31100 Toulouse",
        description: "Fontaine d'aménagement de quartier (2002).",
        details: "Même fontaine que celle de Lalande. Bassin octogonal où l'eau est déversée par quatre mufles de lion installés sur quatre faces d'un édicule terminé par une boule au milieu du bassin (2002).",
        latitude: 43.5607,
        longitude: 1.4053
    },
    {
        id: 55,
        name: "Fontaine de la Toque à Purpan",
        address: "Avenue de Grande-Bretagne (Hôtel Palladia), 31300 Toulouse",
        description: "Fontaine moderne sur le parvis ou dans l'enceinte de l'hôtel/campus de Purpan.",
        details: "Tête de faune et coquille, linteau et dôme de pierre. Le bassin octogonal évoque le parfait mélange entre le carré (l'Humain) et le cercle (le Divin). Proche de l'hôpital, l'eau était autrefois considérée médicinale (1680).",
        latitude: 43.6086,
        longitude: 1.4011
    },
    {
        id: 56,
        name: "Fontaine du périphérique, Oncopole",
        address: "Rond-point Henri Sarramon, 31059 Toulouse",
        description: "Aménagement de rond-point moderne. Dite fontaine AZF ou du dépôt Tisseo.",
        details: "Aménagement de rond-point moderne. Dite fontaine AZF ou du dépôt Tisseo (Postérieur à 2010).",
        latitude: 43.5658,
        longitude: 1.4239
    },
];

export async function GET() {
    const establishments = fontainesData.map(f => ({
        name: `${f.id}. ${f.name}`,
        address: f.address,
        description: f.description,
        details: f.details || ""
    }));
    return NextResponse.json(establishments);
}
