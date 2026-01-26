import { NextResponse } from "next/server";

export async function GET() {
  const links = [
    {
      id: 1,
      title: "Billets 1€ - Site Officiel TER",
      url: "https://www.ter.sncf.com/occitanie/tarifs-cartes/billets-un-euro",
      description: "Le portail direct pour réserver vos billets à 1 euro en Occitanie.",
      category: "Réservation"
    },
    {
      id: 2,
      title: "Fairtiq",
      url: "https://fairtiq.com/fr/",
      description: "L'application pour voyager sans billet papier, idéale pour les trajets lio.",
      category: "Application"
    },
    {
      id: 3,
      title: "SNCF Connect",
      url: "https://www.sncf-connect.com/",
      description: "Achat de billets et consultation des horaires en temps réel.",
      category: "Réservation"
    },
    {
      id: 4,
      title: "Trainline",
      url: "https://www.thetrainline.com/fr/compagnies-ferroviaires/ter/train-1-euro",
      description: "Alternative pour comparer et acheter vos billets TER à petit prix.",
      category: "Comparateur"
    },
    {
      id: 5,
      title: "Tourisme Occitanie",
      url: "https://www.tourisme-occitanie.com/pratique/transports/venir-en-train/profitez-des-week-ends-lio-train-a-1-euro/",
      description: "Informations pratiques sur les week-ends à 1 euro et idées de sorties.",
      category: "Infos & Tourisme"
    }
  ];

  return NextResponse.json(links);
}
