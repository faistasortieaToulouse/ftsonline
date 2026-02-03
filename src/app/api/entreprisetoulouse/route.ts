import { NextResponse } from 'next/server';

export async function GET() {
  const resources = [
    {
      id: "sirene",
      title: "Base SIRENE - Toulouse Métropole",
      description: "Données brutes de l'Insee sur les établissements de la métropole : SIRET, code NAF, et état administratif.",
      url: "https://data.toulouse-metropole.fr/explore/dataset/base-sirene-v3/table/",
      type: "Données Publiques"
    },
    {
      id: "excellence  à Toulouse",
      title: "Pôles d'Excellence",
      description: "Le portail Invest in Toulouse présente les secteurs clés : aéronautique, spatial, santé et numérique.",
      url: "https://www.invest-in-toulouse.fr/",
      type: "Attractivité"
    },
    {
      id: "wttj",
      title: "Welcome to the Jungle, Entreprises à Toulouse",
      description: "Vitrine des entreprises qui recrutent à Toulouse : culture d'entreprise, photos des bureaux et offres d'emploi.",
      url: "https://www.welcometothejungle.com/fr/pages/companies-toulouse-31000",
      type: "Emploi"
    },
    {
      id: "annuaire",
      title: "Annuaire des Entreprises à Toulouse",
      description: "Outil gouvernemental de recherche rapide pour vérifier l'existence légale d'une entreprise en Haute-Garonne.",
      url: "https://annuaire-entreprises.data.gouv.fr/rechercher?cp_dep=31",
      type: "Administratif"
    }
  ];

  return NextResponse.json(resources);
}
