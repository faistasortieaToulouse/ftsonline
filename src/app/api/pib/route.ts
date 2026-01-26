import { NextResponse } from "next/server";

export async function GET() {
  const pibData = [
    {
      title: "PIB Nominal",
      description: "Classement mondial des pays selon la valeur de tous les biens et services produits en une année.",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_par_PIB_nominal",
    },
    {
      title: "PIB (PPA)",
      description: "PIB ajusté selon la parité de pouvoir d'achat pour comparer le niveau de vie réel.",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_par_PIB_(PPA)",
    },
    {
      title: "PIB Nominal par habitant",
      description: "Valeur du PIB divisée par le nombre d'habitants.",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_par_PIB_nominal_par_habitant",
    },
    {
      title: "PIB (PPA) par habitant",
      description: "Le meilleur indicateur pour comparer la richesse individuelle moyenne par pays.",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_par_PIB_(PPA)_par_habitant",
    },
  ];

  return NextResponse.json(pibData);
}