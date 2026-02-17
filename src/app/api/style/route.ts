import { NextResponse } from "next/server";

export async function GET() {
  const styles = [
    {
      id: "prehistoire",
      nom: "Architecture néolithique",
      periode: "Préhistoire",
      description:
        "Premières constructions monumentales liées aux pratiques rituelles et funéraires. Apparition des mégalithes.",
      caracteristiques: [
        "Dolmens et menhirs",
        "Pierres massives non taillées",
        "Fonction symbolique et religieuse"
      ]
    },
    {
      id: "egypte-antique",
      nom: "Architecture égyptienne antique",
      periode: "Antiquité",
      description:
        "Architecture monumentale associée au pouvoir divin et politique.",
      caracteristiques: [
        "Pyramides",
        "Temples monumentaux",
        "Colonnes massives",
        "Symbolisme religieux"
      ]
    },
    {
      id: "grecque-antique",
      nom: "Architecture grecque antique",
      periode: "Antiquité",
      description:
        "Architecture fondée sur l’harmonie, la proportion et les ordres classiques.",
      caracteristiques: [
        "Ordres dorique, ionique, corinthien",
        "Temples",
        "Symétrie",
        "Théâtres civiques"
      ]
    },
    {
      id: "romaine",
      nom: "Architecture romaine",
      periode: "Antiquité",
      description:
        "Développement de l’ingénierie et des infrastructures à grande échelle.",
      caracteristiques: [
        "Voûtes et arcs",
        "Coupoles",
        "Béton romain",
        "Aqueducs et amphithéâtres"
      ]
    },
{
  id: "pré-romane",
  nom: "Architecture pré-romane",
  periode: "750–950",
  description:
    "Architecture médiévale antérieure au style roman, caractérisée par des bâtiments de plans simples hérités des basiliques romaines.",
  caracteristiques: [
    "Plans droits et simples",
    "Influence des basiliques romaines",
    "Petits édifices religieux",
    "Transition entre Antiquité et roman"
  ]
},
    {
      id: "romane",
      nom: "Architecture romane",
      periode: "Moyen Âge (950–1130)",
      description:
        "Architecture massive caractérisée par des murs épais et des voûtes en pierre.",
      caracteristiques: [
        "Voûtes en berceau",
        "Petites ouvertures",
        "Murs épais",
        "Ambiance austère"
      ]
    },
    {
      id: "gothique",
      nom: "Architecture gothique",
      periode: "Moyen Âge (1130–1500)",
      description:
        "Architecture verticale favorisant la lumière et la hauteur.",
      caracteristiques: [
        "Arcs brisés",
        "Arcs-boutants",
        "Vitraux",
        "Grande élévation"
      ]
    },
    {
      id: "byzantine",
      nom: "Architecture byzantine",
      periode: "Moyen Âge",
      description:
        "Architecture religieuse centrée sur la coupole et la richesse décorative intérieure.",
      caracteristiques: [
        "Coupoles sur pendentifs",
        "Mosaïques dorées",
        "Intérieurs richement décorés"
      ]
    },
    {
      id: "islamique",
      nom: "Architecture islamique",
      periode: "Depuis le VIIe siècle",
      description:
        "Architecture religieuse et civile caractérisée par des décors géométriques et des mosquées à cour.",
      caracteristiques: [
        "Arcs en fer à cheval",
        "Minarets",
        "Décor géométrique",
        "Calligraphie"
      ]
    },
{
  id: "art-asturien",
  nom: "Art asturien",
  periode: "VIIIe–Xe siècle",
  description:
    "Style architectural développé dans le royaume des Asturies (nord de l’Espagne), caractérisé par des édifices religieux sobres et structurés.",
  caracteristiques: [
    "Églises de petite taille",
    "Voûtes en berceau",
    "Décor sculpté discret",
    "Influence wisigothique et romaine"
  ]
},
{
  id: "art-grotesque",
  nom: "Art grotesque",
  periode: "Moyen Âge",
  description:
    "Style décoratif caractérisé par des motifs fantastiques, hybrides ou caricaturaux, souvent présents dans la sculpture et l’ornement architectural.",
  caracteristiques: [
    "Figures hybrides et fantastiques",
    "Décor sculpté expressif",
    "Motifs symboliques ou satiriques",
    "Ornementation des portails et chapiteaux"
  ]
},
    {
      id: "renaissance",
      nom: "Architecture de la Renaissance",
      periode: "XVe–XVIe siècles",
      description:
        "Retour aux principes de l’Antiquité avec un souci de proportion et de symétrie.",
      caracteristiques: [
        "Dômes",
        "Colonnes et pilastres",
        "Symétrie",
        "Proportions mathématiques"
      ]
    },
    {
      id: "baroque",
      nom: "Architecture baroque",
      periode: "XVIIe siècle",
      description:
        "Architecture théâtrale et expressive, richement décorée.",
      caracteristiques: [
        "Façades ondulées",
        "Décor exubérant",
        "Jeux de lumière",
        "Mouvement"
      ]
    },
    {
      id: "classique",
      nom: "Architecture classique",
      periode: "XVIIe siècle",
      description:
        "Architecture rigoureuse et symétrique au service du pouvoir.",
      caracteristiques: [
        "Symétrie stricte",
        "Ordres antiques",
        "Frontons",
        "Rigueur géométrique"
      ]
    },
    {
      id: "neoclassique",
      nom: "Architecture néoclassique",
      periode: "1750–1830",
      description:
        "Retour épuré aux formes gréco-romaines.",
      caracteristiques: [
        "Colonnes monumentales",
        "Frontons triangulaires",
        "Sobriété décorative"
      ]
    },
    {
  id: "eclectisme-historicisme",
  nom: "Éclectisme & Historicisme",
  periode: "XIXe siècle",
  description:
    "Mouvement architectural combinant plusieurs styles historiques dans une même œuvre, favorisé par la révolution industrielle.",
  caracteristiques: [
    "Mélange de styles historiques (néogothique, néorenaissance, etc.)",
    "Utilisation du fer et du verre",
    "Architecture spectaculaire",
    "Développement des grandes structures publiques"
  ]
    },
    {
      id: "art-nouveau",
      nom: "Art nouveau",
      periode: "1890–1910",
      description:
        "Style décoratif inspiré de la nature et des formes organiques.",
      caracteristiques: [
        "Lignes courbes",
        "Motifs végétaux",
        "Asymétrie"
      ]
    },
    {
      id: "mouvement-moderne",
      nom: "Mouvement moderne et Bauhaus",
      periode: "XXe siècle",
      description:
        "Architecture fonctionnelle rejetant l’ornement.",
      caracteristiques: [
        "Béton, acier, verre",
        "Fonctionnalisme",
        "Toits plats",
        "Volumes simples"
      ]
    },
    {
      id: "art-deco",
      nom: "Art déco",
      periode: "1920–1930",
      description:
        "Style géométrique élégant associé à la modernité industrielle.",
      caracteristiques: [
        "Formes en zigzag",
        "Décor stylisé",
        "Contrastes marqués"
      ]
    },
    {
      id: "brutalisme",
      nom: "Brutalisme",
      periode: "1950–1970",
      description:
        "Architecture massive mettant en avant le béton brut.",
      caracteristiques: [
        "Béton apparent",
        "Volumes imposants",
        "Expression structurelle"
      ]
    },
    {
      id: "postmodernisme",
      nom: "Postmodernisme",
      periode: "Fin XXe siècle",
      description:
        "Retour à l’ornement et aux références historiques avec une dimension ironique.",
      caracteristiques: [
        "Décor réintroduit",
        "Éclectisme",
        "Références au passé"
      ]
    },
{
  id: "deconstructivisme",
  nom: "Architecture déconstructiviste",
  periode: "Années 1980 – 2000",
  description:
    "Courant architectural caractérisé par des formes fragmentées, des volumes disloqués et une apparente instabilité, remettant en question les principes traditionnels d’ordre et d’harmonie.",
  caracteristiques: [
    "Formes éclatées",
    "Volumes asymétriques",
    "Impression de mouvement",
    "Rupture avec la géométrie classique",
    "Complexité structurelle"
  ]
},
    {
      id: "high-tech",
      nom: "Architecture high-tech",
      periode: "Depuis les années 1970",
      description:
        "Architecture exposant ses éléments techniques et structurels.",
      caracteristiques: [
        "Structure apparente",
        "Acier et verre",
        "Technologie visible"
      ]
    },
{
  id: "architecture-asiatique",
  nom: "Architecture asiatique",
  periode: "Antiquité à aujourd’hui",
  description:
    "Ensemble des traditions architecturales d’Asie marquées par une forte dimension spirituelle et symbolique.",
  caracteristiques: [
    "Spiritualité forte",
    "Usage important du bois (Chine, Japon)",
    "Plans symboliques et cosmologiques",
    "Richesse décorative (Inde, Khmer)"
  ]
},
{
  id: "architecture-precolombienne",
  nom: "Architecture précolombienne",
  periode: "Avant le XVIe siècle",
  description:
    "Architecture monumentale développée par les civilisations d’Amérique centrale et du Sud avant la colonisation européenne.",
  caracteristiques: [
    "Pyramides à degrés",
    "Urbanisme planifié",
    "Fonction religieuse et astronomique",
    "Intégration au paysage naturel"
  ]
},
{
  id: "blob-architecture",
  nom: "Blob architecture",
  periode: "Années 1990 – XXIe siècle",
  description:
    "Architecture caractérisée par des formes organiques, fluides et biomorphiques rendues possibles par la modélisation numérique.",
  caracteristiques: [
    "Formes courbes et organiques",
    "Absence d’angles droits",
    "Utilisation de logiciels de modélisation 3D",
    "Structures innovantes"
  ]
},
{
  id: "architecture-bioclimatique",
  nom: "Architecture bioclimatique",
  periode: "Fin XXe siècle – XXIe siècle",
  description:
    "Approche architecturale visant à adapter le bâtiment à son environnement climatique afin de réduire son impact énergétique et environnemental.",
  caracteristiques: [
    "Optimisation de l’ensoleillement",
    "Ventilation naturelle",
    "Matériaux écologiques",
    "Performance énergétique",
    "Intégration au site"
  ]
},
    {
      id: "contemporaine",
      nom: "Architecture contemporaine",
      periode: "XXIe siècle",
      description:
        "Architecture intégrant innovation technologique et enjeux environnementaux.",
      caracteristiques: [
        "Architecture durable",
        "Formes libres",
        "Technologies numériques",
        "Performance énergétique"
      ]
    }
  ];

  return NextResponse.json(styles);
}
