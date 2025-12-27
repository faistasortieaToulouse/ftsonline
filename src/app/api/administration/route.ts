import { NextResponse } from "next/server";

// Imports relatifs (architecture conservée)
import mairies from "../../../../data/mairie/mairies.json";
import mairiesAnnexes from "../../../../data/mairie/mairies-annexes.json";
import mjd from "../../../../data/mairie/maison-de-la-justice-et-du-droit.json";
import mts from "../../../../data/mairie/maisons-toulouse-services.json";
import pad from "../../../../data/mairie/points-d-acces-au-droit.json";

/* =========================
   Helpers COMMUNE
========================= */

function getCommuneFromMJD(nom: string): string {
  if (nom.toLowerCase().includes("tournefeuille")) return "Tournefeuille";
  return "Toulouse";
}

function getCommuneFromPAD(item: any): string {
  if (item.commune_d_accueil) return item.commune_d_accueil;

  const lieu = (item.lieu ?? "").toLowerCase();

  if (lieu.includes("lamarck") || lieu.includes("gauguin")) return "Balma";
  if (lieu.includes("paul valéry")) return "Tournefeuille";

  return "Toulouse";
}

/* =========================
   API
========================= */

export async function GET() {
  const administrations = [
    // 🏛️ MAIRIES
    ...mairies.map((item: any) => ({
      categorie: "mairie",
      nom: item.mairie,
      adresse: `${item.num ?? ""} ${item.libelle ?? ""}`.trim(),
      commune: item.mairie,
      telephone: item.telephone,
      geo: item.geo_point_2d,
    })),

    // 🏢 MAIRIES ANNEXES (Toulouse)
    ...mairiesAnnexes.map((item: any) => ({
      categorie: "mairie_annexe",
      nom: item.mairie,
      adresse: `${item.num ?? ""} ${item.libelle ?? ""}`.trim(),
      commune: "Toulouse",
      telephone: item.telephone,
      geo: item.geo_point_2d,
    })),

    // ⚖️ MAISONS DE JUSTICE
    ...mjd.map((item: any) => ({
      categorie: "maison_justice",
      nom: item.maison_de_justice,
      adresse: item.lieu_d_implantation,
      commune: getCommuneFromMJD(item.maison_de_justice),
      telephone: item.renseignements,
      geo: item.geo_point_2d,
    })),

    // 🏙️ MAISONS TOULOUSE SERVICES
    ...mts.map((item: any) => ({
      categorie: "maison_toulouse_services",
      nom: item.nom,
      adresse: `${item.num_rue} ${item.nom_voie}`,
      commune: "Toulouse",
      telephone: item.telephone,
      geo: item.geo_point_2d,
    })),

    // ⚖️ POINTS D’ACCÈS AU DROIT
    ...pad.map((item: any) => ({
      categorie: "point_acces_droit",
      nom: item.lieu,
      adresse: item.lieu,
      commune: getCommuneFromPAD(item),
      telephone: item.n_telephone,
      geo: item.geo_point_2d,
    })),
  ];

  return NextResponse.json(administrations);
}
