import { NextResponse } from "next/server";

interface Establishment {
  name: string;
  address: string;
}

const establishments: Establishment[] = [
  { name: "bâtiment remarquable", address: "1 rue Albert Lautman" },
  { name: "bâtiment remarquable", address: "3 rue Albert Lautman" },
  { name: "immeuble", address: "37 bd Armand Duportal" },
  { name: "immeuble", address: "49 bd Armand Duportal" },
  { name: "hôtel Baichère, tour", address: "7 rue Arts" },
  { name: "hôtel Nolet disp ?", address: "7 rue Arts" },
  { name: "hôtel Dupuy-Montaut", address: "10 rue Arts" },
  { name: "Collège Boulbonne, couvent, auj, imm. 1910 ?", address: "12 rue Arts" },
  { name: "couvent Dame Andouin : 14-16", address: "14 rue Arts" },
  { name: "bâtiment remarquable", address: "16 rue Arts" },
  { name: "hôtel Duranti disp ?", address: "17 rue Arts" },
  { name: "tours remparts romains : 1-5-11-17", address: "1-5-11-17 rue Bida" },
  { name: "fontaine Bienfaits de la Garonne", address: "place Boulbonne" },
  { name: "bâtiment remarquable", address: "13 rue Boulbonne" },
  { name: "Collège Boulbonne disp", address: "21 rue Boulbonne" },
  { name: "bâtiment remarquable", address: "42 rue Boulbonne" },
  { name: "fontaine Labatut (en face)", address: "50 rue Boulbonne" },
  { name: "mosaïque", address: "52 rue Boulbonne" },
  { name: "bâtiment remarquable", address: "9 rue Boule" },
  // Ajoute les autres adresses ici
];

export async function GET() {
  return NextResponse.json(establishments);
}
