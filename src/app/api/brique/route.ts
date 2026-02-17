import { NextResponse } from 'next/server';

export async function GET() {
  const histoireArchiToulouse = [
    {
      id: "tolosa-romaine",
      époque: "Antiquité (Ier - Ve siècle)",
      titre: "Palladia Tolosa",
      description: "Fondation de la cité romaine. Utilisation massive de la brique plate et des galets de la Garonne pour les remparts et les thermes.",
      points_cles: ["Rempart gallo-romain", "Théâtre antique (sous l'actuel hôpital Larrey)", "Brique foraine primitive"]
    },
    {
      id: "roman-toulousain",
      époque: "Moyen Âge (XIe - XIIe siècle)",
      titre: "L'Apogée de l'Art Roman",
      description: "Toulouse devient une étape majeure du pèlerinage de Compostelle. Invention de la sculpture romane monumentale et des grandes basiliques à déambulatoire.",
      points_cles: ["Basilique Saint-Sernin (plus grande église romane d'Europe)", "Cloître du Musée des Augustins", "Abbatiale de la Daurade (vestiges)"]
    },
    {
      id: "gothique-meridional",
      époque: "Moyen Âge (XIIIe - XIVe siècle)",
      titre: "Le Gothique Méridional",
      description: "Style unique né de la lutte contre l'hérésie cathare. Austérité extérieure, nef unique immense et clochers octogonaux typiques.",
      points_cles: ["Couvent des Jacobins", "Basilique Saint-Sernin (Transition)", "Cathédrale Saint-Étienne"]
    },
    {
      id: "renaissance-pastel",
      époque: "Renaissance (XVIe siècle)",
      titre: "L'Âge d'Or du Pastel",
      description: "L'époque des grands marchands. Construction d'hôtels particuliers somptueux avec des tours d'escalier visibles de loin, symboles de puissance.",
      points_cles: ["Hôtel d'Assézat", "Hôtel de Bernuy", "Nicolas Bachelier (Architecte)"]
    },
    {
      id: "classicisme-lumieres",
      époque: "XVIIIe siècle",
      titre: "L'Ordonnancement Classique",
      description: "Uniformisation des façades et création des grandes places. La brique est parfois recouverte d'enduit blanc pour imiter la pierre parisienne.",
      points_cles: ["Place du Capitole", "Quai de la Daurade", "Pont-Neuf (achevé en 1632)"]
    },
{
  id: "art-nouveau-toulouse",
  époque: "Fin XIXe - Début XXe siècle",
  titre: "L'Art Nouveau & Ornementation",
  description: "Apparition des courbes organiques et de la faïence colorée. Les architectes utilisent la terre cuite moulée pour créer des décors végétaux exubérants.",
  points_cles: ["Immeuble des sœurs de la Charité (rue de la République)", "Villas du quartier Busca", "Manufacture Virebent (décors)"]
},
{
  id: "art-deco-toulouse",
  époque: "Années 1920 - 1930",
  titre: "La Modernité Art Déco",
  description: "Style géométrique et rigoureux. Utilisation du béton armé alliée à la brique pour des bâtiments publics massifs et élégants.",
  points_cles: ["Bibliothèque d'Étude et du Patrimoine (Périgord)", "Parc des Expositions (anciennes halles)", "La Poste centrale (rue Kennedy)"]
},
    {
      id: "modernisme-industriel",
      époque: "XXe siècle",
      titre: "Béton et Brique Rouge",
      description: "L'arrivée des structures modernes qui réinterprètent le matériau traditionnel. Architecture de l'aéronautique et des grands ensembles.",
      points_cles: ["Quartier du Mirail (Candilis)", "Médiathèque José Cabanis", "La Halle de la Machine"]
    },
{
  id: "toulouse-contemporaine",
  époque: "XXIe siècle (2000 - 2026)",
  titre: "Innovation & Durabilité",
  description: "Réinterprétation de la brique, architectures de verre et de métal, et naissance de nouveaux quartiers durables. Toulouse cherche l'équilibre entre densité urbaine et respect de son identité rose.",
  points_cles: ["Médiathèque José Cabanis (Architecture signal)", "Quartier de la Cartoucherie", "MEETT (Nouveau Parc des Expos)"]
}
  ];

  return NextResponse.json(histoireArchiToulouse);
}
