import { NextResponse } from "next/server";

// Nouveau dataset demandé
const establishments = [
  { address: "6 allées Soupirs", name: "HLM" },
  { address: "1 allées Soupirs", name: "Cales du Radoub" },
  { address: "allées Demoiselles", name: "Villas allées Demoiselles" },
  { address: "2 & 4 rue des Pyrénées", name: "Maisons Martin (1910)" },
  { address: "8 & 10 rue des Pyrénées", name: "Villas" },
  { address: "7 rue des Pyrénées", name: "Maison" },
  { address: "18 rue des Pyrénées", name: "Maison" },
  { address: "20-22 rue des Pyrénées", name: "Maison" },
  { address: "26 rue des Pyrénées", name: "Maison" },
  { address: "21 rue Demouilles", name: "Toulousaine" },
  { address: "31 rue Demouilles", name: "Maison" },
  { address: "35 rue Demouilles", name: "Maison" },
  { address: "38 rue Demouilles", name: "Maison" },
  { address: "40 rue Demouilles", name: "Maison" },
  { address: "42 rue Demouilles", name: "Maison" },
  { address: "32-34 rue Saint-Philomène", name: "Maison" },
  { address: "22 rue Georges Picot", name: "Maison" },
  { address: "3 rue Félix Durrbach", name: "Maison" },
  { address: "43 allées des Demoiselles", name: "Maison d'Antoine Labit" },
  { address: "37 allées des Demoiselles", name: "Maison" },
  { address: "39 allées des Demoiselles", name: "Maison" },
  { address: "43 allées des Demoiselles", name: "Maison" },
  { address: "45 allées des Demoiselles", name: "Villa Tourelles" },
  { address: "9 rue André Delieux", name: "Maison" },
  { address: "14 rue André Delieux", name: "Maison" },
  { address: "10 rue Mondran", name: "Lycée Gabriel Péri" },
  { address: "10 rue Mondran", name: "Ancienne usine à chaussures Myrys" },
  { address: "rue des Martyrs de la Libération", name: "Rue Martyrs Libération" },
  { address: "21 rue Bégué-David", name: "Maison" },
  { address: "1 allées Paul Feuga", name: "Maison Seube (bourreau)" },
  { address: "7 allées Paul Feuga", name: "Maison" },
  { address: "5 rue des Trente-Six Ponts", name: "Maison" },
  { address: "25 rue des Trente-Six Ponts", name: "Maison" },
  { address: "47 rue des Trente-Six Ponts", name: "Maison" },
  { address: "38 rue des Trente-Six Ponts", name: "Ancienne école véto" },
  { address: "57 rue des Trente-Six Ponts", name: "Toulousaine" },
  { address: "66 rue des Trente-Six Ponts", name: "Maison" },
  { address: "68 rue des Trente-Six Ponts", name: "Maison" },
  { address: "1 rue Sainte-Catherine", name: "Chapelle Sainte-Catherine" },
  { address: "95 grande rue Saint-Michel", name: "Chapelle des Lazaristes (prison)" },
  { address: "1 rue des Abeilles", name: "Immeuble avec tourelle" }
];

export async function GET() {
  return NextResponse.json(establishments);
}
