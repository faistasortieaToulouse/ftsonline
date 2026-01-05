import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Noeud = {
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string | null;
  niveau_equivalent: string | null;
  enfants?: Noeud[];
};

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "hierarchie",
    "hierarchie Pape.json"
  );

  const raw = fs.readFileSync(filePath, "utf-8");
  const data: Noeud[] = JSON.parse(raw);

  // Index par personne
  const map = new Map<string, Noeud>();

  data.forEach((item) => {
    map.set(item.personne, { ...item, enfants: [] });
  });

  const racines: Noeud[] = [];

  map.forEach((item) => {
    if (item.superieur && map.has(item.superieur)) {
      map.get(item.superieur)!.enfants!.push(item);
    } else {
      racines.push(item);
    }
  });

  return NextResponse.json(racines);
}
