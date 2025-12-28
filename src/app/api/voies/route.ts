import { NextResponse } from "next/server";
import voies from "../../../../data/mairie/nomenclature-des-voies-libelles-officiels-et-en-occitan.json";

export interface VoieAPI {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
}

/**
 * Supprime le type de voie pour un tri "intelligent"
 * ex: "ALL EMILIE DU CHATELET" → "EMILIE DU CHATELET"
 */
function normalizeLibelle(libelle: string): string {
  return libelle.replace(
    /^(ALL|RUE|AV|BD|PL|CHEM|IMP|SQ|RPT|PROM|ESPA|PRV)\s+/i,
    ""
  );
}

export async function GET() {
  const data: VoieAPI[] = voies
    .sort((a: any, b: any) =>
      normalizeLibelle(a.libelle).localeCompare(
        normalizeLibelle(b.libelle),
        "fr",
        { sensitivity: "base" }
      )
    )
    .map((v: any, index: number) => ({
      id: index,
      libelle: v.libelle,
      libelle_occitan: v.libelle_occitan,
      quartier: v.quartier,
      territoire: v.territoire,
      complement: v.complement,
      complement_occitan: v.complement_occitan,
      sti: v.sti,
    }));

  return NextResponse.json(data);
}
